"""PDF Document Parser using PyMuPDF (fitz)."""

import os
import fitz # PyMuPDF
from typing import List
from .base_parser import BaseParser, ParsedDocument, DocumentChunk

class PDFParser(BaseParser):
    def can_parse(self, file_path: str) -> bool:
        return file_path.lower().endswith(".pdf")

    def parse(self, file_path: str) -> ParsedDocument:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found: {file_path}")

        filename = os.path.basename(file_path)
        doc = fitz.open(file_path)
        chunks: List[DocumentChunk] = []
        chunk_idx = 0
        total_chars = 0

        current_heading = "General"

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text").strip()
            
            if not text:
                # Potential scanned image page
                chunks.append(DocumentChunk(
                    chunk_id=f"{filename}_p{page_num + 1}_empty",
                    chunk_type="warning",
                    content="[Warning: Page contains no extractable text. May be a scanned image requiring OCR].",
                    page_number=page_num + 1,
                    metadata={"scanned_page": True}
                ))
                continue

            lines = text.split("\n")
            buffer = []

            for line in lines:
                stripped = line.strip()
                if not stripped:
                    if buffer:
                        para_text = " ".join(buffer)
                        total_chars += len(para_text)
                        chunks.append(DocumentChunk(
                            chunk_id=f"{filename}_c{chunk_idx}",
                            chunk_type="paragraph",
                            content=para_text,
                            page_number=page_num + 1,
                            section_title=current_heading,
                        ))
                        chunk_idx += 1
                        buffer = []
                    continue

                # Check if heading (short line, title-case or upper case, no period at end)
                if len(stripped) < 80 and not stripped.endswith(".") and (stripped.isupper() or stripped.istitle()):
                    if buffer:
                        para_text = " ".join(buffer)
                        total_chars += len(para_text)
                        chunks.append(DocumentChunk(
                            chunk_id=f"{filename}_c{chunk_idx}",
                            chunk_type="paragraph",
                            content=para_text,
                            page_number=page_num + 1,
                            section_title=current_heading,
                        ))
                        chunk_idx += 1
                        buffer = []

                    current_heading = stripped
                    chunks.append(DocumentChunk(
                        chunk_id=f"{filename}_c{chunk_idx}",
                        chunk_type="heading",
                        content=stripped,
                        page_number=page_num + 1,
                        metadata={"level": 2}
                    ))
                    chunk_idx += 1
                else:
                    buffer.append(stripped)

            if buffer:
                para_text = " ".join(buffer)
                total_chars += len(para_text)
                chunks.append(DocumentChunk(
                    chunk_id=f"{filename}_c{chunk_idx}",
                    chunk_type="paragraph",
                    content=para_text,
                    page_number=page_num + 1,
                    section_title=current_heading,
                ))
                chunk_idx += 1

        num_pages = len(doc)
        doc.close()

        return ParsedDocument(
            source_file=file_path,
            filename=filename,
            file_extension=".pdf",
            total_chunks=len(chunks),
            extracted_text_length=total_chars,
            chunks=chunks,
            document_metadata={"page_count": num_pages}
        )
