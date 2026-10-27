import sys
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')
fname = 'resources/research/singlefile/Band7Writing · Get from 6.5 to Band 7 in IELTS Writing (10_26_2026 7：13：19 PM).html'
soup = BeautifulSoup(open(fname, 'r', encoding='utf-8', errors='ignore'), 'html.parser')

main = soup.find('main')
if main:
    print("=== MAIN SECTIONS IN BAND7WRITING ===")
    for el in main.children:
        if el.name:
            print(f"\n[SECTION {el.name} class={el.get('class')}]")
            print(el.get_text(' | ', strip=True)[:300])

print("\n=== SIDEBAR IN BAND7WRITING ===")
sidebar = soup.find('aside') or soup.find('nav')
if sidebar:
    print(sidebar.get_text(' | ', strip=True))
