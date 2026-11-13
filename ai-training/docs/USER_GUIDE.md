# HƯỚNG DẪN SỬ DỤNG (USER GUIDE)
# IELTS AI TRAINING ENGINE CLI

Tài liệu này hướng dẫn cách sử dụng toàn bộ chuỗi công cụ dòng lệnh (CLI) của IELTS AI Training Engine để nhập tài liệu, tạo dữ liệu huấn luyện, chạy kiểm thử, đánh giá và tương tác với AI.

---

## 1. TỔNG QUAN CÁC LỆNH CLI CỦA HỆ THỐNG

| Lệnh | Ý nghĩa chức năng |
| :--- | :--- |
| `python -m ielts_ai doctor` | Kiểm tra hệ thống, driver, VRAM và đánh giá tính khả thi phần cứng. |
| `python -m ielts_ai documents process` | Quét thư mục chứa tài liệu gốc (PDF, DOCX, XLSX, TXT, MD, JSONL), trích xuất cấu trúc và tạo ứng viên câu hỏi/trả lời. |
| `python -m ielts_ai dataset build` | Chuyển đổi dữ liệu ứng viên thành định dạng SFT tiêu chuẩn của Hugging Face (`messages`). |
| `python -m ielts_ai dataset validate` | Kiểm tra chất lượng dữ liệu: schema, độ dài, lọc trùng lặp và thống kê tỷ lệ phân bổ 4 kỹ năng. |
| `python -m ielts_ai dataset split` | Chia tập dữ liệu thành Train (80%), Val (10%), Test (10%) kèm file `manifest.json`. |
| `python -m ielts_ai train` | Khởi chạy quá trình fine-tuning LoRA SFT trên mô hình nền tảng. Hỗ trợ cờ `--dry-run`. |
| `python -m ielts_ai evaluate` | Chạy bộ benchmark 6 tác vụ chuẩn IELTS trên tập Test và xuất báo cáo Markdown / JSON. |
| `python -m ielts_ai models list` | Xem danh sách các phiên bản mô hình và adapter đã được đăng ký trong Model Registry. |
| `python -m ielts_ai models export` | Đóng gói phiên bản mô hình đã huấn luyện thành package sẵn sàng triển khai. |
| `python -m ielts_ai chat` | Mở giao diện chat tương tác trực tiếp trên terminal với 5 nhân cách gia sư IELTS. |

---

## 2. QUY TRÌNH NẠP TÀI LIỆU VÀ CHUẨN BỊ DATASET

### Bước 2.1: Đặt tài liệu IELTS vào thư mục `data/raw/`
Hệ thống hỗ trợ tự động các định dạng sau:
- **PDF (`.pdf`):** Đề thi Cambridge IELTS, tài liệu đọc hiểu, đề Listening có transcript.
- **Word (`.docx`):** Bài viết mẫu Writing Task 1 & Task 2, nhận xét chấm điểm theo 4 tiêu chí của giám khảo.
- **Excel (`.xlsx`):** Danh sách từ vựng Academic Word List, collocations, ví dụ, nghĩa tiếng Anh/Việt.
- **Text & Markdown (`.txt`, `.md`):** Ghi chú bài giảng, transcript hội thoại, bài luyện tập.
- **JSONL (`.jsonl`):** Dữ liệu câu trả lời Speaking Part 1/2/3 và điểm chi tiết.

### Bước 2.2: Chạy trích xuất tài liệu
```powershell
$env:PYTHONPATH="src"
python -m ielts_ai documents process --input data/raw
```

Kết quả:
- Các chunk được làm sạch và lưu tại `data/processed/`.
- Các cặp câu hỏi - câu trả lời ứng viên được lưu tại `data/candidates/candidates.jsonl`.

### Bước 2.3: Xây dựng tập dữ liệu SFT
```powershell
python -m ielts_ai dataset build --input data/candidates/candidates.jsonl --output data/datasets/ielts_sft.jsonl
```

