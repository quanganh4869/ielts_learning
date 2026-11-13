"""Evaluation Metrics for IELTS AI Models."""

import json
import re
from typing import Dict, Any, List

def compute_token_overlap_f1(prediction: str, reference: str) -> float:
    """Computes word-level token overlap F1 score (similar to ROUGE-1)."""
    pred_tokens = re.findall(r"\w+", prediction.lower())
    ref_tokens = re.findall(r"\w+", reference.lower())
    
    if not pred_tokens or not ref_tokens:
        return 0.0

    pred_set = set(pred_tokens)
    ref_set = set(ref_tokens)
    common = pred_set.intersection(ref_set)

    if not common:
        return 0.0

    precision = len(common) / len(pred_set)
    recall = len(common) / len(ref_set)
    f1 = 2 * (precision * recall) / (precision + recall)
    return round(f1, 4)

def check_json_validity(text: str) -> bool:
    """Checks if text contains valid, parseable JSON."""
    text = text.strip()
    # Try finding json block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        text = match.group(1)
    elif "{" in text and "}" in text:
        start = text.find("{")
        end = text.rfind("}") + 1
        text = text[start:end]

    try:
        json.loads(text)
        return True
    except Exception:
        return False

def check_ielts_writing_criteria_coverage(text: str) -> Dict[str, bool]:
    """Verifies presence of all 4 official IELTS Writing assessment criteria."""
    t_lower = text.lower()
    return {
        "task_achievement_or_response": any(k in t_lower for k in ["task achievement", "task response", "overview", "prompt"]),
        "coherence_cohesion": any(k in t_lower for k in ["coherence", "cohesion", "paragraph", "linking", "connectors"]),
        "lexical_resource": any(k in t_lower for k in ["lexical", "vocabulary", "collocations", "word choice"]),
        "grammatical_range_accuracy": any(k in t_lower for k in ["grammatical", "grammar", "sentence structure", "tense"])
    }

def check_anti_extrapolation_rule(text: str) -> bool:
    """Checks if explanation warns about not extrapolating real-world knowledge in TFNG."""
    t_lower = text.lower()
    return any(k in t_lower for k in ["extrapolat", "not given", "outside knowledge", "chỉ dựa vào bài đọc", "không suy diễn"])
