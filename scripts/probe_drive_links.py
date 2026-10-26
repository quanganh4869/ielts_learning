import sys
import re
import urllib.request
import os

sys.stdout.reconfigure(encoding='utf-8')

links = [
    ('Tactics for Listening Basic Ebook', '0B7U1F417pct0ejdUcU56ekJfRjg'),
    ('Tactics for Listening Developing Ebook', '0B7U1F417pct0b3Z5bmJ1TGdnSEU'),
    ('Tactics for Listening Expanding Ebook', '0B7U1F417pct0OW9xUkVwNW5YT2s'),
    ('101 Listening Tests', '1E2rqhp-qyG_Ua6-oO4KxuMpAQCrUoTgT'),
    ('IELTS Speaking Mark Allen', '1RJMD8bf4wGrZghYRCMKfeMzdeZA0llrC'),
    ('IELTS Writing Task 1 Target 7', '0B7PqGrg9aj4yNG9maDNZX3NoTDQ'),
    ('IELTS Writing Task 2 Target 7', '0B7PqGrg9aj4ycWx1a1VGNVVsNTg'),
    ('Tips for IELTS Speaking Adam Smith', '18ji3nv_gV4ERJ4zhH1AssGoYC_UHEcAt'),
    ('Academic Writing Sam McCarter', '1UNKB4YtMbCvCJkR6V3mYLWusqbSqCwzz'),
    ('A Book for IELTS Sam McCarter', '1jGY0_68btylSX915TDk2Y9fMF_SZWF5G'),
]

os.makedirs('downloads/ielts_fighter_materials', exist_ok=True)

print("=== CHECKING AND DOWNLOADING SAMPLE BOOKS ===")
for name, fid in links:
    url = f'https://drive.google.com/uc?export=download&id={fid}'
    view_url = f'https://drive.google.com/file/d/{fid}/view'
    try:
        req = urllib.request.Request(view_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            title_match = re.search(r'<meta property="og:title" content="([^"]+)"', content)
            file_title = title_match.group(1) if title_match else name
            if "File not found" in content or "You need access" in content or "Trang không tồn tại" in content or "Tệp không tồn tại" in content:
                print(f"[!] {name}: Google Drive link is restricted or expired ({fid})")
            else:
                print(f"[✓] {name}: Accessible! File title: '{file_title}'")
    except Exception as e:
        print(f"[x] {name}: Failed to access - {e}")
