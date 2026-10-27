import sys
import re
import json
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

with open('resources/research/ielts_fighter_page.html', 'r', encoding='utf-8', errors='ignore') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

title = soup.title.string.strip() if soup.title and soup.title.string else ''
print('TITLE:', title)

# Look for the main article / entry content
main_content = soup.find('div', class_='content_detail') or soup.find('div', class_='detail_content') or soup.find('div', class_='content') or soup.body

# Find all headings and their following links/paragraphs
sections = []
current_section = {"heading": "Intro", "level": "h1", "links": [], "content": []}
sections.append(current_section)

for el in main_content.find_all(['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'div']):
    if el.name in ['h2', 'h3', 'h4']:
        heading_text = el.get_text(strip=True)
        if heading_text:
            current_section = {"heading": heading_text, "level": el.name, "links": [], "content": []}
            sections.append(current_section)
    elif el.name in ['p', 'ul', 'ol']:
        text = el.get_text(strip=True)
        if text:
            current_section["content"].append(text[:200])
        # Find download links
        for a in el.find_all('a', href=True):
            href = a['href']
            link_text = a.get_text(strip=True)
            if link_text and any(w in link_text.lower() or w in href.lower() for w in ['download', 'tải', 'link', 'drive', 'pdf', 'audio', 'bộ sách', 'sách', 'full', 'cambridge']):
                current_section["links"].append({"text": link_text, "href": href})

print(f"Total sections extracted: {len(sections)}")
with open('resources/research/parsed_sections.json', 'w', encoding='utf-8') as f:
    json.dump(sections, f, ensure_ascii=False, indent=2)

# Print summary of books and links
print("\n=== SUMMARY OF KEY SECTIONS & DOWNLOAD LINKS ===")
for idx, sec in enumerate(sections):
    if sec.get('links'):
        print(f"\n[{sec['level'].upper()}] {sec['heading']}")
        for l in sec['links']:
            print(f"   -> {l['text']}: {l['href']}")
