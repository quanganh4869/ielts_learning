"""IELTS Skill & Document Type Classifier."""

from typing import Tuple

def classify_skill(text: str, filename: str = "") -> str:
    """Classifies content into listening, reading, writing, speaking, or general_tutor."""
    combined = (filename + " " + text[:500]).lower()

    if any(k in combined for k in ["listening", "audio", "transcript", "section 1", "section 2", "section 3", "section 4", "recording"]):
        return "listening"
    if any(k in combined for k in ["reading", "passage 1", "passage 2", "passage 3", "true false", "tfng", "not given", "matching headings"]):
        return "reading"
    if any(k in combined for k in ["writing", "task 1", "task 2", "essay", "overview", "line graph", "bar chart", "letter"]):
        return "writing"
    if any(k in combined for k in ["speaking", "part 1", "part 2", "part 3", "cue card", "pronunciation", "fluency"]):
        return "speaking"
    return "general_tutor"

def classify_doc_type(text: str, filename: str = "") -> str:
    """Classifies document role: theory, exercise, answer_key, exemplar, rubric."""
    combined = (filename + " " + text[:500]).lower()

    if any(k in combined for k in ["answer key", "keys", "dap an", "answers", "tapescript"]):
        return "answer_key"
    if any(k in combined for k in ["sample", "band 8", "band 9", "model answer", "exemplar"]):
        return "exemplar"
    if any(k in combined for k in ["rubric", "criteria", "band descriptor", "tieu chi"]):
        return "rubric"
    if any(k in combined for k in ["exercise", "practice", "questions", "bai tap"]):
        return "exercise"
    return "theory"
