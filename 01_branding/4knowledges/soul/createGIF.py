#!/usr/bin/env python3
"""
folder2anim.py — Group images by dimensions and export animations (GIF/WebP).

A didactic image-to-animation converter that demonstrates best practices for:
- Alpha channel preservation in images
- Interactive CLI design with Rich library
- Professional error handling and logging
- Modular code structure for maintainability

Features:
• Self-aware: operates on the folder where THIS script/executable lives
• Scans only that folder (non-recursive) for images, groups them by WxH
• Interactive Rich UI to pick a group, preview counts, and export
• Preserves alpha channels when converting to supported formats
• Options for frame rate, order by creation date (with optional reverse)
• Interactive prompts for output format and resizing preferences
• Output file name defaults to the folder name, with chosen extension

Usage Examples:
  python folder2anim.py                 # Interactive mode with all prompts
  python folder2anim.py --format webp --fps 12
  python folder2anim.py --group 1 --resize 1080x1080
  python folder2anim.py --reverse --format gif --fps 6

Exit Codes:
  0: Success
  1: No images found or invalid images
  2: Invalid user input or configuration
  3: Animation save error

Technical Notes:
- WebP format preserves alpha channels (RGBA)
- GIF format uses palette mode for smaller file sizes
- EXIF orientation is automatically corrected
- Creation time sorting is Windows-compatible with fallback
"""
from __future__ import annotations

import sys
import os
import logging
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import click
from PIL import Image, ImageOps
from PIL.Image import Resampling
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.progress import Progress, TextColumn, BarColumn, TimeElapsedColumn

# -------------------------------
# Configuration & Constants
# -------------------------------
SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}
DEFAULT_FPS = 8
DEFAULT_QUALITY = 80
MAX_FPS = 60

# Set up logging following Miguel's standards
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

console = Console()


# -------------------------------
# Helpers
# -------------------------------

def get_base_dir() -> Path:
    """Return the folder where this program resides (works for script or PyInstaller exe)."""
    if getattr(sys, "frozen", False) and hasattr(sys, "executable"):
        # PyInstaller or similar
        return Path(sys.executable).resolve().parent
    try:
        return Path(__file__).resolve().parent
    except NameError:
        # Fallback if __file__ is not available
        return Path(os.getcwd()).resolve()


def discover_images(folder: Path) -> List[Path]:
    files: List[Path] = []
    for p in folder.iterdir():
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTS:
            # skip previously generated animation by this tool if name matches folder base
            files.append(p)
    return files


def get_image_size(img_path: Path) -> Optional[Tuple[int, int]]:
    """
    Extract image dimensions safely with comprehensive error handling.
    
    Args:
        img_path: Path to the image file
        
    Returns:
        Tuple of (width, height) or None if image cannot be read
        
    Note:
        Uses PIL's lazy loading to avoid memory issues with large images
    """
    try:
        with Image.open(img_path) as im:
            return im.size  # (width, height)
    except Exception as e:
        logger.warning(f"Could not read image {img_path}: {e}")
        return None


def has_alpha_channel(img_path: Path) -> bool:
    """
    Check if an image has an alpha channel (transparency).
    
    Args:
        img_path: Path to the image file
        
    Returns:
        True if the image has an alpha channel, False otherwise
        
    Note:
        This is used to determine optimal conversion strategy
    """
    try:
        with Image.open(img_path) as im:
            return im.mode in ('RGBA', 'LA', 'PA')
    except Exception:
        return False


def group_by_dimensions(paths: Iterable[Path]) -> Dict[Tuple[int, int], List[Path]]:
    """
    Group image paths by their dimensions for batch processing.
    
    Args:
        paths: Iterable of image file paths
        
    Returns:
        Dictionary mapping (width, height) tuples to lists of matching files
        
    Example:
        {(1920, 1080): [img1.png, img2.jpg], (800, 600): [img3.png]}
    """
    groups: Dict[Tuple[int, int], List[Path]] = {}
    for p in paths:
        size = get_image_size(p)
        if size is None:
            continue
        groups.setdefault(size, []).append(p)
    return groups


def parse_whxhh(s: str) -> Tuple[int, int]:
    if "x" not in s.lower():
        raise ValueError("Expected format WIDTHxHEIGHT, e.g., 1080x1080")
    w_str, h_str = s.lower().split("x", 1)
    w, h = int(w_str.strip()), int(h_str.strip())
    if w <= 0 or h <= 0:
        raise ValueError("Width/height must be positive integers")
    return w, h


