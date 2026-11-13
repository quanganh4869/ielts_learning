"""Model Versioning & Artifact Registry."""

import os
import json
import glob
from datetime import datetime
from typing import Dict, Any, List, Optional
from rich.table import Table
from .logger import console, logger

class ModelRegistry:
    def __init__(self, adapters_dir: str = "models/adapters", exports_dir: str = "models/exports"):
        self.adapters_dir = adapters_dir
        self.exports_dir = exports_dir
        os.makedirs(self.adapters_dir, exist_ok=True)
        os.makedirs(self.exports_dir, exist_ok=True)

    def create_version_tag(self, prefix: str = "ielts-tutor") -> str:
        existing = glob.glob(os.path.join(self.adapters_dir, f"{prefix}-v*"))
        version_num = 1
        if existing:
            nums = []
            for path in existing:
                basename = os.path.basename(path)
                parts = basename.split("-v")
                if len(parts) == 2 and parts[1].isdigit():
                    nums.append(int(parts[1]))
            if nums:
                version_num = max(nums) + 1
        return f"{prefix}-v{version_num}"

    def register_run(
        self,
        version_tag: str,
        base_model: str,
        dataset_manifest: Dict[str, Any],
        training_config: Dict[str, Any],
        metrics: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        target_dir = os.path.join(self.adapters_dir, version_tag)
        os.makedirs(target_dir, exist_ok=True)

        manifest = {
            "version_tag": version_tag,
            "created_at": datetime.now().isoformat(),
            "base_model": base_model,
            "dataset_info": dataset_manifest,
            "training_config": training_config,
            "metrics": metrics or {},
            "status": "candidate",
            "adapter_path": target_dir,
        }

        manifest_path = os.path.join(target_dir, "model_manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)

        logger.info(f"Registered model version: [bold cyan]{version_tag}[/bold cyan] at {manifest_path}")
        return manifest

    def list_models(self) -> List[Dict[str, Any]]:
        manifest_files = glob.glob(os.path.join(self.adapters_dir, "*", "model_manifest.json"))
        models = []
        for mf in manifest_files:
            try:
                with open(mf, "r", encoding="utf-8") as f:
                    models.append(json.load(f))
            except Exception:
                pass
        
        # Sort by creation time desc
        models.sort(key=lambda m: m.get("created_at", ""), reverse=True)
        return models

    def print_models_table(self) -> None:
        models = self.list_models()
        if not models:
            console.print("[yellow]No fine-tuned model versions found in 'models/adapters/'. Run 'train' first.[/yellow]")
            return

        table = Table(title="[bold green]IELTS AI Model Registry (Trained Versions)[/bold green]", show_header=True, header_style="bold magenta")
        table.add_column("Version Tag", style="cyan", width=18)
        table.add_column("Base Model", width=28)
        table.add_column("Created At", width=20)
        table.add_column("Status", width=12)
        table.add_column("Final Loss / Metrics", style="dim")

        for m in models:
            metrics = m.get("metrics", {})
            loss_str = f"Loss: {metrics.get('train_loss', 'N/A')}" if "train_loss" in metrics else "Smoke / Baseline"
            status_style = "[bold green]Candidate[/bold green]" if m.get("status") == "candidate" else "[cyan]Approved[/cyan]"
            table.add_row(
                m.get("version_tag", "unknown"),
                m.get("base_model", "unknown"),
                m.get("created_at", "")[:19].replace("T", " "),
                status_style,
                loss_str
            )
        console.print(table)
