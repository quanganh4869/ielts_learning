"""Base Document Parser & Structured Document Representation."""

import os
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class DocumentChunk(BaseModel):
    chunk_id: str
    chunk_type: str = "paragraph" # "heading", "paragraph", "table", "list_item", "worksheet"
    content: str
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    table_data: Optional[List[Dict[str, Any]]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ParsedDocument(BaseModel):
    source_file: str
    filename: str
    file_extension: str
    total_chunks: int = 0
    extracted_text_length: int = 0
    chunks: List[DocumentChunk] = Field(default_factory=list)
    document_metadata: Dict[str, Any] = Field(default_factory=dict)

    def to_markdown(self) -> str:
        md_lines = [f"# Source: {self.filename}\n"]
        for c in self.chunks:
            if c.chunk_type == "heading":
                level = c.metadata.get("level", 2)
                prefix = "#" * min(6, max(1, level))
                md_lines.append(f"\n{prefix} {c.content}\n")
            elif c.chunk_type == "table":
                md_lines.append(f"\n[Table Data from Page {c.page_number or 1}]:\n")
                md_lines.append(c.content)
                md_lines.append("\n")
            else:
                md_lines.append(f"{c.content}\n")
        return "\n".join(md_lines)

class BaseParser(ABC):
    @abstractmethod
    def can_parse(self, file_path: str) -> bool:
        pass

    @abstractmethod
    def parse(self, file_path: str) -> ParsedDocument:
        pass
