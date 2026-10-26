import sys
import urllib.request
import re
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

child_urls = [
    ('Cambridge Grammar', 'https://ielts-fighter.com/tin-tuc/cambridge-grammar-for-ielts-pdf-audio_mt1522777764.html'),
    ('Cambridge Vocabulary', 'https://ielts-fighter.com/tin-tuc/cambridge-vocabulary-for-ielts-pdf-audio_mt1533163985.html'),
    ('Vocabulary in Use', 'https://ielts-fighter.com/tai-lieu/english-vocabulary-in-use_mt1544394311.html'),
    ('English Pronunciation in Use', 'https://ielts-fighter.com/tin-tuc/english-pronunciation-in-use-pdf-audio_mt1531862566.html'),
    ('Speaking Topics & Sample Answers', 'https://ielts-fighter.com/tin-tuc/ielts-speaking-topics-with-questions-sample-answers_mt1559519848.html'),
]

for name, url in child_urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            soup = BeautifulSoup(resp.read(), 'html.parser')
            print(f"\n=== {name} ({url}) ===")
            content = soup.find('div', class_='content_detail') or soup.find('div', class_='detail_content') or soup.body
            found_links = []
            for a in content.find_all('a', href=True):
                h = a['href']
                t = a.get_text(strip=True)
                if any(x in h.lower() for x in ['drive.google.com', 'mediafire.com', 'mega.nz', 'fshare', '.pdf', '.zip']):
                    found_links.append((t, h))
            print(f"Found {len(found_links)} external download links:")
            for t, h in found_links[:6]:
                print(f"   * {t} -> {h}")
    except Exception as e:
        print(f"Error {name}: {e}")