def sort_by_ctime(paths: List[Path], reverse: bool) -> List[Path]:
    try:
        return sorted(paths, key=lambda p: p.stat().st_ctime, reverse=reverse)
    except Exception:
        # Fallback to name sort if ctime not available
        return sorted(paths, key=lambda p: p.name.lower(), reverse=reverse)


def unique_output_path(base_dir: Path, ext: str, overwrite: bool) -> Path:
    """
    Generate a unique output file path, avoiding conflicts.
    
    Args:
        base_dir: Directory where the output file will be created
        ext: File extension (without dot)
        overwrite: If True, allows overwriting existing files
        
    Returns:
        Path object for the output file
        
    Example:
        unique_output_path(Path("/images"), "gif", False)
        # Returns: /images/images.gif or /images/images_1.gif if exists
    """
    base_name = base_dir.name
    out = base_dir / f"{base_name}.{ext}"
    if overwrite or not out.exists():
        return out
    
    # Find a unique suffix to avoid overwriting
    i = 1
    while True:
        candidate = base_dir / f"{base_name}_{i}.{ext}"
        if not candidate.exists():
            return candidate
        i += 1


def ask_user_preferences(non_interactive: bool) -> Tuple[str, Optional[Tuple[int, int]]]:
    """
    Interactively ask user for output format and resize preferences.
    
    Args:
        non_interactive: If True, skip prompts and use defaults
        
    Returns:
        Tuple of (format_choice, resize_dimensions)
        
    Note:
        This implements Miguel's preference for interactive learning
        and presenting options with clear explanations
    """
    if non_interactive:
        return "gif", None
        
    console.print("\n[bold cyan]Output Format Selection[/]")
    console.print("• [green]GIF[/]: Widely supported, smaller files, limited colors")
    console.print("• [green]WebP[/]: Modern format, better quality, full alpha support")
    
    fmt_choice = Prompt.ask(
        "Choose output format", 
        choices=["gif", "webp"], 
        default="gif"
    )
    
    console.print(f"\n[bold cyan]Resize Options[/]")
    console.print("• Press Enter to keep original dimensions")
    console.print("• Enter WIDTHxHEIGHT (e.g., 1080x1080) to resize all frames")
    
    resize_input = Prompt.ask(
        "Resize dimensions (optional)", 
        default=""
    ).strip()
    
    resize_to = None
    if resize_input:
        try:
            resize_to = parse_whxhh(resize_input)
            console.print(f"✓ Will resize to {resize_to[0]}x{resize_to[1]}")
        except ValueError as e:
            console.print(f"[yellow]Warning: {e}. Using original dimensions.[/]")
            
    return fmt_choice, resize_to


def load_frames_safely(
    paths: List[Path], 
    resize_to: Optional[Tuple[int, int]], 
    target_format: str
) -> List[Image.Image]:
    """
    Load and process image frames with comprehensive alpha channel preservation.
    
    This function demonstrates best practices for:
    - Safe image loading with proper error handling
    - Alpha channel preservation across different formats
    - Memory-efficient processing of large image sequences
    - Professional logging for debugging
    
    Args:
        paths: List of image file paths to load in sequence
        resize_to: Optional target size as (width, height) tuple
        target_format: Target animation format ('gif' or 'webp')
        
    Returns:
        List of processed PIL Image objects ready for animation
        
    Raises:
        ValueError: If no valid frames could be loaded
        
    Technical Implementation Notes:
        - WebP format: Preserves full RGBA alpha channels
        - GIF format: Converts RGBA to RGB with white background (GIF limitation)
        - Uses LANCZOS resampling for highest quality resizing
        - Applies EXIF orientation correction automatically
        - Creates defensive copies to prevent context manager issues
    """
    frames: List[Image.Image] = []
    failed_count = 0
    
    for path_idx, img_path in enumerate(paths):
        try:
            with Image.open(img_path) as raw_image:
                # Apply EXIF orientation correction first
                processed_image = ImageOps.exif_transpose(raw_image)
                
                # Ensure we have a valid image after orientation correction
                if processed_image is None:
                    processed_image = raw_image.copy()
                
                # Resize using high-quality resampling if requested
                if resize_to is not None:
                    processed_image = processed_image.resize(
                        resize_to, 
                        Resampling.LANCZOS
                    )
                
                # Handle format-specific conversions with alpha preservation
                if target_format.lower() == "gif":
                    processed_image = _convert_for_gif(processed_image)
                elif target_format.lower() == "webp":
                    processed_image = _convert_for_webp(processed_image)
                else:
                    # Fallback: preserve maximum quality
                    processed_image = _ensure_rgba(processed_image)
                
                # Create defensive copy and add to frames
                frames.append(processed_image.copy())
                
                logger.debug(f"Loaded frame {path_idx + 1}/{len(paths)}: {img_path.name}")
                
        except Exception as error:
            failed_count += 1
            logger.error(f"Failed to load {img_path}: {error}")
            continue
    
    if not frames:
        raise ValueError("No valid frames could be loaded from the provided images")
        
    if failed_count > 0:
        logger.warning(f"Successfully loaded {len(frames)} frames, "
                      f"failed to load {failed_count} images")
    
    return frames