### Bước 2.4: Kiểm tra tính hợp lệ & Lọc trùng lặp
```powershell
python -m ielts_ai dataset validate --input data/datasets/ielts_sft.jsonl
```
Lệnh này sẽ in bảng tổng kết:
- Số bản ghi hợp lệ.
- Số câu quá ngắn hoặc sai định dạng.
- Số bản ghi trùng lặp nội dung bị loại bỏ.
- Biểu đồ phân bổ kỹ năng (Listening, Reading, Writing, Speaking, Vocabulary).

### Bước 2.5: Phân chia tập dữ liệu (Train / Val / Test)
```powershell
python -m ielts_ai dataset split --input data/datasets/ielts_sft.jsonl --output-dir data/splits
```
Lệnh sẽ tạo 3 file:
- `data/splits/train.jsonl` (80%)
- `data/splits/val.jsonl` (10%)
- `data/splits/test.jsonl` (10%)
- `data/splits/manifest.json` (Ghi nhận checksum sha256 và số lượng mẫu)

---

## 3. HUẤN LUYỆN MÔ HÌNH (FINE-TUNING)

### Chạy chế độ kiểm thử nhanh không tốn VRAM (`--dry-run`):
```powershell
python -m ielts_ai train --config configs/training.yaml --dry-run
```
Hệ thống sẽ chạy một lượt huấn luyện giả lập, ghi nhận loss, tạo thư mục adapter `models/adapters/ielts-tutor-v1` và cập nhật Model Registry.

### Chạy huấn luyện thực tế với mô hình nhỏ Qwen2.5-0.5B:
```powershell
python -m ielts_ai train --config configs/training.yaml
```

---

## 4. ĐÁNH GIÁ CHẤT LƯỢNG MÔ HÌNH (BENCHMARK EVALUATION)

Để kiểm tra năng lực của mô hình sau huấn luyện trên bộ 6 tác vụ IELTS:
```powershell
python -m ielts_ai evaluate --model-version ielts-tutor-v1 --test-file data/splits/test.jsonl
```

Hệ thống sẽ chấm điểm và lưu báo cáo chi tiết tại `outputs/reports/`:
- File Markdown: `outputs/reports/eval_ielts-tutor-v1_YYYYMMDD_HHMMSS.md`
- File JSON: `outputs/reports/eval_ielts-tutor-v1_YYYYMMDD_HHMMSS.json`

---

## 5. XEM VÀ XUẤT MÔ HÌNH (MODEL REGISTRY)

### Xem danh sách mô hình đã lưu:
```powershell
python -m ielts_ai models list
```

### Xuất gói mô hình để tích hợp hoặc sao lưu:
```powershell
python -m ielts_ai models export --model-version ielts-tutor-v1 --output-dir models/exports
```

---

## 6. CHAT TƯƠNG TÁC TRỰC TIẾP TRÊN TERMINAL

Bạn có thể trò chuyện và hỏi bài tập IELTS trực tiếp với mô hình:

```powershell
python -m ielts_ai chat --model-version ielts-tutor-v1 --persona tutor
```

### Các nhân cách (Persona) hỗ trợ:
1. `tutor`: Gia sư tổng quát, cân bằng cả 4 kỹ năng và chiến thuật làm bài.
2. `examiner`: Giám khảo chấm thi nghiêm khắc, soi kỹ lỗi từ vựng và ngữ pháp.
3. `writing_coach`: Huấn luyện viên chuyên sâu Writing Task 1 & Task 2 theo 4 tiêu chí.
4. `reading_specialist`: Chuyên gia chiến thuật giải đề True/False/Not Given và Headings.
5. `speaking_partner`: Bạn luyện nói phản xạ, gợi ý collocations band 7.0+.

Trong phiên chat:
- Gõ câu hỏi bằng tiếng Anh hoặc tiếng Việt.
- Gõ `/persona <tên_persona>` để đổi phong cách phản hồi ngay trong phiên chat.
- Gõ `/clear` để xoá màn hình.
- Gõ `exit` hoặc `quit` để kết thúc.
