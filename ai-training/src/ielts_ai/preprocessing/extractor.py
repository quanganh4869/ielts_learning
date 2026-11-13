"""Candidate Pair Extractor for SFT Dataset Generation."""

import re
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from ..parsers.base_parser import ParsedDocument
from .cleaner import clean_text, sanitize_pii
from .classifier import classify_skill, classify_doc_type

class CandidateItem(BaseModel):
    id: str
    skill: str
    doc_type: str
    system_prompt: str = "You are a professional, accurate and encouraging IELTS Academic and General Training Tutor."
    instruction: str
    input_context: str = ""
    response: str
    source_file: str
    provenance: Dict[str, Any] = Field(default_factory=dict)
    status: str = "candidate_pending_review"

def extract_candidates_from_doc(doc: ParsedDocument) -> List[CandidateItem]:
    candidates: List[CandidateItem] = []
    skill = classify_skill(doc.filename, doc.filename)
    doc_type = classify_doc_type(doc.filename, doc.filename)

    # 1. Check if the document has table data or json records
    records_to_process = []
    for c in doc.chunks:
        if c.table_data:
            for r_idx, r in enumerate(c.table_data):
                records_to_process.append((c.chunk_id, r_idx, r))
        elif c.chunk_type == "json_record" and "json_data" in c.metadata:
            records_to_process.append((c.chunk_id, 0, c.metadata["json_data"]))

    for chunk_id, row_idx, row in records_to_process:
        # Search for Q&A, Vocabulary, or Instruction/Response columns
                keys_lower = {k.lower(): k for k in row.keys()}
                inst_key = next((keys_lower[k] for k in ["question", "instruction", "prompt", "cau hoi", "yeu cau"] if k in keys_lower), None)
                resp_key = next((keys_lower[k] for k in ["answer", "response", "dap an", "explanation", "giai thich", "model_answer"] if k in keys_lower), None)
                input_key = next((keys_lower[k] for k in ["context", "passage", "input", "doan van", "text"] if k in keys_lower), None)

                # Vocabulary detection (Word, Definition, Collocations, Example)
                word_key = next((keys_lower[k] for k in ["word / phrase", "word", "phrase", "tu vung", "term"] if k in keys_lower), None)
                def_key = next((keys_lower[k] for k in ["definition", "dinh nghia", "meaning"] if k in keys_lower), None)

                # Speaking / Writing evaluation record detection
                topic_key = next((keys_lower[k] for k in ["topic", "task", "prompt", "chu de"] if k in keys_lower), None)
                speech_key = next((keys_lower[k] for k in ["candidate_speech", "speech", "essay", "bai noi", "bai viet"] if k in keys_lower), None)

                if inst_key and resp_key:
                    inst = clean_text(sanitize_pii(str(row[inst_key])))
                    resp = clean_text(sanitize_pii(str(row[resp_key])))
                    inp = clean_text(sanitize_pii(str(row.get(input_key, "")))) if input_key else ""

                    if len(inst) >= 5 and len(resp) >= 10:
                        row_skill = classify_skill(inst + " " + resp, doc.filename)
                        candidates.append(CandidateItem(
                            id=f"{doc.filename}_tbl_{row_idx}",
                            skill=row_skill,
                            doc_type=doc_type,
                            instruction=inst,
                            input_context=inp,
                            response=resp,
                            source_file=doc.filename,
                            provenance={"chunk_id": c.chunk_id, "row_idx": row_idx}
                        ))
                elif word_key and def_key:
                    word = clean_text(str(row[word_key]))
                    definition = clean_text(str(row[def_key]))
                    colloc = clean_text(str(row.get(keys_lower.get("collocations", ""), "")))
                    pos = clean_text(str(row.get(keys_lower.get("part of speech", ""), "")))
                    band = clean_text(str(row.get(keys_lower.get("band level", ""), "")))
                    example = clean_text(str(row.get(keys_lower.get("example sentence", ""), "")))

                    inst = f"Explain the meaning, collocations, and IELTS Academic usage of the term '{word}'."
                    resp_parts = [f"**Term**: {word} ({pos}) - Target Band: {band}"]
                    resp_parts.append(f"**Definition**: {definition}")
                    if colloc:
                        resp_parts.append(f"**High-scoring Collocations**: {colloc}")
                    if example:
                        resp_parts.append(f"**Example in Context**: {example}")
                    resp = "\n".join(resp_parts)

                    candidates.append(CandidateItem(
                        id=f"{doc.filename}_vocab_{row_idx}",
                        skill="Vocabulary",
                        doc_type="vocabulary_table",
                        instruction=inst,
                        input_context="",
                        response=resp,
                        source_file=doc.filename,
                        provenance={"chunk_id": c.chunk_id, "row_idx": row_idx}
                    ))
                elif topic_key and speech_key:
                    topic = clean_text(str(row[topic_key]))
                    speech = clean_text(str(row[speech_key]))
                    band = str(row.get("band_score", "7.5"))
                    fc = str(row.get("fluency_and_coherence", ""))
                    lr = str(row.get("lexical_resource", ""))
                    gra = str(row.get("grammatical_range", ""))
                    pron = str(row.get("pronunciation", ""))

                    inst = f"Evaluate the following IELTS candidate response on the topic: '{topic}'"
                    resp = f"**Overall Band Score**: {band}\n\n**Examiner Evaluation Breakdown**:\n"
                    if fc:
                        resp += f"- **Fluency and Coherence**: {fc}\n"
                    if lr:
                        resp += f"- **Lexical Resource**: {lr}\n"
                    if gra:
                        resp += f"- **Grammatical Range & Accuracy**: {gra}\n"
                    if pron:
                        resp += f"- **Pronunciation**: {pron}\n"

                    candidates.append(CandidateItem(
                        id=f"{doc.filename}_eval_{row_idx}",
                        skill="Speaking" if "speaking" in doc.filename.lower() else "Writing",
                        doc_type="assessment_rubric",
                        instruction=inst,
                        input_context=speech,
                        response=resp,
                        source_file=doc.filename,
                        provenance={"chunk_id": c.chunk_id, "row_idx": row_idx}
                    ))

    # 2. Extract Q&A patterns from structured paragraphs
    full_text = "\n\n".join([c.content for c in doc.chunks if c.chunk_type in ["paragraph", "heading"]])
    qa_pattern = re.compile(
        r"(?:Question|Q|Câu hỏi|Topic|Task)\s*(?:\d+)?[:.]\s*(.*?)\n+(?:Answer|Model Answer|Explanation|Đáp án|Feedback)[:.]\s*(.*?)(?=(?:\n+(?:Question|Q|Câu hỏi|Topic|Task)\s*(?:\d+)?[:.]|\Z))",
        re.DOTALL | re.IGNORECASE
    )

    for idx, match in enumerate(qa_pattern.finditer(full_text)):
        inst = clean_text(sanitize_pii(match.group(1)))
        resp = clean_text(sanitize_pii(match.group(2)))
        if len(inst) >= 5 and len(resp) >= 15:
            cand_skill = classify_skill(inst + " " + resp, doc.filename)
            candidates.append(CandidateItem(
                id=f"{doc.filename}_qa_{idx}",
                skill=cand_skill,
                doc_type=doc_type,
                instruction=inst,
                input_context="",
                response=resp,
                source_file=doc.filename,
                provenance={"pattern": "regex_qa_block", "match_index": idx}
            ))

    # 3. If no Q&A pattern found but document is a verified theory/guide
    if not candidates and len(doc.chunks) >= 2:
        # Group headings and paragraphs into conceptual tutoring chunks
        current_heading = doc.filename
        content_buffer = []
        for c in doc.chunks:
            if c.chunk_type == "heading":
                if content_buffer:
                    resp_body = clean_text(sanitize_pii("\n\n".join(content_buffer)))
                    if len(resp_body) >= 40:
                        candidates.append(CandidateItem(
                            id=f"{doc.filename}_th_{len(candidates)}",
                            skill=skill,
                            doc_type="theory",
                            instruction=f"Explain the key concepts and rules regarding '{current_heading}' in IELTS.",
                            response=resp_body,
                            source_file=doc.filename,
                            provenance={"heading": current_heading}
                        ))
                    content_buffer = []
                current_heading = c.content
            elif c.chunk_type == "paragraph":
                content_buffer.append(c.content)

        if content_buffer:
            resp_body = clean_text(sanitize_pii("\n\n".join(content_buffer)))
            if len(resp_body) >= 40:
                candidates.append(CandidateItem(
                    id=f"{doc.filename}_th_{len(candidates)}",
                    skill=skill,
                    doc_type="theory",
                    instruction=f"Explain the principles and guidance on '{current_heading}' in IELTS.",
                    response=resp_body,
                    source_file=doc.filename,
                    provenance={"heading": current_heading}
                ))

    return candidates
