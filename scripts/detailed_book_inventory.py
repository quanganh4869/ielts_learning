import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('parsed_sections.json', 'r', encoding='utf-8') as f:
    sections = json.load(f)

with open('book_inventory.txt', 'w', encoding='utf-8') as out:
    for s in sections:
        out.write(f"\n=======================================================\n")
        out.write(f"SECTION: {s.get('heading')}\n")
        out.write(f"=======================================================\n")
        for c in s.get('content', []):
            out.write(f"  [Text] {c}\n")
        for l in s.get('links', []):
            out.write(f"  --> [DOWNLOAD LINK] {l['text']}: {l['href']}\n")

print("Wrote book_inventory.txt successfully.")
