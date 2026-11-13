"""IELTS AI Command-Line Interface (CLI)."""

import argparse
import os
import glob
import json
import sys
from .utils.logger import console, logger
from .utils.doctor import run_doctor
from .utils.versioning import ModelRegistry
from .parsers.parser_factory import parser_factory
from .preprocessing.extractor import extract_candidates_from_doc
from .dataset.build_dataset import run_build_dataset
from .dataset.validate_dataset import validate_dataset_file
from .dataset.split_dataset import run_split_dataset
from .training.train import run_training
from .evaluation.evaluate import run_evaluation
from .inference.chat import run_chat_session

def handle_doctor(args):
    run_doctor()

def handle_documents_process(args):
    input_dir = args.input or "data/raw"
    output_candidates_file = args.output or "data/candidates/candidates.jsonl"
    processed_dir = "data/processed"
    os.makedirs(os.path.dirname(output_candidates_file), exist_ok=True)
    os.makedirs(processed_dir, exist_ok=True)

    supported_patterns = ["*.pdf", "*.docx", "*.doc", "*.xlsx", "*.xls", "*.txt", "*.md", "*.csv", "*.jsonl"]
    raw_files = []
    for pat in supported_patterns:
        raw_files.extend(glob.glob(os.path.join(input_dir, pat)))
        # Also check subdirectories
        raw_files.extend(glob.glob(os.path.join(input_dir, "**", pat), recursive=True))

    raw_files = sorted(list(set(raw_files)))
    if not raw_files:
        console.print(f"[yellow]No documents found in '{input_dir}'. Please place PDF, DOCX, XLSX, TXT or MD files there.[/yellow]")
        return

    console.print(f"\n[bold green]Processing {len(raw_files)} documents from '{input_dir}'...[/bold green]")
    total_candidates = 0

    with open(output_candidates_file, "w", encoding="utf-8") as out_f:
        for fpath in raw_files:
            try:
                console.print(f"Parsing: [cyan]{os.path.basename(fpath)}[/cyan]...")
                doc = parser_factory.parse_file(fpath)
                
                # Save structured markdown to processed
                base_name = os.path.splitext(os.path.basename(fpath))[0]
                proc_path = os.path.join(processed_dir, f"{base_name}.md")
                with open(proc_path, "w", encoding="utf-8") as p_out:
                    p_out.write(doc.to_markdown())

                # Extract candidate instruction-response pairs
                candidates = extract_candidates_from_doc(doc)
                for cand in candidates:
                    out_f.write(json.dumps(cand.model_dump(), ensure_ascii=False) + "\n")
                    total_candidates += 1

                console.print(f"  [green]✓ Extracted {len(candidates)} training candidates.[/green]")
            except Exception as e:
                console.print(f"  [red]✗ Failed to parse {fpath}: {e}[/red]")

    console.print(f"\n[bold green]✓ Document Ingestion Complete![/bold green] Total candidates generated: [bold cyan]{total_candidates}[/bold cyan]")
    console.print(f"Candidates saved to: [cyan]{output_candidates_file}[/cyan]\n")

def handle_dataset_build(args):
    run_build_dataset()

def handle_dataset_validate(args):
    dataset_file = args.file or "data/datasets/ielts_sft.jsonl"
    validate_dataset_file(dataset_file)

def handle_dataset_split(args):
    dataset_file = args.file or "data/datasets/ielts_sft.jsonl"
    run_split_dataset(dataset_file)

def handle_train(args):
    run_training(
        config_path=args.config or "configs/training.yaml",
        dry_run=args.dry_run,
        override_epochs=args.epochs
    )

def handle_evaluate(args):
    run_evaluation(
        model_version=args.model_version or "ielts-tutor-v1",
        test_file=args.test_file or "data/splits/test.jsonl"
    )

def handle_models_list(args):
    registry = ModelRegistry()
    registry.print_models_table()

