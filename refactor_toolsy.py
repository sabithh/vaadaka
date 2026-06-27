import os
import re

TARGET_DIR = r"c:\Users\mxsab\OneDrive\Desktop\Toolsy"

EXCLUDE_DIRS = {".git", "node_modules", ".next", "__pycache__", "venv", "env", ".agent", ".gemini", "build", "dist", ".idea", ".vscode"}
EXCLUDE_EXTS = {".pyc", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".sqlite3", ".sql"}

def should_skip(path):
    for part in path.split(os.sep):
        if part in EXCLUDE_DIRS:
            return True
    return False

def rename_content(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return

    new_content = content
    replacements = {
        'toolsy': 'vaadaka',
        'Toolsy': 'Vaadaka',
        'TOOLSY': 'VAADAKA'
    }
    
    for old, new in replacements.items():
        pattern = r'\b' + re.escape(old) + r'\b'
        new_content = re.sub(pattern, new, new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(new_content)
        print(f"Updated content in {file_path}")

def rename_file_or_dir(path):
    basename = os.path.basename(path)
    if re.search(r'\btoolsy\b', basename, re.IGNORECASE):
        new_basename = basename.replace('toolsy', 'vaadaka').replace('Toolsy', 'Vaadaka').replace('TOOLSY', 'VAADAKA')
        new_path = os.path.join(os.path.dirname(path), new_basename)
        os.rename(path, new_path)
        print(f"Renamed {path} -> {new_path}")
        return new_path
    return path

# Step 1: Content
for root, dirs, files in os.walk(TARGET_DIR):
    if should_skip(root):
        continue
    for file in files:
        if any(file.endswith(ext) for ext in EXCLUDE_EXTS):
            continue
        if file in ('refactor_vaadaka.py', 'refactor_toolsy.py', 'full_backup.sql', 'full_backup.json'):
            continue
        file_path = os.path.join(root, file)
        rename_content(file_path)

# Step 2: Files
for root, dirs, files in os.walk(TARGET_DIR, topdown=False):
    if should_skip(root):
        continue
    for file in files:
        if file in ('refactor_vaadaka.py', 'refactor_toolsy.py', 'full_backup.sql', 'full_backup.json'):
            continue
        file_path = os.path.join(root, file)
        rename_file_or_dir(file_path)

# Step 3: Dirs
for root, dirs, files in os.walk(TARGET_DIR, topdown=False):
    if should_skip(root):
        continue
    for d in dirs:
        dir_path = os.path.join(root, d)
        rename_file_or_dir(dir_path)

print("Toolsy to Vaadaka Refactoring complete.")
