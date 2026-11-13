"""Dataset Builder: Transform Candidate Records into SFT Training JSONL."""

import os
import json
import glob
from typing import List, Dict, Any
from ..utils.logger import logger, console
from ..utils.config import load_yaml_config

def build_sft_messages(candidate: Dict[str, Any]) -> Dict[str, Any]:
    system_msg = candidate.get("system_prompt", "You are an expert, supportive and precise IELTS Tutor.")
    user_content = candidate["instruction"]
    if candidate.get("input_context"):
        user_content += f"\n\n[Context / Passage]:\n{candidate['input_context']}"

    assistant_content = candidate["response"]

    return {
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_content},
            {"role": "assistant", "content": assistant_content}
        ],
        "metadata": {
            "id": candidate.get("id"),
            "skill": candidate.get("skill", "general_tutor"),
            "doc_type": candidate.get("doc_type", "theory"),
            "source_file": candidate.get("source_file", "unknown")
        }
    }

def run_build_dataset(
    candidates_dir: str = "data/candidates",
    output_dataset_file: str = "data/datasets/ielts_sft.jsonl",
    config_path: str = "configs/dataset.yaml"
) -> int:
    os.makedirs(os.path.dirname(output_dataset_file), exist_ok=True)
    if os.path.isfile(candidates_dir):
        candidate_files = [candidates_dir]
    else:
        candidate_files = glob.glob(os.path.join(candidates_dir, "*.jsonl"))
    
    if not candidate_files:
        logger.warning(f"No candidate files found in '{candidates_dir}'. Checking for sample candidates...")
        sample_file = "data/sample/sample_candidates.jsonl"
        if os.path.exists(sample_file):
            candidate_files = [sample_file]
        else:
            raise FileNotFoundError(f"No candidates found to build dataset from in '{candidates_dir}'.")

    total_records = 0
    with open(output_dataset_file, "w", encoding="utf-8") as out_f:
        for cf in candidate_files:
            with open(cf, "r", encoding="utf-8") as in_f:
                for line in in_f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        record = json.loads(line)
                        sft_item = build_sft_messages(record)
                        out_f.write(json.dumps(sft_item, ensure_ascii=False) + "\n")
                        total_records += 1
                    except Exception as e:
                        logger.warning(f"Skipping malformed line in {cf}: {e}")

    logger.info(f"Built SFT Dataset with [bold green]{total_records}[/bold green] examples at: [cyan]{output_dataset_file}[/cyan]")
    return output_dataset_file
