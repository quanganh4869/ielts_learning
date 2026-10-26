import sys
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')
fname = 'singlefile/Band7Writing · Get from 6.5 to Band 7 in IELTS Writing (10_26_2026 7：13：19 PM).html'
soup = BeautifulSoup(open(fname, 'r', encoding='utf-8', errors='ignore'), 'html.parser')

main = soup.find('main')
container = main.find('div', class_='space-y-6')

for idx, child in enumerate(container.children):
    if child.name:
        print(f"\n================ ELEMENT {idx} [{child.name} class={child.get('class')}] ================")
        print(child.prettify()[:1000])
