#!/usr/bin/env python3
"""
IELTS Platform - RAG Data Pipeline & Chunking Preprocessor

Splits official IELTS guides, band descriptors, and academic learning materials into
semantically coherent chunks with citation metadata.
"""

import json
import re
import sys
import argparse
from typing import List, Dict, Any

def clean_text(text: str) -> str:
    """Normalize whitespace and remove non-printable characters."""
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def chunk_by_sections(raw_text: str, default_category: str = "GENERAL", max_chunk_words: int = 250) -> List[Dict[str, Any]]:
    """
    Splits text on Markdown-like headings (## or ###) or numbered sections,
    ensuring each chunk stays within word limit.
    """
    cleaned = clean_text(raw_text)
    sections = re.split(r'\n(?=#{1,3}\s+|[0-9]+\.\s+)', cleaned)

    chunks: List[Dict[str, Any]] = []

    for sec in sections:
        sec = sec.strip()
        if not sec:
            continue

        lines = sec.split('\n')
        first_line = lines[0].strip('# ').strip()
        body = '\n'.join(lines[1:]).strip() if len(lines) > 1 else first_line

        # Detect category from header keywords
        category = default_category
        upper_title = first_line.upper()
        if "WRITING" in upper_title:
            category = "WRITING"
        elif "READING" in upper_title:
            category = "READING"
        elif "LISTENING" in upper_title:
            category = "LISTENING"
        elif "SPEAKING" in upper_title:
            category = "SPEAKING"
        elif "VOCAB" in upper_title:
            category = "VOCABULARY"
        elif "GRAMMAR" in upper_title:
            category = "GRAMMAR"

        words = body.split()
        if len(words) <= max_chunk_words:
            chunks.append({
                "title": first_line[:120],
                "category": category,
                "content": sec,
                "word_count": len(sec.split()),
                "status": "APPROVED",
            })
        else:
            # Sub-chunk by word sliding window
            for idx in range(0, len(words), max_chunk_words - 30):
                sub_slice = words[idx : idx + max_chunk_words]
                sub_content = " ".join(sub_slice)
                chunks.append({
                    "title": f"{first_line[:100]} (Part {idx // (max_chunk_words - 30) + 1})",
                    "category": category,
                    "content": sub_content,
                    "word_count": len(sub_slice),
                    "status": "APPROVED",
                })

    return chunks

def main():
    parser = argparse.ArgumentParser(description="Chunk IELTS documents for RAG Knowledge Base")
    parser.add_argument("--input", "-i", type=str, help="Path to input text file", default=None)
    parser.add_argument("--output", "-o", type=str, help="Output JSON path", default="chunks_output.json")
    parser.add_argument("--category", "-c", type=str, default="IELTS_ACADEMIC", help="Default knowledge category")

    args = parser.parse_args()

    sample_doc = """
# IELTS Academic Writing Task 2 Overview
In IELTS Writing Task 2, test takers are presented with a point of view, argument, or problem and are asked to write an essay of at least 250 words.
Candidates must present a clear position throughout the response, supported by relevant ideas and examples.

## Lexical Resource Criteria
Lexical Resource measures the range and precision of vocabulary used. To achieve Band 7.0 or higher:
1. Use a wide range of academic vocabulary with flexibility.
2. Skillfully use uncommon lexical items and collocations with occasional minor inaccuracies.
3. Show good control of word formation and spelling with rare errors.

## Coherence and Cohesion Criteria
Coherence and Cohesion evaluates how well information and ideas are organized and logically linked.
To reach Band 7.0+:
- Logically organize information and ideas with clear progression throughout.
- Use a variety of cohesive devices appropriately (referencing, substitution, linking phrases).
- Present a clear central topic within each paragraph.
"""

    text_to_process = sample_doc
    if args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            text_to_process = f.read()

    chunks = chunk_by_sections(text_to_process, default_category=args.category)
    print(f"[*] Processed {len(chunks)} chunks from text.")

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)

    print(f"[+] Saved structured chunks to {args.output}")

if __name__ == "__main__":
    main()
