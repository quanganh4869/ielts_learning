"""Excel Spreadsheet Parser using openpyxl & pandas."""

import os
import openpyxl
from typing import List, Dict, Any
from .base_parser import BaseParser, ParsedDocument, DocumentChunk

class ExcelParser(BaseParser):
    def can_parse(self, file_path: str) -> bool:
        ext = os.path.splitext(file_path)[1].lower()
        return ext in [".xlsx", ".xls"]

    def parse(self, file_path: str) -> ParsedDocument:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Excel file not found: {file_path}")

        filename = os.path.basename(file_path)
        wb = openpyxl.load_workbook(file_path, data_only=True)
        chunks: List[DocumentChunk] = []
        chunk_idx = 0
        total_chars = 0

        for sheetname in wb.sheetnames:
            sheet = wb[sheetname]
            rows = list(sheet.iter_rows(values_only=True))
            if not rows:
                continue

            # First non-empty row as header
            header_row = None
            data_rows = []
            for r in rows:
                if any(cell is not None for cell in r):
                    if header_row is None:
                        header_row = [str(c).strip() if c is not None else f"col_{idx}" for idx, c in enumerate(r)]
                    else:
                        data_rows.append(r)

            if not header_row:
                continue

            # Construct structured Markdown Table
            md_table_lines = [f"### Worksheet: {sheetname}\n"]
            md_table_lines.append("| " + " | ".join(header_row) + " |")
            md_table_lines.append("| " + " | ".join(["---"] * len(header_row)) + " |")

            structured_records: List[Dict[str, Any]] = []

            for r in data_rows:
                str_cells = [str(c).strip().replace("\n", " ") if c is not None else "" for c in r]
                # Pad cells if needed
                while len(str_cells) < len(header_row):
                    str_cells.append("")
                str_cells = str_cells[:len(header_row)]

                if any(str_cells):
                    md_table_lines.append("| " + " | ".join(str_cells) + " |")
                    rec = {header_row[i]: str_cells[i] for i in range(len(header_row))}
                    structured_records.append(rec)

            sheet_content = "\n".join(md_table_lines)
            total_chars += len(sheet_content)

            chunks.append(DocumentChunk(
                chunk_id=f"{filename}_{sheetname}_{chunk_idx}",
                chunk_type="worksheet",
                content=sheet_content,
                section_title=f"Worksheet: {sheetname}",
                table_data=structured_records,
                metadata={
                    "sheet_name": sheetname,
                    "rows_count": len(structured_records),
                    "columns_count": len(header_row)
                }
            ))
            chunk_idx += 1

        wb.close()

        return ParsedDocument(
            source_file=file_path,
            filename=filename,
            file_extension=os.path.splitext(file_path)[1].lower(),
            total_chunks=len(chunks),
            extracted_text_length=total_chars,
            chunks=chunks,
            document_metadata={"sheets_count": len(wb.sheetnames)}
        )