def _convert_for_gif(image: Image.Image) -> Image.Image:
    """Convert image optimally for GIF format (palette mode)."""
    if image.mode in ('RGBA', 'LA'):
        # GIF doesn't support alpha, composite with white background
        background = Image.new('RGB', image.size, (255, 255, 255))
        if image.mode == 'RGBA':
            background.paste(image, mask=image.split()[-1])
        else:  # LA mode
            background.paste(image)
        image = background
    
    # Convert to palette mode for smaller GIF files
    return image.convert("P", palette=Image.Palette.ADAPTIVE)


def _convert_for_webp(image: Image.Image) -> Image.Image:
    """Convert image optimally for WebP format (preserving alpha)."""
    if image.mode not in ('RGBA', 'RGB'):
        return image.convert("RGBA")
    return image


def _ensure_rgba(image: Image.Image) -> Image.Image:
    """Ensure image is in RGBA mode for maximum compatibility."""
    if image.mode != 'RGBA':
        return image.convert("RGBA")
    return image


def save_animation(
    frames: List[Image.Image],
    out_path: Path,
    fps: int,
    fmt: str,
    quality: int,
) -> None:
    if not frames:
        raise ValueError("No frames to save")
    duration_ms = max(1, int(1000 / max(1, fps)))
    first, rest = frames[0], frames[1:]

    if fmt == "gif":
        first.save(
            out_path,
            save_all=True,
            append_images=rest,
            duration=duration_ms,
            loop=0,
            disposal=2,
            optimize=True,
            format="GIF",
        )
    elif fmt == "webp":
        first.save(
            out_path,
            format="WEBP",
            save_all=True,
            append_images=rest,
            duration=duration_ms,
            loop=0,
            quality=quality,
            method=6,  # slower, better compression
        )
    else:
        raise ValueError(f"Unsupported format: {fmt}")


