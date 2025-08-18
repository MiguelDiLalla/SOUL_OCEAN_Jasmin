#!/usr/bin/env python3
"""
CSS Minification Script for Soul+Ocean Website
Minifies the main styles.css file into styles.min.css
"""

import re
import os

def minify_css(input_file, output_file):
    """
    Basic CSS minification function
    - Removes comments
    - Removes unnecessary whitespace
    - Compacts the CSS
    """
    
    # Read the CSS file
    with open(input_file, 'r', encoding='utf-8') as f:
        css_content = f.read()
    
    # Remove CSS comments (/* ... */)
    minified = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL)
    
    # Remove unnecessary whitespace and newlines
    minified = re.sub(r'\s+', ' ', minified)
    
    # Remove spaces around certain characters
    minified = re.sub(r'\s*([{}:;,>+~])\s*', r'\1', minified)
    
    # Remove trailing semicolons before closing braces
    minified = re.sub(r';\s*}', '}', minified)
    
    # Remove leading/trailing whitespace
    minified = minified.strip()
    
    # Write the minified CSS
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(minified)
    
    print(f'✅ CSS minified successfully!')
    print(f'📂 Input:  {input_file}')
    print(f'📂 Output: {output_file}')
    
    # Show file size comparison
    original_size = os.path.getsize(input_file)
    minified_size = os.path.getsize(output_file)
    reduction = ((original_size - minified_size) / original_size) * 100
    
    print(f'📊 Original size: {original_size:,} bytes')
    print(f'📊 Minified size: {minified_size:,} bytes')
    print(f'📊 Size reduction: {reduction:.1f}%')

if __name__ == '__main__':
    # Define file paths
    css_dir = os.path.dirname(os.path.abspath(__file__))
    input_css = os.path.join(css_dir, 'styles.css')
    output_css = os.path.join(css_dir, 'styles.min.css')
    
    # Check if input file exists
    if not os.path.exists(input_css):
        print(f'❌ Error: Input file not found: {input_css}')
        exit(1)
    
    # Minify the CSS
    try:
        minify_css(input_css, output_css)
    except Exception as e:
        print(f'❌ Error during minification: {e}')
        exit(1)
