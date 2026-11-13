# HƯỚNG DẪN HUẤN LUYỆN CHI TIẾT (TRAINING GUIDE)
# IELTS AI FINE-TUNING VỚI LORA / QLORA & CLOUD GPU WORKFLOW

Tài liệu này giải thích chi tiết cơ chế fine-tuning LoRA, ý nghĩa các siêu tham số (hyperparameters), hướng dẫn theo dõi loss và quy trình từng bước đưa mô hình lên Cloud GPU (Google Colab / RunPod) để huấn luyện mô hình sản xuất 7B.

---

## 1. CƠ CHẾ HUẤN LUYỆN LORA (LOW-RANK ADAPTATION)

Thay vì cập nhật toàn bộ 7 tỷ trọng số của mô hình nền tảng (Base Model) gây tốn hàng chục gigabyte VRAM, phương pháp **LoRA (Low-Rank Adaptation)** giữ cố định (freeze) toàn bộ trọng số gốc $W_0$ và chỉ huấn luyện hai ma trận phân rã cấp thấp $A$ và $B$:

$$\Delta W = B \times A \quad (A \in \mathbb{R}^{r \times d}, B \in \mathbb{R}^{d \times r}, r \ll d)$$

Trọng số sau thích ứng:

$$W = W_0 + \frac{\alpha}{r} (B \times A)$$

### Ưu điểm vượt trội:
1. **Tiết kiệm bộ nhớ GPU:** Chỉ cần lưu trữ và cập nhật khoảng 0.1% – 1% tổng số tham số (adapter chỉ nặng khoảng 10 MB - 50 MB).
2. **Không làm quên kiến thức gốc (Catastrophic Forgetting):** Mô hình vẫn giữ được vốn ngôn ngữ tự nhiên xuất sắc và khả năng suy luận logic của base model.
3. **Dễ dàng quản lý phiên bản:** Có thể huấn luyện nhiều adapter chuyên biệt (ví dụ `ielts-writing-v1`, `ielts-speaking-v1`) và cắm vào cùng một base model mà không phải sao chép toàn bộ trọng số 7B.

---

## 2. BẢNG GIẢI THÍCH SIÊU THAM SỐ (HYPERPARAMETERS)

Cấu hình được quản lý trong file `configs/training.yaml`:

| Tham số | Giá trị mặc định | Giải thích chi tiết |
| :--- | :--- | :--- |
| `model_name` | `Qwen/Qwen2.5-0.5B-Instruct` | Mô hình nền tảng được dùng. Chuyển thành `Qwen/Qwen2.5-7B-Instruct` khi chạy trên Cloud GPU. |
| `r` (LoRA Rank) | `16` | Độ rộng biểu diễn của ma trận thích ứng. Giá trị phổ biến từ 8 đến 32. 16 là điểm cân bằng lý tưởng giữa năng lực biểu đạt và dung lượng VRAM. |
| `lora_alpha` | `32` | Hệ số tỷ lệ nhân với ma trận LoRA. Thường đặt gấp đôi giá trị `r` ($\alpha / r = 2.0$). |
| `lora_dropout` | `0.05` | Xác suất vô hiệu hóa ngẫu nhiên một số kết nối LoRA trong lúc huấn luyện để chống hiện tượng học vẹt (overfitting). |
| `target_modules` | `["q_proj", "k_proj", "v_proj", "o_proj"]` | Các module Attention trong Transformer được áp dụng LoRA. Có thể thêm `gate_proj`, `up_proj`, `down_proj` để tăng độ bao quát. |
| `num_train_epochs`| `3` | Số lần toàn bộ tập dữ liệu huấn luyện được duyệt qua. Với dữ liệu IELTS chất lượng cao, 3 - 5 epochs là tối ưu. |
| `learning_rate` | `2.0e-4` | Tốc độ cập nhật trọng số. Với LoRA, mức learning rate tối ưu nằm trong khoảng `1e-4` đến `3e-4` (cao hơn nhiều so với full fine-tuning `1e-5`). |
| `per_device_train_batch_size` | `2` | Số mẫu xử lý đồng thời trên mỗi GPU trong một bước forward/backward. |
| `gradient_accumulation_steps` | `4` | Tích lũy gradient qua nhiều bước nhỏ để tạo ra kích thước batch hiệu dụng (Effective Batch Size = $2 \times 4 = 8$) mà không gây tràn VRAM. |
| `max_seq_length` | `1024` | Độ dài tối đa tính theo token của một đoạn hội thoại bài học. |