# -------------------------------
# CLI
# -------------------------------
@click.command(context_settings={"help_option_names": ["-h", "--help"]})
@click.option(
    "--format",
    "fmt",
    type=click.Choice(["gif", "webp"], case_sensitive=False),
    default=None,
    help="Output animation format. If not specified, will prompt interactively.",
)
@click.option(
    "--fps",
    type=click.IntRange(1, MAX_FPS),
    default=DEFAULT_FPS,
    show_default=True,
    help="Frames per second for the animation.",
)
@click.option(
    "--resize",
    type=str,
    default=None,
    help="Resize all frames to WIDTHxHEIGHT (e.g., 1080x1080). Interactive prompt if not specified.",
)
@click.option(
    "--group",
    type=str,
    default=None,
    help="Select image group by index (e.g., '1') or dimensions (e.g., '1920x1080').",
)
@click.option(
    "--reverse/--no-reverse",
    default=False,
    show_default=True,
    help="Reverse chronological order (newest first).",
)
@click.option(
    "--overwrite/--no-overwrite",
    default=False,
    show_default=True,
    help="Overwrite existing output file without confirmation.",
)
@click.option(
    "--quality",
    type=click.IntRange(1, 100),
    default=DEFAULT_QUALITY,
    show_default=True,
    help="WebP quality setting (1-100, ignored for GIF).",
)
@click.option(
    "--non-interactive/--interactive",
    default=False,
    show_default=True,
    help="Skip all prompts; use defaults or fail if required options missing.",
)
@click.option(
    "--dry-run/--no-dry-run",
    default=False,
    show_default=True,
    help="Preview the export plan without creating any files.",
)
@click.option(
    "--verbose/--quiet",
    default=False,
    show_default=True,
    help="Enable detailed logging output for debugging.",
)
@click.version_option(version="2.0.0", prog_name="folder2anim")
def main(
    fmt: Optional[str],
    fps: int,
    resize: Optional[str],
    group: Optional[str],
    reverse: bool,
    overwrite: bool,
    quality: int,
    non_interactive: bool,
    dry_run: bool,
    verbose: bool,
) -> None:
    """
    Advanced image-to-animation converter with interactive features.
    
    This tool demonstrates professional Python development practices:
    - Interactive CLI design with educational prompts
    - Comprehensive error handling and logging
    - Alpha channel preservation across formats
    - Modular, well-documented code structure
    
    When run without arguments, it provides an interactive experience
    that guides users through format selection and customization options.
    """
    # Configure logging based on verbosity preference
    if verbose:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.info("Verbose logging enabled")
    
    base_dir = get_base_dir()

    console.print(Panel.fit(
        f"[bold cyan]folder2anim v2.0[/] — Advanced Animation Creator\n"
        f"[dim]📁 Scanning: [bold]{base_dir}[/]",
        subtitle="🎬 Groups images by dimensions → Creates smooth animations",
    ))

    images = discover_images(base_dir)
    if not images:
        console.print("[yellow]No supported images were found in this folder.[/]")
        sys.exit(1)

    groups = group_by_dimensions(images)
    if not groups:
        console.print("[yellow]No valid images could be opened.[/]")
        sys.exit(1)

    # Present groups
    sizes_sorted = sorted(groups.keys(), key=lambda wh: (wh[0] * wh[1], wh[0], wh[1]), reverse=True)
    t = Table(title="Discovered groups (by dimensions)")
    t.add_column("#", justify="right", style="bold")
    t.add_column("Dimensions", justify="center")
    t.add_column("Count", justify="right")
    t.add_column("Sample file")

    for idx, wh in enumerate(sizes_sorted, start=1):
        files = groups[wh]
        t.add_row(str(idx), f"{wh[0]}x{wh[1]}", str(len(files)), files[0].name)
    console.print(t)

    # Resolve target group
    selected_wh: Optional[Tuple[int, int]] = None
    if group:
        # User provided an index or WxH
        try:
            if group.isdigit():
                gi = int(group)
                if not (1 <= gi <= len(sizes_sorted)):
                    raise ValueError
                selected_wh = sizes_sorted[gi - 1]
            else:
                selected_wh = parse_whxhh(group)
                if selected_wh not in groups:
                    raise ValueError
        except Exception:
            console.print("[red]Invalid --group value. Use an index like '1' or 'WIDTHxHEIGHT'.[/]")
            sys.exit(2)
    else:
        if non_interactive:
            console.print("[red]--non-interactive set but no --group provided.[/]")
            sys.exit(2)
        # Ask interactively
        choice = Prompt.ask(
            "Pick a group by index (or type dimensions like 1920x1080)",
            default="1",
        )
        if choice.isdigit():
            gi = int(choice)
            if not (1 <= gi <= len(sizes_sorted)):
                console.print("[red]Invalid choice index.[/]")
                sys.exit(2)
            selected_wh = sizes_sorted[gi - 1]
        else:
            try:
                selected_wh = parse_whxhh(choice)
                if selected_wh not in groups:
                    console.print("[red]No such dimension group exists here.[/]")
                    sys.exit(2)
            except Exception as e:
                console.print(f"[red]{e}[/]")
                sys.exit(2)

    assert selected_wh is not None
    selected_files = groups[selected_wh]

    # Sort by creation time (Windows-friendly). Reverse if requested.
    ordered = sort_by_ctime(selected_files, reverse=reverse)

    # Interactive user preference gathering
    final_fmt = fmt
    resize_to: Optional[Tuple[int, int]] = None
    
    if not non_interactive and (not fmt or not resize):
        console.print("\n[bold cyan]🎨 Let's customize your animation![/]")
        interactive_fmt, interactive_resize = ask_user_preferences(non_interactive)
        
        # Use interactive choices if not provided via CLI
        if not fmt:
            final_fmt = interactive_fmt
        if not resize:
            resize_to = interactive_resize
    
    # Ensure we have a format (fallback to gif)
    if not final_fmt:
        final_fmt = "gif"
        
    # Parse resize option if provided via command line
    if resize and not resize_to:
        try:
            resize_to = parse_whxhh(resize)
        except Exception as e:
            console.print(f"[red]Invalid --resize value: {e}[/]")
            sys.exit(2)

    # Show comprehensive execution plan
    plan_table = Table(title="🚀 Animation Export Plan")
    plan_table.add_column("Property", style="bold cyan")
    plan_table.add_column("Value", style="green")
    
    plan_table.add_row("Source Group", f"{selected_wh[0]}x{selected_wh[1]} ({len(ordered)} frames)")
    plan_table.add_row("Frame Order", "Creation time" + (" (reversed)" if reverse else ""))
    plan_table.add_row("Output Format", final_fmt.upper())
    plan_table.add_row("Frame Rate", f"{fps} FPS")
    plan_table.add_row("Resize Target", f"{resize_to[0]}x{resize_to[1]}" if resize_to else "Original dimensions")
    
    # Alpha channel analysis for user education
    alpha_count = sum(1 for p in ordered if has_alpha_channel(p))
    if alpha_count > 0:
        alpha_note = f"{alpha_count}/{len(ordered)} images have transparency"
        if final_fmt == "gif":
            alpha_note += " (will be flattened to white background)"
        else:
            alpha_note += " (will be preserved)"
        plan_table.add_row("Alpha Channels", alpha_note)

    out_path = unique_output_path(base_dir, final_fmt.lower(), overwrite)
    plan_table.add_row("Output File", str(out_path.name))

    if final_fmt == "webp":
        plan_table.add_row("WebP Quality", f"{quality}% (lossless alpha)")

    console.print(plan_table)

    if dry_run:
        console.print("\n[green]✅ Dry run complete: No files were written.[/]")
        console.print(f"[dim]Would create: {out_path}[/]")
        sys.exit(0)

    if not non_interactive:
        ok = Confirm.ask("\n🎬 Ready to create your animation?", default=True)
        if not ok:
            console.print("[yellow]Animation creation cancelled by user.[/]")
            sys.exit(0)

    # Load and process frames with progress indication
    console.print(f"\n[bold blue]📁 Loading {len(ordered)} frames...[/]")
    
    try:
        with Progress(
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            TimeElapsedColumn(),
            transient=True,
        ) as progress:
            task = progress.add_task("Processing images", total=len(ordered))
            
            frames = load_frames_safely(ordered, resize_to, final_fmt)
            
            progress.advance(task, len(ordered))
            
    except ValueError as e:
        console.print(f"[red]❌ Error loading frames: {e}[/]")
        sys.exit(3)
    except Exception as e:
        console.print(f"[red]❌ Unexpected error during frame loading: {e}[/]")
        logger.exception("Frame loading failed")
        sys.exit(3)

    # Save animation
    try:
        save_animation(frames, out_path, fps=fps, fmt=final_fmt.lower(), quality=quality)
    except Exception as e:
        console.print(f"[red]Failed to save animation: {e}[/]")
        sys.exit(3)

    console.print(Panel.fit(
        f"[bold green]🎉 Animation created successfully![/]\n\n"
        f"📄 File: [bold]{out_path.name}[/]\n"
        f"🎬 Frames: [bold]{len(frames)}[/] at [bold]{fps} FPS[/]\n"
        f"📐 Format: [bold]{final_fmt.upper()}[/]" + 
        (f" (Quality: {quality}%)" if final_fmt == "webp" else "") + "\n"
        f"💾 Size: [bold]{out_path.stat().st_size / 1024:.1f} KB[/]",
        subtitle=f"💫 Ready to share your animation!",
    ))
    
    # Educational tip for next steps
    if not non_interactive:
        console.print(f"\n[dim]💡 Tip: You can now share {out_path.name} or embed it in web pages![/]")
        if final_fmt == "webp":
            console.print("[dim]   WebP provides better quality but check browser compatibility for your audience.[/]")
        else:
            console.print("[dim]   GIF format is universally supported across all platforms and browsers.[/]")


if __name__ == "__main__":
    main()
