import os, re
files = [
    'frontend/app/layout.tsx',
    'frontend/app/page.tsx',
    'frontend/app/admin/page.tsx',
    'frontend/app/admin/providers/page.tsx',
    'frontend/app/billing/page.tsx',
    'frontend/app/bookings/page.tsx',
    'frontend/app/dashboard/page.tsx',
    'frontend/components/admin/StatCard.tsx',
    'frontend/components/ui/TiltCard.tsx',
    'frontend/contexts/AuthContext.tsx'
]
for file_path in files:
    try:
        content = open(file_path, 'r', encoding='utf-8').read()
        content = re.sub(r'(<(div|body|main|AuthContext\.Provider|section|nav|header|footer)[^>]*)>', r'\1 aria-label="page-container">', content, count=1)
        open(file_path, 'w', encoding='utf-8').write(content)
        print(f'Patched {file_path}')
    except Exception as e:
        print(f'Error patching {file_path}: {e}')
