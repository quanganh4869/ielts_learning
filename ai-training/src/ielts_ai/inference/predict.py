"""Inference Engine: Load Base Model with Fine-Tuned LoRA Adapter."""

import os
import torch
from typing import Optional, Dict, Any
from .prompts import get_system_prompt
from ..utils.logger import logger, console
from ..utils.config import load_yaml_config

class IELTSPredictor:
    def __init__(
        self,
        model_version: Optional[str] = None,
        config_path: str = "configs/model.yaml",
        training_config_path: str = "configs/training.yaml"
    ):
        self.config = load_yaml_config(config_path) if os.path.exists(config_path) else {}
        self.training_config = load_yaml_config(training_config_path) if os.path.exists(training_config_path) else {}
        self.base_model_name = self.training_config.get("model_name", "Qwen/Qwen2.5-0.5B-Instruct")
        self.model_version = model_version or "base"
        self.adapter_dir = os.path.join("models/adapters", self.model_version) if self.model_version != "base" else None

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tokenizer = None
        self.model = None
        self._load_model()

    def _load_model(self):
        console.print(f"[dim]Loading tokenizer and model ({self.base_model_name}) on {self.device}...[/dim]")
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM
            self.tokenizer = AutoTokenizer.from_pretrained(self.base_model_name, trust_remote_code=True)
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            self.model = AutoModelForCausalLM.from_pretrained(
                self.base_model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                trust_remote_code=True
            )

            # Load LoRA adapter if specified and exists
            if self.adapter_dir and os.path.exists(os.path.join(self.adapter_dir, "adapter_config.json")):
                from peft import PeftModel
                console.print(f"[dim]Attaching LoRA Adapter from {self.adapter_dir}...[/dim]")
                self.model = PeftModel.from_pretrained(self.model, self.adapter_dir)

            console.print(f"[bold green]✓ Model {self.base_model_name} (Adapter: {self.model_version}) loaded successfully![/bold green]")
        except Exception as e:
            logger.warning(f"Live model loading fallback active ({e}). Using deterministic offline inference engine.")
            self.model = None

    def generate(
        self,
        user_message: str,
        persona: str = "tutor",
        max_new_tokens: int = 512,
        temperature: float = 0.3,
    ) -> str:
        system_prompt = get_system_prompt(persona)

        if self.model is not None and self.tokenizer is not None:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
            text = self.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            inputs = self.tokenizer([text], return_tensors="pt").to(self.device)

            with torch.no_grad():
                generated_ids = self.model.generate(
                    **inputs,
                    max_new_tokens=max_new_tokens,
                    temperature=temperature,
                    do_sample=temperature > 0,
                    pad_token_id=self.tokenizer.pad_token_id,
                )
                generated_ids = [
                    output_ids[len(input_ids):] for input_ids, output_ids in zip(inputs.input_ids, generated_ids)
                ]
                response = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
                return response.strip()

        # Fallback response engine for local offline testing without downloading large model
        u_lower = user_message.lower()
        if "false" in u_lower and "not given" in u_lower:
            return (
                "**Quy tắc phân biệt TRUE, FALSE và NOT GIVEN trong IELTS Reading:**\n\n"
                "1. **TRUE:** Thông tin trong câu hỏi hoàn toàn trùng khớp hoặc được paraphrase tương đương nghĩa với bài đọc.\n"
                "2. **FALSE:** Thông tin trong câu hỏi mâu thuẫn trực tiếp (contradicts) với bài đọc. Cả hai không thể cùng đúng.\n"
                "3. **NOT GIVEN:** Bài đọc không cung cấp đủ bằng chứng để khẳng định là Đúng hay Sai.\n\n"
                "> [!IMPORTANT]\n"
                "> **Quy tắc cốt lõi:** Tuyệt đối không sử dụng kiến thức đời thực bên ngoài bài đọc để suy diễn. Nếu bài đọc không đề cập rõ ràng, đáp án bắt buộc phải là NOT GIVEN."
            )
        elif "task 2" in u_lower or "writing" in u_lower:
            return (
                "**Hướng dẫn cấu trúc bài luận IELTS Writing Task 2 chuẩn mực:**\n\n"
                "- **Introduction (2 câu):** Paraphrase đề bài + Thesis Statement nêu rõ quan điểm.\n"
                "- **Body Paragraph 1 (PEEL):** Luận điểm 1 (Point) $\\rightarrow$ Giải thích cơ chế (Explanation) $\\rightarrow$ Bằng chứng/Ví dụ (Example) $\\rightarrow$ Chốt liên kết (Link).\n"
                "- **Body Paragraph 2 (PEEL):** Luận điểm 2 phát triển theo mô hình tương tự.\n"
                "- **Conclusion (1-2 câu):** Khẳng định lại quan điểm và tóm lược 2 luận cứ cốt lõi mà không đưa ý tưởng mới.\n\n"
                "Bài viết sẽ được chấm dựa trên 4 tiêu chí chính thức: Task Response, Coherence & Cohesion, Lexical Resource, và Grammatical Range & Accuracy."
            )
        else:
            return (
                f"[{persona.upper()} COACH - Model Version: {self.model_version}]\n\n"
                f"Cảm ơn bạn đã đặt câu hỏi về: '{user_message}'.\n\n"
                "Để tối ưu hóa điểm thi IELTS, bạn cần kết hợp cả 4 kỹ năng song song, "
                "chú trọng nắm bắt từ vựng học thuật theo ngữ cảnh và luyện phản xạ bóc tách bằng chứng logic thay vì chỉ học mẹo tìm từ khóa."
            )

# Backward compatibility alias
Predictor = IELTSPredictor

