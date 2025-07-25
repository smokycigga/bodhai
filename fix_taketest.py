#!/usr/bin/env python3
"""
Script to remove the old MathRenderer component from takeTest page
"""

def fix_taketest_page():
    file_path = "src/app/takeTest/page.js"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find the start and end of the old MathRenderer component
    start_line = None
    end_line = None
    
    for i, line in enumerate(lines):
        if "// Helper component to render math content" in line:
            start_line = i
        if start_line is not None and line.strip() == "};":
            # Check if this is the end of the MathRenderer component
            # by looking for the next non-empty line
            next_non_empty = i + 1
            while next_non_empty < len(lines) and lines[next_non_empty].strip() == "":
                next_non_empty += 1
            
            if next_non_empty < len(lines) and "// Get subject-wise question counts" in lines[next_non_empty]:
                end_line = i
                break
    
    if start_line is not None and end_line is not None:
        print(f"Found old MathRenderer component from line {start_line + 1} to {end_line + 1}")
        
        # Replace the old component with a simple comment
        new_lines = (
            lines[:start_line] + 
            ["  // MathRenderer component is now imported from ../components/MathRenderer\n", "\n"] +
            lines[end_line + 1:]
        )
        
        # Write the fixed file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        print("Successfully removed old MathRenderer component!")
        print(f"Removed {end_line - start_line + 1} lines")
    else:
        print("Could not find the old MathRenderer component boundaries")

if __name__ == "__main__":
    fix_taketest_page()