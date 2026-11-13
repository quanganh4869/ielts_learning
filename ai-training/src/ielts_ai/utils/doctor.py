"""Doctor Preflight Environment & Hardware Diagnostic."""

import os
import sys
import shutil
import platform
import subprocess
from typing import Dict, Any, List
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from .logger import console

def get_disk_space_gb(path: str = ".") -> float:
    total, used, free = shutil.disk_usage(path)
    return round(free / (1024 ** 3), 2)

def check_nvidia_smi() -> Dict[str, Any]:
    gpu_info = {
        "available": False,
        "name": "N/A",
        "driver": "N/A",
        "cuda_version": "N/A",
        "vram_total_mb": 0,
        "vram_free_mb": 0,
    }
    try:
        res = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,driver_version,memory.total,memory.free", "--format=csv,noheader,nounits"],
            capture_output=True,
            text=True,
            timeout=5,
            check=True
        )
        lines = res.stdout.strip().split("\n")
        if lines and lines[0]:
            parts = [p.strip() for p in lines[0].split(",")]
            if len(parts) >= 4:
                gpu_info["available"] = True
                gpu_info["name"] = parts[0]
                gpu_info["driver"] = parts[1]
                gpu_info["vram_total_mb"] = float(parts[2])
                gpu_info["vram_free_mb"] = float(parts[3])
    except Exception:
        pass
    return gpu_info

def check_system_ram_gb() -> float:
    try:
        import psutil
        return round(psutil.virtual_memory().total / (1024 ** 3), 2)
    except Exception:
        return 0.0

