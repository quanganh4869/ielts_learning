"""Dataset Validator: Schema Integrity, Deduplication & Quality Constraints."""

import os
import json
import hashlib
from typing import Dict, Any, List
from rich.table import Table
from ..utils.logger import logger, console
from ..utils.config import load_yaml_config

def compute_hash(text: str) -> str:
    return hashlib.md5(text.strip().lower().encode("utf-8")).hexdigest()

def validate_dataset_file(
    dataset_file: str = "data/datasets/ielts_sft.jsonl",
    config_path: str = "configs/dataset.yaml"
) -> Dict[str, Any]:
    if not os.path.exists(dataset_file):
        raise FileNotFoundError(f"Dataset file not found: {dataset_file}")

    config = load_yaml_config(config_path) if os.path.exists(config_path) else {}
    val_rules = config.get("validation", {})
    min_inst_len = val_rules.get("min_instruction_length", 5)
    min_resp_len = val_rules.get("min_response_length", 10)

    total_count = 0
    valid_count = 0
    duplicate_count = 0
    short_content_count = 0
    missing_roles_count = 0
    schema_errors_count = 0

    seen_hashes = set()
    skill_counts: Dict[str, int] = {}
    validation_errors: List[str] = []

    with open(dataset_file, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f, 1):
            total_count += 1
            line = line.strip()
            if not line:
                continue

            try:
                data = json.loads(line)
            except json.JSONDecodeError as e:
                schema_errors_count += 1
                validation_errors.append(f"Line {idx}: Invalid JSON syntax ({e})")
                continue

            messages = data.get("messages")
            if not isinstance(messages, list) or len(messages) < 2:
                schema_errors_count += 1
                validation_errors.append(f"Line {idx}: 'messages' must be a list with at least user and assistant")
                continue

            roles = [m.get("role") for m in messages if isinstance(m, dict)]
            if "user" not in roles or "assistant" not in roles:
                missing_roles_count += 1
                validation_errors.append(f"Line {idx}: Missing required 'user' or 'assistant' role")
                continue

            # Extract user & assistant contents
            user_msg = next((m.get("content", "") for m in messages if m.get("role") == "user"), "")
            asst_msg = next((m.get("content", "") for m in messages if m.get("role") == "assistant"), "")

            if len(user_msg.strip()) < min_inst_len or len(asst_msg.strip()) < min_resp_len:
                short_content_count += 1
                validation_errors.append(f"Line {idx}: Message content too short (user={len(user_msg)}, asst={len(asst_msg)})")
                continue

            # Check duplicate user query
            u_hash = compute_hash(user_msg)
            if u_hash in seen_hashes:
                duplicate_count += 1
                validation_errors.append(f"Line {idx}: Duplicate user query detected")
                continue
            seen_hashes.add(u_hash)

            # Metadata skill distribution
            meta = data.get("metadata", {})
            skill = meta.get("skill", "general_tutor")
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
            valid_count += 1

    is_passed = (valid_count > 0 and schema_errors_count == 0 and missing_roles_count == 0)

    # Display Rich Validation Summary Table
    table = Table(title="[bold green]Dataset Validation Summary Report[/bold green]", show_header=True, header_style="bold magenta")
    table.add_column("Metric / Check", style="cyan", width=32)
    table.add_column("Result", width=18)
    table.add_column("Status Assessment", width=22)

    table.add_row("Total Processed Records", str(total_count), "[green]Processed[/green]")
    table.add_row("Valid Training Samples", str(valid_count), f"[bold green]{valid_count}/{total_count}[/bold green]")
    table.add_row("JSON Schema Malformations", str(schema_errors_count), "[green]0 Errors[/green]" if schema_errors_count == 0 else f"[red]{schema_errors_count} Errors[/red]")
    table.add_row("Missing Required Roles", str(missing_roles_count), "[green]0 Missing[/green]" if missing_roles_count == 0 else f"[red]{missing_roles_count} Missing[/red]")
    table.add_row("Duplicates Filtered", str(duplicate_count), "[yellow]Filtered[/yellow]" if duplicate_count > 0 else "[green]0 Duplicates[/green]")
    table.add_row("Trivial / Short Content", str(short_content_count), "[yellow]Filtered[/yellow]" if short_content_count > 0 else "[green]0 Too Short[/green]")

    console.print(table)

    # Skill distribution table
    skill_table = Table(title="[bold green]Skill Distribution[/bold green]", show_header=True, header_style="bold magenta")
    skill_table.add_column("IELTS Domain", style="cyan", width=20)
    skill_table.add_column("Sample Count", width=16)
    skill_table.add_column("Percentage", width=16)

    for sk, count in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True):
        pct = f"{(count / max(1, valid_count)) * 100:.1f}%"
        skill_table.add_row(sk.replace("_", " ").title(), str(count), pct)

    console.print(skill_table)

    status_color = "green" if is_passed else "red"
    console.print(f"[{status_color}]Overall Validation Status: {'PASSED' if is_passed else 'FAILED'}[/{status_color}]\n")

    return {
        "passed": is_passed,
        "total_records": total_count,
        "valid_records": valid_count,
        "schema_errors": schema_errors_count,
        "duplicates": duplicate_count,
        "skill_distribution": skill_counts,
        "errors": validation_errors[:20],
    }
