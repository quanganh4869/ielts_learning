# IELTS Platform AI & Evaluation Subsystem (`AI/`)

This directory houses the standalone Machine Learning, RAG data pipeline, and evaluation harness for the **IELTS Learning Platform AI Chatbot**.

It operates completely decoupled from the production Spring Boot service and React frontend, serving as the machine learning laboratory and validation suite for:
- RAG document chunking and vector embedding generation
- Scope guard evaluation & benchmark suite
- Anti-prompt injection testing
- Tool calling accuracy & hallucination scoring
- Future fine-tuning and model evaluation (Mistral, LLaMA-3, Qwen-2.5)

---

## Directory Structure

```
AI/
├── config/
│   └── eval_config.yaml         # Configuration for evaluation sets, thresholds, and models
├── data_pipeline/
│   └── ingest_chunks.py         # Chunks IELTS documents and prepares knowledge records
├── evaluation/
│   └── benchmark_eval.py        # Benchmark runner evaluating accuracy, refusal, and latency
├── tests/
│   └── test_evaluation.py       # Python unit tests for evaluation scoring logic
├── .env.example                 # Example environment variables
└── README.md                    # This architecture document
```

---

## Architecture Principles

1. **Decoupled Architecture**:
   The Spring Boot backend interacts with standard REST endpoints or OpenAI-compatible APIs. The ML layer can be swapped (e.g. from Cloud LLM to local Ollama / vLLM / HuggingFace TEI) without touching business logic.

2. **Strict Guardrails Verification**:
   The chatbot must refuse out-of-scope requests (e.g., cooking recipes, coding outside IELTS, political opinions) with a polite redirect towards IELTS subjects.

3. **Zero-Hallucination on User Data**:
   Personal study progress (test scores, vocabulary count, practice time) must originate exclusively from authenticated tool calls bounded to `currentUserId`. The evaluation suite asserts that answers never hallucinate student scores.

---

## Quickstart

### Prerequisites
- Python 3.10+
- `pip install pyyaml pytest` (Optional: `numpy`, `requests`, `openai` for live model testing)

### 1. Ingest & Chunk IELTS Knowledge Documents
```bash
python data_pipeline/ingest_chunks.py --input sample_ielts_guides.txt --output chunks.json
```

### 2. Run Benchmark Evaluation
```bash
python evaluation/benchmark_eval.py --config config/eval_config.yaml
```

### 3. Run Test Suite
```bash
pytest tests/
```
