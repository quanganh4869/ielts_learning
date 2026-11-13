"""Text, Markdown, CSV and JSONL Parser."""

import os
import csv
import json
from typing import List, Dict, Any
from .base_parser import BaseParser, ParsedDocument, DocumentChunk

class TextParser(BaseParser):
    def can_parse(self, file_path: str) -> bool:
        ext = os.path.splitext(file_path)[1].lower()
        return ext in [".txt", ".md", ".csv", ".jsonl"]

    def parse(self, file_path: str) -> ParsedDocument:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        filename = os.path.basename(file_path)
        ext = os.path.splitext(file_path)[1].lower()
        chunks: List[DocumentChunk] = []

        # Try UTF-8 then fallback to Latin-1
        content = ""
        for encoding in ["utf-8", "utf-8-sig", "latin-1"]:
            try:
                with open(file_path, "r", encoding=encoding) as f:
                    content = f.read()
                break
            except UnicodeDecodeError:
                continue

        if ext == ".csv":
            # Structured CSV parse
            reader = csv.reader(content.splitlines())
            rows = list(reader)
            if rows:
                headers = rows[0]
                md_lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
                records = []
                for r in rows[1:]:
                    if any(r):
                        padded = r + [""] * (len(headers) - len(r))
                        md_lines.append("| " + " | ".join(padded[:len(headers)]) + " |")
                        records.append({headers[i]: padded[i] for i in range(len(headers))})
                
                chunks.append(DocumentChunk(
                    chunk_id=f"{filename}_csv",
                    chunk_type="table",
                    content="\n".join(md_lines),
                    table_data=records,
                    metadata={"rows": len(records), "cols": len(headers)}
                ))
        elif ext == ".jsonl":
            # JSONL line-by-line
            lines = content.splitlines()
            for idx, line in enumerate(lines):
                line = line.strip()
                if line:
                    try:
                        obj = json.loads(line)
                        chunks.append(DocumentChunk(
                            chunk_id=f"{filename}_line{idx}",
                            chunk_type="json_record",
                            content=json.dumps(obj, indent=2, ensure_ascii=False),
                            metadata={"json_data": obj}
                        ))
                    except json.JSONDecodeError:
                        chunks.append(DocumentChunk(
                            chunk_id=f"{filename}_line{idx}",
                            chunk_type="paragraph",
                            content=line
                        ))
        else:
            # TXT or MD paragraphs
            paragraphs = content.split("\n\n")
            for idx, p in enumerate(paragraphs):
                p_clean = p.strip()
                if p_clean:
                    chunk_type = "heading" if (p_clean.startswith("#") or (len(p_clean) < 60 and p_clean.isupper())) else "paragraph"
                    chunks.append(DocumentChunk(
                        chunk_id=f"{filename}_p{idx}",
                        chunk_type=chunk_type,
                        content=p_clean
                    ))

        return ParsedDocument(
            source_file=file_path,
            filename=filename,
            file_extension=ext,
            total_chunks=len(chunks),
            extracted_text_length=len(content),
            chunks=chunks,
            document_metadata={"format": ext.replace(".", "")}
        )
