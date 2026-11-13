"""Tests for document parsers (PDF, DOCX, XLSX, TXT, MD, JSONL)."""

import os
import unittest
from ielts_ai.parsers.parser_factory import parser_factory
from ielts_ai.parsers.text_parser import TextParser
from ielts_ai.parsers.excel_parser import ExcelParser
from ielts_ai.parsers.docx_parser import DocxParser
from ielts_ai.parsers.pdf_parser import PDFParser

class TestParsers(unittest.TestCase):
    def setUp(self):
        self.sample_dir = os.path.join(os.path.dirname(__file__), "..", "data", "sample")

    def test_text_parser(self):
        txt_path = os.path.join(self.sample_dir, "listening_section1_accommodation.txt")
        if os.path.exists(txt_path):
            doc = parser_factory.parse_file(txt_path)
            self.assertEqual(doc.file_extension, ".txt")
            self.assertGreater(len(doc.chunks), 0)

    def test_markdown_parser(self):
        md_path = os.path.join(self.sample_dir, "reading_renewable_energy.md")
        if os.path.exists(md_path):
            doc = parser_factory.parse_file(md_path)
            self.assertEqual(doc.file_extension, ".md")
            self.assertTrue(any("geothermal" in c.content.lower() for c in doc.chunks))

    def test_docx_parser(self):
        docx_path = os.path.join(self.sample_dir, "writing_task2_tertiary_education.docx")
        if os.path.exists(docx_path):
            doc = parser_factory.parse_file(docx_path)
            self.assertEqual(doc.file_extension, ".docx")
            self.assertGreater(len(doc.chunks), 2)

    def test_excel_parser(self):
        xlsx_path = os.path.join(self.sample_dir, "ielts_academic_vocab_band7plus.xlsx")
        if os.path.exists(xlsx_path):
            doc = parser_factory.parse_file(xlsx_path)
            self.assertEqual(doc.file_extension, ".xlsx")
            self.assertTrue(any(c.table_data for c in doc.chunks))

    def test_pdf_parser(self):
        pdf_path = os.path.join(self.sample_dir, "reading_ai_in_healthcare.pdf")
        if os.path.exists(pdf_path):
            doc = parser_factory.parse_file(pdf_path)
            self.assertEqual(doc.file_extension, ".pdf")
            self.assertGreater(len(doc.chunks), 0)

if __name__ == "__main__":
    unittest.main()
