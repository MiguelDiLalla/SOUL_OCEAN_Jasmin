# filepath: c:\Users\User\Projects_Unprotected\MiguelDiLalla.github.io\assets\images\collage\TurnToWepP.py
# This script gets all the available images in its own parent folder and outputs them to the same directory as optimized and resized .webp files
# It uses rich logging and colorama for colored output in the console

import os
import sys
from pathlib import Path
from PIL import Image
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, TaskID
from rich.prompt import Prompt, Confirm
from rich.table import Table
from colorama import init, Fore, Style

# Initialize colorama for cross-platform colored terminal output
init()

# Create Rich console
console = Console()

# Define supported image formats
SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']

def get_image_files(directory):
    """Get all image files from the specified directory.
    
    Args:
        directory (str): Directory path to search for images
        
    Returns:
        list: List of image file paths
    """
    image_files = []
    
    try:
        for file in os.listdir(directory):
            file_path = os.path.join(directory, file)
            if os.path.isfile(file_path):
                ext = os.path.splitext(file)[1].lower()
                if ext in SUPPORTED_FORMATS and not file.endswith('.webp'):
                    image_files.append(file_path)
    except Exception as e:
        console.print(f"[bold red]Error reading directory:[/bold red] {str(e)}")
        
    return image_files

def convert_to_webp(file_path, quality=80, resize=None):
    """Convert an image to WebP format with optimization.
    
    Args:
        file_path (str): Path to the image file
        quality (int, optional): WebP quality (0-100). Defaults to 80.
        resize (tuple, optional): New size (width, height) or None for no resize
        
    Returns:
        str: Path to the converted WebP file
    """
    try:
        # Get the output filename (same name but .webp extension)
        output_path = os.path.splitext(file_path)[0] + '.webp'
        
        # Open and convert the image
        with Image.open(file_path) as img:
            # Resize if needed
            if resize and isinstance(resize, tuple) and len(resize) == 2:
                img = img.resize(resize, Image.LANCZOS)
                
            # Save as WebP with optimization
            img.save(output_path, 'WEBP', quality=quality, method=6)
            
        return output_path
    except Exception as e:
        console.print(f"[bold red]Error converting {os.path.basename(file_path)}:[/bold red] {str(e)}")
        return None

def process_images(image_files, quality=80, max_width=None):
    """Process multiple images, converting them to WebP format.
    
    Args:
        image_files (list): List of image file paths
        quality (int, optional): WebP quality (0-100). Defaults to 80.
        max_width (int, optional): Maximum width to resize to, preserving aspect ratio
        
    Returns:
        list: List of converted file paths
    """
    converted_files = []
    total_savings = 0
    
    with Progress() as progress:
        task = progress.add_task("[cyan]Converting images to WebP...", total=len(image_files))
        
        for file_path in image_files:
            original_size = os.path.getsize(file_path)
            file_name = os.path.basename(file_path)
            
            # Determine resize dimensions if max_width is specified
            resize = None
            if max_width:
                with Image.open(file_path) as img:
                    width, height = img.size
                    if width > max_width:
                        # Calculate new height maintaining aspect ratio
                        new_height = int(height * (max_width / width))
                        resize = (max_width, new_height)
            
            # Convert the image
            progress.update(task, description=f"[cyan]Converting[/cyan] {file_name}")
            webp_path = convert_to_webp(file_path, quality, resize)
            
            if webp_path:
                webp_size = os.path.getsize(webp_path)
                savings = original_size - webp_size
                savings_percent = (savings / original_size) * 100
                total_savings += savings
                
                converted_files.append({
                    "original": file_path,
                    "webp": webp_path,
                    "original_size": original_size,
                    "webp_size": webp_size,
                    "savings": savings,
                    "savings_percent": savings_percent
                })
            
            progress.update(task, advance=1)
    
    return converted_files, total_savings

def format_size(size_bytes):
    """Format size in bytes to human-readable format.
    
    Args:
        size_bytes (int): Size in bytes
        
    Returns:
        str: Formatted size string (e.g., "1.23 MB")
    """
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024 or unit == 'GB':
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024

def show_results(converted_files, total_savings):
    """Display the results of the conversion in a table.
    
    Args:
        converted_files (list): List of converted file information
        total_savings (int): Total bytes saved
    """
    if not converted_files:
        console.print("[yellow]No files were converted.[/yellow]")
        return
        
    table = Table(title="WebP Conversion Results")
    table.add_column("Original File", style="cyan")
    table.add_column("Original Size", justify="right", style="green")
    table.add_column("WebP Size", justify="right", style="green")
    table.add_column("Savings", justify="right", style="bold green")
    table.add_column("Reduction", justify="right", style="bold yellow")
    
    for file_info in converted_files:
        original = os.path.basename(file_info["original"])
        original_size = format_size(file_info["original_size"])
        webp_size = format_size(file_info["webp_size"])
        savings = format_size(file_info["savings"])
        percent = f"{file_info['savings_percent']:.1f}%"
        
        table.add_row(original, original_size, webp_size, savings, percent)
    
    console.print(table)
    console.print(f"\n[bold green]Total disk space saved: {format_size(total_savings)}[/bold green]")

