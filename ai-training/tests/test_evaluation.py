"""Tests for evaluation metrics and benchmark scoring."""

import unittest
from ielts_ai.evaluation.metrics import (
    compute_token_overlap_f1,
    check_json_validity,
    check_ielts_writing_criteria_coverage,
    check_anti_extrapolation_rule
)

class TestEvaluationMetrics(unittest.TestCase):
    def test_token_f1_exact(self):
        f1 = compute_token_overlap_f1("The answer is True.", "The answer is True.")
        self.assertAlmostEqual(f1, 1.0)

    def test_token_f1_partial(self):
        f1 = compute_token_overlap_f1("Geothermal baseload power", "Geothermal continuous baseload power")
        self.assertGreater(f1, 0.7)

    def test_validate_json_structure(self):
        valid_json = '{"task": "reading", "score": 7.5, "passed": true}'
        res = check_json_validity(valid_json)
        self.assertTrue(res)

        invalid_json = '{"task": reading, invalid}'
        res_invalid = check_json_validity(invalid_json)
        self.assertFalse(res_invalid)

    def test_4_criteria_coverage(self):
        full_critique = (
            "Assessment details:\n"
            "1. Task Response (TR): Well developed position.\n"
            "2. Coherence and Cohesion (CC): Clear paragraphing.\n"
            "3. Lexical Resource (LR): Rich academic collocations.\n"
            "4. Grammatical Range and Accuracy (GRA): Complex sentences."
        )
        cov = check_ielts_writing_criteria_coverage(full_critique)
        self.assertTrue(cov["task_achievement_or_response"])
        self.assertTrue(cov["coherence_cohesion"])
        self.assertTrue(cov["lexical_resource"])
        self.assertTrue(cov["grammatical_range_accuracy"])

    def test_anti_extrapolation(self):
        # NOT GIVEN statement should not invent reasons
        safe_response = "The passage does not mention this detail. Therefore, the answer is NOT GIVEN. Do not extrapolate."
        passed = check_anti_extrapolation_rule(safe_response)
        self.assertTrue(passed)

if __name__ == "__main__":
    unittest.main()
