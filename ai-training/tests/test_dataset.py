"""Tests for dataset building, validation, and stratified splitting."""

import os
import json
import unittest
from ielts_ai.dataset.build_dataset import run_build_dataset
from ielts_ai.dataset.validate_dataset import validate_dataset_file
from ielts_ai.dataset.split_dataset import run_split_dataset

class TestDatasetPipeline(unittest.TestCase):
    def setUp(self):
        self.test_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        self.sample_candidates = os.path.join(self.test_dir, "sample_test_candidates.jsonl")
        self.sample_dataset = os.path.join(self.test_dir, "sample_test_dataset.jsonl")
        
        # Write dummy candidates
        candidates = [
            {
                "id": f"cand_{i}",
                "skill": ["Reading", "Writing", "Listening", "Speaking", "Vocabulary"][i % 5],
                "doc_type": "practice_test",
                "instruction": f"Explain question {i} in IELTS test format.",
                "response": f"This is a verified test response for IELTS exam practice with detailed explanations {i}.",
                "source_file": "test_doc.pdf"
            }
            for i in range(20)
        ]
        with open(self.sample_candidates, "w", encoding="utf-8") as f:
            for c in candidates:
                f.write(json.dumps(c) + "\n")

    def tearDown(self):
        for p in [self.sample_candidates, self.sample_dataset]:
            if os.path.exists(p):
                try:
                    os.remove(p)
                except OSError:
                    pass

    def test_build_dataset(self):
        out_path = run_build_dataset(self.sample_candidates, self.sample_dataset)
        self.assertTrue(os.path.exists(self.sample_dataset))

    def test_validate_dataset(self):
        run_build_dataset(self.sample_candidates, self.sample_dataset)
        report = validate_dataset_file(self.sample_dataset)
        self.assertEqual(report["valid_records"], 20)
        self.assertEqual(report["duplicates"], 0)
        self.assertIn("Reading", report["skill_distribution"])

if __name__ == "__main__":
    unittest.main()
