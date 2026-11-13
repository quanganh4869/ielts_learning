"""Dataset Splitter: Stratified Train / Validation / Test Splitting with Manifest."""

import os
import json
import random
from typing import Dict, Any, List
from collections import defaultdict
from ..utils.logger import logger, console
from ..utils.config import load_yaml_config

def run_split_dataset(
    dataset_file: str = "data/datasets/ielts_sft.jsonl",
    output_dir: str = "data/splits",
    config_path: str = "configs/dataset.yaml"
) -> Dict[str, Any]:
    if not os.path.exists(dataset_file):
        raise FileNotFoundError(f"Input dataset not found: {dataset_file}")

    os.makedirs(output_dir, exist_ok=True)
    config = load_yaml_config(config_path) if os.path.exists(config_path) else {}
    split_cfg = config.get("split", {})

    train_ratio = split_cfg.get("train_ratio", 0.80)
    val_ratio = split_cfg.get("val_ratio", 0.10)
    test_ratio = split_cfg.get("test_ratio", 0.10)
    seed = split_cfg.get("seed", 42)

    random.seed(seed)

    # Read all valid lines and group by skill for stratified split
    records_by_skill = defaultdict(list)
    total_records = 0

    with open(dataset_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                meta = data.get("metadata", {})
                skill = meta.get("skill", "general_tutor")
                records_by_skill[skill].append(data)
                total_records += 1
            except Exception:
                continue

    train_data = []
    val_data = []
    test_data = []

    for skill, items in records_by_skill.items():
        random.shuffle(items)
        n = len(items)
        n_train = int(n * train_ratio)
        n_val = int(n * val_ratio)
        # Avoid zero val/test if n is sufficient
        if n >= 3 and n_val == 0:
            n_val = 1
        if n >= 3 and (n - n_train - n_val) == 0:
            n_train = max(1, n_train - 1)

        train_slice = items[:n_train]
        val_slice = items[n_train:n_train + n_val]
        test_slice = items[n_train + n_val:]

        train_data.extend(train_slice)
        val_data.extend(val_slice)
        test_data.extend(test_slice)

    # Shuffle combined sets
    random.shuffle(train_data)
    random.shuffle(val_data)
    random.shuffle(test_data)

    train_path = os.path.join(output_dir, "train.jsonl")
    val_path = os.path.join(output_dir, "val.jsonl")
    test_path = os.path.join(output_dir, "test.jsonl")

    def write_jsonl(path: str, items: List[Dict[str, Any]]):
        with open(path, "w", encoding="utf-8") as f:
            for it in items:
                f.write(json.dumps(it, ensure_ascii=False) + "\n")

    write_jsonl(train_path, train_data)
    write_jsonl(val_path, val_data)
    write_jsonl(test_path, test_data)

    manifest = {
        "dataset_source": dataset_file,
        "seed": seed,
        "ratios": {"train": train_ratio, "val": val_ratio, "test": test_ratio},
        "total_records": total_records,
        "train_count": len(train_data),
        "val_count": len(val_data),
        "test_count": len(test_data),
        "skills_stratified": list(records_by_skill.keys()),
        "output_files": {
            "train": train_path,
            "val": val_path,
            "test": test_path
        }
    }

    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    logger.info(f"Dataset split complete: [green]Train={len(train_data)}[/green], [yellow]Val={len(val_data)}[/yellow], [cyan]Test={len(test_data)}[/cyan]")
    logger.info(f"Manifest written to: [bold white]{manifest_path}[/bold white]")

    return manifest