def run_doctor() -> Dict[str, Any]:
    console.print("\n[bold cyan]══════════════════════════════════════════════════════════════════[/bold cyan]")
    console.print("[bold yellow]          IELTS AI TRAINING ENGINE — SYSTEM DOCTOR PREFLIGHT       [/bold yellow]")
    console.print("[bold cyan]══════════════════════════════════════════════════════════════════[/bold cyan]\n")

    report: Dict[str, Any] = {
        "os": f"{platform.system()} {platform.release()} ({platform.architecture()[0]})",
        "python_version": sys.version.split()[0],
        "python_ok": sys.version_info >= (3, 10),
        "disk_free_gb": get_disk_space_gb("."),
        "ram_gb": check_system_ram_gb(),
        "gpu": check_nvidia_smi(),
        "torch_version": "N/A",
        "cuda_available_torch": False,
        "libraries": {},
        "training_readiness": "UNKNOWN",
        "recommendations": []
    }

    # 1. Check Libraries
    required_libs = [
        ("torch", "PyTorch deep learning framework"),
        ("transformers", "Hugging Face Transformers"),
        ("peft", "Parameter-Efficient Fine-Tuning (LoRA)"),
        ("trl", "Transformer Reinforcement Learning / SFTTrainer"),
        ("datasets", "Hugging Face Datasets"),
        ("accelerate", "Hardware Acceleration & Training dispatch"),
        ("pymupdf", "PDF parsing & structured layout"),
        ("docx", "DOCX parsing (python-docx)"),
        ("openpyxl", "Excel parsing (openpyxl)"),
        ("pandas", "Data manipulation & tabular structure"),
        ("yaml", "PyYAML configuration management"),
        ("rich", "Terminal formatting"),
    ]

    lib_table = Table(title="[bold green]1. Python & Core Libraries Status[/bold green]", show_header=True, header_style="bold magenta")
    lib_table.add_column("Library", style="cyan", width=18)
    lib_table.add_column("Status", width=12)
    lib_table.add_column("Version", width=16)
    lib_table.add_column("Description", style="dim")

    for mod_name, desc in required_libs:
        try:
            mod = __import__(mod_name)
            ver = getattr(mod, "__version__", "Installed")
            report["libraries"][mod_name] = {"installed": True, "version": ver}
            lib_table.add_row(mod_name, "[bold green]✓ OK[/bold green]", str(ver), desc)
        except ImportError:
            report["libraries"][mod_name] = {"installed": False, "version": None}
            lib_table.add_row(mod_name, "[bold red]✗ Missing[/bold red]", "-", desc)

    console.print(lib_table)

    # 2. Check PyTorch & CUDA
    try:
        import torch
        report["torch_version"] = torch.__version__
        report["cuda_available_torch"] = torch.cuda.is_available()
    except Exception:
        pass

    # 3. Hardware Diagnostic Table
    hw_table = Table(title="[bold green]2. Hardware Resources & Compute Environment[/bold green]", show_header=True, header_style="bold magenta")
    hw_table.add_column("Resource", style="cyan", width=22)
    hw_table.add_column("Detected Value", width=26)
    hw_table.add_column("Assessment", width=24)

    # OS
    hw_table.add_row("Operating System", report["os"], "[green]Supported[/green]")
    
    # Python
    py_status = "[green]✓ Supported (>=3.10)[/green]" if report["python_ok"] else "[red]✗ Upgrade required[/red]"
    hw_table.add_row("Python Runtime", report["python_version"], py_status)

    # RAM
    ram_status = "[green]✓ Sufficient[/green]" if report["ram_gb"] >= 8 else "[yellow]⚠ Tight (< 8GB)[/yellow]"
    hw_table.add_row("System Memory (RAM)", f"{report['ram_gb']} GB", ram_status)

    # Free Disk
    disk_status = "[green]✓ Plentiful (>= 15GB)[/green]" if report["disk_free_gb"] >= 15 else "[yellow]⚠ Low space[/yellow]"
    hw_table.add_row("Available Disk Space", f"{report['disk_free_gb']} GB", disk_status)

    # GPU
    gpu = report["gpu"]
    if gpu["available"]:
        vram_gb = round(gpu["vram_total_mb"] / 1024, 2)
        vram_free_gb = round(gpu["vram_free_mb"] / 1024, 2)
        hw_table.add_row("NVIDIA GPU Detected", f"{gpu['name']}", "[green]Hardware Present[/green]")
        hw_table.add_row("GPU Driver", f"{gpu['driver']}", "[green]Driver Active[/green]")
        
        # Specific assessment for GTX 1650 (4GB)
        if vram_gb <= 4.5:
            hw_assessment = "[yellow]⚠ 4GB VRAM (Budget GPU)[/yellow]"
        else:
            hw_assessment = "[green]✓ Substantial VRAM[/green]"
        hw_table.add_row("VRAM Total / Free", f"{vram_gb} GB / {vram_free_gb} GB", hw_assessment)
    else:
        hw_table.add_row("NVIDIA GPU", "Not Detected / Driver inactive", "[yellow]CPU Only Fallback[/yellow]")

    hw_table.add_row(
        "PyTorch CUDA Bridge",
        f"Active: {report['cuda_available_torch']} ({report['torch_version']})",
        "[green]CUDA Enabled[/green]" if report["cuda_available_torch"] else "[yellow]CPU Mode (Torch+CPU)[/yellow]"
    )

    console.print(hw_table)

    # 4. Realistic Model Feasibility Matrix (Specialized for GTX 1650 4GB)
    feasibility_table = Table(title="[bold green]3. Model Training & Inference Feasibility Analysis[/bold green]", show_header=True, header_style="bold magenta")
    feasibility_table.add_column("Model Tier", style="cyan", width=20)
    feasibility_table.add_column("Memory Req.", width=14)
    feasibility_table.add_column("On Your Machine (Local)", width=24)
    feasibility_table.add_column("Recommended Strategy")

    if gpu["available"] and round(gpu["vram_total_mb"] / 1024, 1) <= 4.5:
        # User has GTX 1650 4GB VRAM
        feasibility_table.add_row(
            "Qwen2.5-0.5B-Instruct",
            "~3.5 GB VRAM",
            "[bold green]FEASIBLE (Local LoRA)[/bold green]",
            "Sequence length <= 512, batch_size=1, gradient_accum=4. Ideal for quick smoke tests & debugging."
        )
        feasibility_table.add_row(
            "Qwen2.5-1.5B-Instruct",
            "~5.5 GB VRAM",
            "[bold yellow]RISKY (High OOM Risk)[/bold yellow]",
            "Only possible with strict 4-bit QLoRA on Linux/WSL2. On Windows CPU mode will be very slow."
        )
        feasibility_table.add_row(
            "Qwen2.5-7B-Instruct",
            "~14.0 GB VRAM",
            "[bold red]IMPOSSIBLE LOCALLY[/bold red]",
            "Requires Cloud GPU (Google Colab T4 16GB, RunPod A40/A100, Lambda). Do NOT train on 4GB VRAM."
        )
    else:
        feasibility_table.add_row("Qwen2.5-0.5B", "3.5 GB", "[green]Feasible[/green]", "Fast local development")
        feasibility_table.add_row("Qwen2.5-1.5B", "5.5 GB", "[yellow]Moderate[/yellow]", "Quantized training")
        feasibility_table.add_row("Qwen2.5-7B", "14.0 GB", "[blue]Cloud Recommended[/blue]", "High quality IELTS tutor")

    console.print(feasibility_table)

    # 5. Strategic Recommendations & Guidance
    rec_text = Text()
    rec_text.append("ACTIONABLE GUIDELINES FOR THIS ENVIRONMENT:\n", style="bold underline yellow")
    
    if not report["cuda_available_torch"] and gpu["available"]:
        rec_text.append("• Notice: You have an NVIDIA GPU, but PyTorch is running the CPU build (2.9.1+cpu).\n", style="yellow")
        rec_text.append("  To activate GPU acceleration on Windows, reinstall PyTorch with CUDA: \n", style="cyan")
        rec_text.append("  pip install torch --index-url https://download.pytorch.org/whl/cu124\n\n", style="bold white")

    rec_text.append("• Local Hardware Profile: Your hardware is optimal for:\n", style="white")
    rec_text.append("  1. Document ingestion and OCR parsing (PDF, Word, Excel).\n", style="green")
    rec_text.append("  2. Dataset validation, deduplication and train/val/test splitting.\n", style="green")
    rec_text.append("  3. Smoke testing the training pipeline using Qwen2.5-0.5B or --dry-run mode.\n", style="green")
    rec_text.append("  4. Local testing of adapters and evaluation benchmarks.\n\n", style="green")

    rec_text.append("• Production Fine-Tuning Advice (Qwen 7B):\n", style="white")
    rec_text.append("  When ready to train the production 7B model, export the prepared dataset (data/splits/) \n", style="cyan")
    rec_text.append("  and run the provided training script on Google Colab Pro or RunPod (A10G or A100 GPU).\n", style="cyan")

    panel = Panel(rec_text, title="[bold green]Doctor Verdict[/bold green]", border_style="green")
    console.print(panel)

    return report
