"""DOCX Document Parser using python-docx."""

import os
from typing import List, Dict, Any
from docx import Document
from .base_parser import BaseParser, ParsedDocument, DocumentChunk

class DocxParser(BaseParser):
    def can_parse(self, file_path: str) -> bool:
        ext = os.path.splitext(file_path)[1].lower()
        return ext in [".docx", ".doc"]

    def parse(self, file_path: str) -> ParsedDocument:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"DOCX file not found: {file_path}")

        filename = os.path.basename(file_path)
        doc = Document(file_path)
        chunks: List[DocumentChunk] = []
        chunk_idx = 0
        total_chars = 0

        current_heading = "Introduction"

        # 1. Parse Paragraphs & Headings
        for p in doc.paragraphs:
            text = p.text.strip()
            if not text:
                continue

            total_chars += len(text)
            style_name = p.style.name.lower() if p.style else ""

            if "heading 1" in style_name:
                current_heading = text
                chunks.append(DocumentChunk(
                    chunk_id=f"{filename}_c{chunk_idx}",
                    chunk_type="heading",
                    content=text,
                    section_title=current_heading,
                    metadata={"level": 1}
                ))
            elif "heading 2" in style_name or "heading 3" in style_name:
                current_heading = text
                chunks.append(DocumentChunk(
                    chunk_id=f"{filename}_c{chunk_idx}",
                    chunk_type="heading",
                    content=text,
                    section_title=current_heading,
                    metadata={"level": 2}
                ))
            else:
                chunks.append(DocumentChunk(
                    chunk_id=f"{filename}_c{chunk_idx}",
                    chunk_type="paragraph",
                    content=text,
                    section_title=current_heading,
                ))
            chunk_idx += 1

        # 2. Parse Tables
        for t_idx, table in enumerate(doc.tables):
            table_rows: List[Dict[str, Any]] = []
            headers = []
            table_lines = []

            for r_idx, row in enumerate(table.rows):
                row_cells = [cell.text.strip().replace("\n", " ") for cell in row.cells]
                if r_idx == 0:
                    headers = row_cells
                    table_lines.append("| " + " | ".join(headers) + " |")
                    table_lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
                else:
                    table_lines.append("| " + " | ".join(row_cells) + " |")
                    if headers:
                        row_dict = {headers[i] if i < len(headers) else f"col_{i}": cell for i, cell in enumerate(row_cells)}
                        table_rows.append(row_dict)

            table_content = "\n".join(table_lines)
            total_chars += len(table_content)
            chunks.append(DocumentChunk(
                chunk_id=f"{filename}_tbl{t_idx}",
                chunk_type="table",
                content=table_content,
                section_title=current_heading,
                table_data=table_rows,
                metadata={"rows_count": len(table.rows), "cols_count": len(table.columns)}
            ))

        return ParsedDocument(
            source_file=file_path,
            filename=filename,
            file_extension=os.path.splitext(file_path)[1].lower(),
            total_chunks=len(chunks),
            extracted_text_length=total_chars,
            chunks=chunks,
            document_metadata={"paragraphs_count": len(doc.paragraphs), "tables_count": len(doc.tables)}
        )
