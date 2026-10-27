import sys
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')
fname = 'resources/research/singlefile/Band7Writing · Get from 6.5 to Band 7 in IELTS Writing (10_26_2026 7：13：19 PM).html'
soup = BeautifulSoup(open(fname, 'r', encoding='utf-8', errors='ignore'), 'html.parser')

imgs = soup.find_all('img')
for idx, img in enumerate(imgs):
    parent = img.parent
    context = parent.get_text(' | ', strip=True)[:80] if parent else 'No parent'
    grandparent = parent.parent.get_text(' | ', strip=True)[:80] if parent and parent.parent else ''
    print(f"Sticker {idx}: parent = '{context}' | gp = '{grandparent}'")
