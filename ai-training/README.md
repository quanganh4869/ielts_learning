# IELTS AI TRAINING ENGINE — STANDALONE PYTHON PLATFORM

Hệ thống huấn luyện AI IELTS chuyên biệt, hoạt động độc lập 100% với Backend Spring Boot và Frontend React của IELTS Learning Platform. Dự án cung cấp quy trình khép kín: từ nạp tài liệu thô đa định dạng, làm sạch và khử PII, tạo dataset SFT chuẩn định dạng `messages`, fine-tuning LoRA, đánh giá benchmark 6 tác vụ IELTS, quản trị Model Registry, đến giao diện chat tương tác với 5 nhân cách sư phạm IELTS.

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

```
ai-training/
├── configs/                  # File cấu hình YAML (model, training, dataset, evaluation)
├── data/
│   ├── raw/                  # Tài liệu thô do người dùng cung cấp (PDF, Word, Excel, TXT, MD, JSONL)
│   ├── processed/            # Tài liệu sau khi trích xuất text chunk và metadata
│   ├── candidates/           # Cặp câu hỏi - câu trả lời ứng viên
│   ├── datasets/             # Tập dữ liệu SFT đã xác nhận
│   ├── splits/               # Phân chia train (80%), val (10%), test (10%) kèm manifest.json
│   └── sample/               # Bộ dữ liệu mẫu có kiểm chứng cho cả 4 kỹ năng & từ vựng
├── docs/                     # 5 tài liệu hướng dẫn chuyên sâu bằng Tiếng Việt
│   ├── SETUP_GUIDE.md        # Thiết lập môi trường Python, venv, CUDA driver
│   ├── USER_GUIDE.md         # Hướng dẫn thao tác CLI và trò chuyện với AI
│   ├── DATASET_GUIDE.md      # Chuẩn định dạng SFT, làm sạch, khử PII, anti-extrapolation
│   ├── TRAINING_GUIDE.md     # Kỹ thuật LoRA/QLoRA, giải thích siêu tham số, workflow Cloud GPU 7B
│   └── TROUBLESHOOTING.md    # Xử lý sự cố tràn VRAM, bitsandbytes Windows, PyTorch CPU
├── models/
│   ├── base/                 # Mô hình nền tảng (Qwen2.5-0.5B, 1.5B, 7B)
│   ├── adapters/             # Trọng số thích ứng LoRA (ielts-tutor-v1, ...)
│   ├── checkpoints/          # Checkpoint trung gian trong quá trình huấn luyện
│   └── exports/              # Gói mô hình đã xuất xưởng
├── outputs/
│   ├── logs/                 # Nhật ký huấn luyện và xử lý tài liệu
│   ├── metrics/              # Biểu đồ và chỉ số loss
│   └── reports/              # Báo cáo đánh giá chất lượng (JSON & Markdown)
├── src/ielts_ai/             # Mã nguồn Python dạng package
│   ├── parsers/              # Bộ parser đa định dạng (PDF, DOCX, XLSX, TXT, MD, JSONL)
│   ├── preprocessing/        # Làm sạch, khử PII, trích xuất ứng viên câu hỏi/trả lời
│   ├── dataset/              # Xây dựng, validate, lọc trùng và phân tầng dataset
│   ├── training/             # Huấn luyện SFT LoRA với Hugging Face TRL & PEFT
│   ├── evaluation/           # Bộ đánh giá benchmark 6 tác vụ IELTS và F1 / 4-criteria
│   ├── inference/            # Tải mô hình + adapter và chat đa nhân cách
│   ├── utils/                # Doctor chẩn đoán, ModelRegistry, Logger
│   └── cli.py                # Command-Line Interface thống nhất
└── tests/                    # Bộ kiểm thử đơn vị tự động (Unit Tests)
```

---

## 2. KHỞI CHẠY NHANH TRONG 5 BƯỚC (QUICKSTART)

### Bước 1: Khởi động môi trường & Kiểm tra sức khỏe phần cứng
```powershell
cd d:\Work\Freelance\Ielts_learning\ai-training
$env:PYTHONPATH="src"
python -m ielts_ai doctor
```

### Bước 2: Nạp tài liệu vào `data/raw/` và trích xuất dữ liệu
```powershell
python -m ielts_ai documents process --input data/raw
```

### Bước 3: Xây dựng, kiểm tra và phân chia Dataset
```powershell
python -m ielts_ai dataset build
python -m ielts_ai dataset validate
python -m ielts_ai dataset split
```

### Bước 4: Chạy huấn luyện (Dry-Run hoặc Local LoRA)
```powershell
# Chế độ kiểm thử nhanh không tốn VRAM:
python -m ielts_ai train --config configs/training.yaml --dry-run

# Chế độ huấn luyện thực tế với Qwen2.5-0.5B:
python -m ielts_ai train --config configs/training.yaml
```

### Bước 5: Đánh giá chất lượng và Chat thử nghiệm
```powershell
# Đánh giá benchmark trên 6 tác vụ IELTS:
python -m ielts_ai evaluate --model-version ielts-tutor-v1

# Chat tương tác trực tiếp:
python -m ielts_ai chat --model-version ielts-tutor-v1 --persona tutor
```

---

## 3. CÁC NHÂN CÁCH GIA SƯ IELTS ĐƯỢC CẤU HÌNH SẴN

1. **`tutor`:** Gia sư tổng quát, cân bằng toàn diện cả 4 kỹ năng và hướng dẫn phương pháp học.
2. **`examiner`:** Giám khảo IELTS chính thức, khắt khe về từ vựng, ngữ pháp và tiêu chí chấm điểm.
3. **`writing_coach`:** Chuyên gia Writing Task 1 & Task 2, bóc tách cấu trúc PEEL và 4 tiêu chí rubric.
4. **`reading_specialist`:** Chuyên gia kỹ thuật phân biệt TRUE, FALSE, NOT GIVEN và Heading matching.
5. **`speaking_partner`:** Bạn luyện nói phản xạ, cung cấp collocations band 7.0+ và cấu trúc câu tự nhiên.

---

## 4. QUY TRÌNH HUẤN LUYỆN MÔ HÌNH 7B CHO MÔI TRƯỜNG THỰC TẾ

Đối với card đồ họa cá nhân có 4 GB VRAM (GTX 1650), phần cứng phù hợp nhất để:
- Chạy toàn bộ pipeline ETL dữ liệu, OCR tài liệu và làm sạch PII.
- Huấn luyện thử nghiệm mô hình 0.5B hoặc chạy `--dry-run`.
- Xuất dataset đã qua xác thực (`data/splits/`).

Khi cần huấn luyện mô hình **Qwen2.5-7B-Instruct** cho bài toán thực tế, hãy đưa file `data/splits/train.jsonl` lên Google Colab T4 hoặc RunPod A10G theo hướng dẫn chi tiết trong [TRAINING_GUIDE.md](file:///d:/Work/Freelance/Ielts_learning/ai-training/docs/TRAINING_GUIDE.md).
Sau đó tải adapter về đặt vào `models/adapters/` để sử dụng cục bộ.