---

## 3. THEO DÕI LOSS VÀ ĐÁNH GIÁ ĐỘ HỘI TỤ

Trong quá trình huấn luyện:
- **Loss khởi đầu:** Thường dao động từ `2.5` đến `3.8`.
- **Loss kỳ vọng sau hội tụ:** Sau 3 epochs, loss nên giảm dần xuống vùng `1.2` – `1.6`.
- **Dấu hiệu Overfitting:** Nếu training loss giảm sâu dưới `0.6` nhưng validation loss bắt đầu tăng trở lại, mô hình đang học vẹt và cần tăng `lora_dropout` hoặc giảm số epochs.

---

## 4. HƯỚNG DẪN HUẤN LUYỆN MÔ HÌNH 7B TRÊN CLOUD GPU (GOOGLE COLAB / RUNPOD)

Do card đồ họa GTX 1650 (4 GB VRAM) không thể tải mô hình 7B, quy trình sản xuất chuẩn là:

```
[Máy cá nhân]
1. Chuẩn bị file tài liệu trong data/raw
2. Chạy documents process -> dataset build -> validate -> split
3. Nén thư mục data/splits/ thành dataset.zip
        │
        ▼ Upload lên Cloud
[Google Colab T4 / RunPod A10G]
4. Tải repo hoặc chạy script train.py với base model Qwen2.5-7B
5. Tải file adapter đã huấn luyện về máy cá nhân
        │
        ▼ Tải về máy cá nhân
[Máy cá nhân]
6. Đặt adapter vào models/adapters/ielts-tutor-7b-v1
7. Chạy evaluate và chat trực tiếp
```

### Hướng dẫn chi tiết trên Google Colab (Miễn phí / T4 GPU 16GB):

1. Mở một notebook Colab mới và chọn Runtime: **Change runtime type $\rightarrow$ T4 GPU**.
2. Chạy ô lệnh đầu tiên để cài đặt môi trường:
   ```bash
   !pip install -q torch transformers peft trl datasets accelerate bitsandbytes
   ```
3. Tải code và dataset:
   - Upload file `data/splits/train.jsonl` và `data/splits/val.jsonl` lên Colab.
4. Chạy script huấn luyện 4-bit QLoRA cho Qwen 7B:
   ```python
   import torch
   from datasets import load_dataset
   from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
   from peft import LoraConfig, get_peft_model
   from trl import SFTTrainer, SFTConfig

   model_id = "Qwen/Qwen2.5-7B-Instruct"

   bnb_config = BitsAndBytesConfig(
       load_in_4bit=True,
       bnb_4bit_quant_type="nf4",
       bnb_4bit_compute_dtype=torch.float16,
   )

   tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
   model = AutoModelForCausalLM.from_pretrained(
       model_id,
       quantization_config=bnb_config,
       device_map="auto",
       trust_remote_code=True
   )

   peft_config = LoraConfig(
       r=16,
       lora_alpha=32,
       target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
       lora_dropout=0.05,
       bias="none",
       task_type="CAUSAL_LM"
   )

   train_dataset = load_dataset("json", data_files="train.jsonl", split="train")

   training_args = SFTConfig(
       output_dir="./ielts-7b-adapter",
       num_train_epochs=3,
       per_device_train_batch_size=2,
       gradient_accumulation_steps=4,
       learning_rate=2e-4,
       logging_steps=10,
       save_strategy="epoch",
       fp16=True,
   )

   trainer = SFTTrainer(
       model=model,
       train_dataset=train_dataset,
       peft_config=peft_config,
       args=training_args,
   )

   trainer.train()
   trainer.model.save_pretrained("./ielts-tutor-7b-v1")
   tokenizer.save_pretrained("./ielts-tutor-7b-v1")
   ```
5. Tải thư mục `./ielts-tutor-7b-v1` (khoảng 35 MB) về máy cá nhân, đặt vào `ai-training/models/adapters/ielts-tutor-7b-v1`.
6. Trên máy cá nhân, mô hình 7B đã sẵn sàng để benchmark hoặc chạy suy luận với Model Registry.
