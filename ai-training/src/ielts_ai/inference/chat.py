"""Interactive CLI Terminal Chat with IELTS AI Model."""

import sys
from rich.panel import Panel
from rich.markdown import Markdown
from .predict import IELTSPredictor
from ..utils.logger import console

def run_chat_session(model_version: str = "ielts-tutor-v1", persona: str = "tutor"):
    console.print("\n[bold cyan]══════════════════════════════════════════════════════════════════[/bold cyan]")
    console.print(f"[bold yellow]        IELTS AI INTERACTIVE TERMINAL CHAT — {model_version.upper()}        [/bold yellow]")
    console.print(f"Active Coaching Persona: [bold green]{persona.upper()}[/bold green]")
    console.print("Type your questions below. Type [bold red]'exit'[/bold red] or [bold red]'quit'[/bold red] to end the session.")
    console.print("[bold cyan]══════════════════════════════════════════════════════════════════[/bold cyan]\n")

    predictor = IELTSPredictor(model_version=model_version)

    while True:
        try:
            user_input = console.input("[bold cyan]Learner > [/bold cyan]").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit", "q"]:
                console.print("[yellow]Ending IELTS AI Chat session. Happy practicing![/yellow]\n")
                break

            console.print("[dim]Thinking...[/dim]")
            response = predictor.generate(user_input, persona=persona)
            console.print(Panel(Markdown(response), title=f"[bold green]IELTS {persona.capitalize()} Coach[/bold green]", border_style="green"))
            console.print()
        except KeyboardInterrupt:
            console.print("\n[yellow]Session interrupted. Goodbye![/yellow]\n")
            break
        except Exception as e:
            console.print(f"[red]Error during generation: {e}[/red]\n")