def handle_models_export(args):
    version = args.model_version or "ielts-tutor-v1"
    src_dir = os.path.join("models/adapters", version)
    if not os.path.exists(src_dir):
        console.print(f"[red]Model adapter directory not found: {src_dir}[/red]")
        return

    dest_dir = os.path.join("models/exports", version)
    os.makedirs(dest_dir, exist_ok=True)
    import shutil
    for item in os.listdir(src_dir):
        s = os.path.join(src_dir, item)
        d = os.path.join(dest_dir, item)
        if os.path.isfile(s):
            shutil.copy2(s, d)

    console.print(f"[bold green]✓ Exported model version '{version}' to:[/bold green] [cyan]{dest_dir}[/cyan]")

def handle_chat(args):
    run_chat_session(
        model_version=args.model_version or "ielts-tutor-v1",
        persona=args.persona or "tutor"
    )

def main():
    parser = argparse.ArgumentParser(
        prog="python -m ielts_ai",
        description="IELTS AI Standalone Training & Evaluation CLI Engine"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # 1. doctor
    subparsers.add_parser("doctor", help="Inspect hardware, GPU, VRAM and libraries")

    # 2. documents
    doc_parser = subparsers.add_parser("documents", help="Process raw documents")
    doc_sub = doc_parser.add_subparsers(dest="subcommand")
    proc_p = doc_sub.add_parser("process", help="Parse and extract candidates from data/raw")
    proc_p.add_argument("--input", default="data/raw", help="Input directory")
    proc_p.add_argument("--output", default="data/candidates/candidates.jsonl", help="Output candidates path")

    # 3. dataset
    data_parser = subparsers.add_parser("dataset", help="Dataset tools")
    data_sub = data_parser.add_subparsers(dest="subcommand")
    data_sub.add_parser("build", help="Build SFT dataset from candidates")
    val_p = data_sub.add_parser("validate", help="Validate dataset schema and sanity")
    val_p.add_argument("--file", default="data/datasets/ielts_sft.jsonl", help="Dataset file to validate")
    split_p = data_sub.add_parser("split", help="Split dataset into train, val and test")
    split_p.add_argument("--file", default="data/datasets/ielts_sft.jsonl", help="Dataset file to split")

    # 4. train
    train_p = subparsers.add_parser("train", help="Run model fine-tuning")
    train_p.add_argument("--config", default="configs/training.yaml", help="Path to training config YAML")
    train_p.add_argument("--dry-run", action="store_true", help="Run quick pipeline verification without long training")
    train_p.add_argument("--epochs", type=int, default=None, help="Override number of epochs")

    # 5. evaluate
    eval_p = subparsers.add_parser("evaluate", help="Benchmark model on test split")
    eval_p.add_argument("--model-version", default="ielts-tutor-v1", help="Model version tag to evaluate")
    eval_p.add_argument("--test-file", default="data/splits/test.jsonl", help="Path to test split")

    # 6. models
    model_p = subparsers.add_parser("models", help="Model artifact management")
    m_sub = model_p.add_subparsers(dest="subcommand")
    m_sub.add_parser("list", help="List trained model versions and status")
    exp_p = m_sub.add_parser("export", help="Export adapter package for inference")
    exp_p.add_argument("--model-version", default="ielts-tutor-v1", help="Model version to export")

    # 7. chat
    chat_p = subparsers.add_parser("chat", help="Start interactive CLI terminal chat with model")
    chat_p.add_argument("--model-version", default="ielts-tutor-v1", help="Model version to chat with")
    chat_p.add_argument("--persona", choices=["tutor", "listening", "reading", "writing", "speaking"], default="tutor", help="Coaching persona")

    args = parser.parse_args()

    if args.command == "doctor":
        handle_doctor(args)
    elif args.command == "documents" and getattr(args, "subcommand", None) == "process":
        handle_documents_process(args)
    elif args.command == "dataset":
        if getattr(args, "subcommand", None) == "build":
            handle_dataset_build(args)
        elif getattr(args, "subcommand", None) == "validate":
            handle_dataset_validate(args)
        elif getattr(args, "subcommand", None) == "split":
            handle_dataset_split(args)
        else:
            parser.print_help()
    elif args.command == "train":
        handle_train(args)
    elif args.command == "evaluate":
        handle_evaluate(args)
    elif args.command == "models":
        if getattr(args, "subcommand", None) == "list":
            handle_models_list(args)
        elif getattr(args, "subcommand", None) == "export":
            handle_models_export(args)
        else:
            parser.print_help()
    elif args.command == "chat":
        handle_chat(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
