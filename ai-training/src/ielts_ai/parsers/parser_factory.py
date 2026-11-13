"""Parser Factory & Multi-format Router."""

import os
from typing import List
from .base_parser import BaseParser, ParsedDocument
from .pdf_parser import PDFParser
from .docx_parser import DocxParser
from .excel_parser import ExcelParser
from .text_parser import TextParser

class ParserFactory:
    def __init__(self):
        self.parsers: List[BaseParser] = [
            PDFParser(),
            DocxParser(),
            ExcelParser(),
            TextParser(),
        ]

    def get_parser(self, file_path: str) -> BaseParser:
        for parser in self.parsers:
            if parser.can_parse(file_path):
                return parser
        raise ValueError(f"No parser available for file format: {file_path}")

    def parse_file(self, file_path: str) -> ParsedDocument:
        parser = self.get_parser(file_path)
        return parser.parse(file_path)

parser_factory = ParserFactory()