def resize_images(image_files, max_width=None):
    """Resize images and save them with a '_resized' suffix.
    
    Args:
        image_files (list): List of image file paths
        max_width (int, optional): Maximum width to resize to, preserving aspect ratio
    Returns:
        list: List of resized file paths
    """
    resized_files = []
    with Progress() as progress:
        task = progress.add_task("[cyan]Resizing images...", total=len(image_files))
        for file_path in image_files:
            file_name = os.path.basename(file_path)
            try:
                with Image.open(file_path) as img:
                    width, height = img.size
                    resize = None
                    if max_width and width > max_width:
                        new_height = int(height * (max_width / width))
                        resize = (max_width, new_height)
                    else:
                        resize = (width, height)
                    img_resized = img.resize(resize, Image.LANCZOS)
                    # Save with _resized suffix
                    base, ext = os.path.splitext(file_path)
                    output_path = f"{base}_resized{ext}"
                    img_resized.save(output_path)
                    resized_files.append(output_path)
            except Exception as e:
                console.print(f"[bold red]Error resizing {file_name}:[/bold red] {str(e)}")
            progress.update(task, advance=1)
    return resized_files

def main():
    console.print(Panel.fit(
        "[bold yellow]Image to WebP Converter[/bold yellow]\n"
        "[cyan]This script converts images to optimized WebP format.[/cyan]",
        border_style="yellow"
    ))
    # Ask operation mode: convert to WebP or just resize
    conversion_mode = Prompt.ask(
        "[bold blue]Select operation: convert to WebP or just resize?",
        choices=["webp", "resize"],
        default="webp"
    )
    just_resize = (conversion_mode == "resize")
    try:
        # Get the directory where the script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Find all images in the directory
        console.print(f"\n[blue]Searching for images in:[/blue] [bold white]{script_dir}[/bold white]")
        image_files = get_image_files(script_dir)
        
        if not image_files:
            console.print("[yellow]No supported image files found in this directory.[/yellow]")
            return 0
            
        console.print(f"[green]Found [bold]{len(image_files)}[/bold] images to convert.[/green]")
        max_width = None
        if not just_resize:
            # Only ask about resizing if not just resizing
            resize_confirm = Confirm.ask("[bold blue]Would you like to resize the images?", default=False)
            if resize_confirm:
                max_width = int(Prompt.ask(
                    "[bold blue]Maximum width in pixels",
                    default="800"
                ))
        else:
            # In resize mode, always ask for max_width
            max_width = int(Prompt.ask(
                "[bold blue]Maximum width in pixels",
                default="800"
            ))
        if just_resize:
            # Confirm before processing
            process_confirm = Confirm.ask(
                f"[bold yellow]Ready to resize {len(image_files)} images{' to max width ' + str(max_width) if max_width else ''}. Proceed?[/bold yellow]",
                default=True
            )
            if not process_confirm:
                console.print("[yellow]Operation cancelled by user.[/yellow]")
                return 0
            resized_files = resize_images(image_files, max_width)
            if resized_files:
                console.print(f"[bold green]Resized {len(resized_files)} images. Files saved with _resized suffix.[/bold green]")
            else:
                console.print("[yellow]No images were resized.[/yellow]")
            return 0
        # Ask for quality setting
        quality = int(Prompt.ask(
            "[bold blue]WebP quality (lower = smaller file size)",
            default="80",
            choices=[str(q) for q in range(10, 101, 10)]
        ))
        # Confirm before processing
        process_confirm = Confirm.ask(
            f"[bold yellow]Ready to convert {len(image_files)} images to WebP (quality: {quality}){' with resizing' if max_width else ''}. Proceed?[/bold yellow]", 
            default=True
        )
        if not process_confirm:
            console.print("[yellow]Operation cancelled by user.[/yellow]")
            return 0
        # Process the images
        converted_files, total_savings = process_images(image_files, quality, max_width)
        # Show results
        show_results(converted_files, total_savings)
        
        # Ask if user wants to delete original files
        if converted_files:
            delete_confirm = Confirm.ask(
                "[bold red]Do you want to delete the original files?[/bold red]", 
                default=False
            )
            
            if delete_confirm:
                with Progress() as progress:
                    delete_task = progress.add_task("[red]Deleting original files...", total=len(converted_files))
                    
                    for file_info in converted_files:
                        try:
                            os.remove(file_info["original"])
                        except Exception as e:
                            console.print(f"[red]Could not delete {os.path.basename(file_info['original'])}: {str(e)}[/red]")
                        progress.update(delete_task, advance=1)
                        
                console.print("[bold green]Original files deleted successfully.[/bold green]")
        
        console.print("[bold yellow]WebP conversion completed! Your images are optimized for the web.[/bold yellow]")
        
    except KeyboardInterrupt:
        console.print("\n[yellow]WebP converter interrupted. Exiting...[/yellow]")
    except Exception as e:
        console.print(f"[bold red]An unexpected error occurred:[/bold red] {str(e)}")
        return 1
        
    return 0

if __name__ == "__main__":
    sys.exit(main())