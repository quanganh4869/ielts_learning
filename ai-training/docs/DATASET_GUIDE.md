# HƯỚNG DẪN XÂY DỰNG VÀ KIỂM SOÁT DỮ LIỆU (DATASET GUIDE)
# IELTS AI TRAINING ENGINE — SFT DATA PIPELINE

Tài liệu này quy định chi tiết cấu trúc định dạng dữ liệu, quy trình làm sạch, khử dữ liệu nhạy cảm (PII), chống suy diễn ngoài luồng (Anti-Extrapolation) và quy tắc phân tầng dữ liệu cho IELTS AI.

---

## 1. CẤU TRÚC ĐỊNH DẠNG DỮ LIỆU SFT TIÊU CHUẨN

Toàn bộ dữ liệu huấn luyện fine-tuning (SFT - Supervised Fine-Tuning) được tổ chức theo chuẩn **Hugging Face / OpenAI Multi-turn Messages** trong file JSON Lines (`.jsonl`).

Mỗi dòng là một đối tượng JSON độc lập:

```json
{
  "id": "reading_renewable_energy.md_qa_0",
  "skill": "Reading",
  "doc_type": "practice_test",
  "provenance": {
    "source_file": "reading_renewable_energy.md",
    "pattern": "regex_qa_block",
    "match_index": 0
  },
  "messages": [
    {
      "role": "system",
      "content": "You are a professional, accurate and encouraging IELTS Academic and General Training Tutor."
    },
    {
      "role": "user",
      "content": "Question 1: Geothermal power plants produce electricity continuously regardless of weather conditions.\nState whether this is TRUE, FALSE, or NOT GIVEN based on the passage and explain."
    },
    {
      "role": "assistant",
      "content": "Answer: TRUE\nExplanation: The passage explicitly states that \"geothermal stations provide continuous baseload power, operating with capacity factors exceeding 90 percent\" unlike intermittent renewable sources such as wind and solar."
    }
  ]
}
```

---

## 2. QUY TRÌNH TIỀN XỬ LÝ & LÀM SẠCH DỮ LIỆU (PREPROCESSING)

1. **Chuẩn hóa Unicode & Khoảng trắng:**
   - Chuyển đổi mã hóa về UTF-8 đồng nhất.
   - Loại bỏ các ký tự điều khiển vô hình (`\x00` - `\x08`, `\x0b`, `\x0c`).
   - Chuẩn hóa khoảng trắng và dòng trống liên tiếp thành tối đa 2 dòng mới `\n\n`.

2. **Khử thông tin nhạy cảm (PII Sanitization):**
   - **Email:** Tự động ẩn thành `[EMAIL_REDACTED]`.
   - **Số điện thoại:** Ẩn theo định dạng số quốc tế và số nội địa thành `[PHONE_REDACTED]`.
   - **Tên cá nhân cụ thể của học viên:** Ẩn hoặc chuẩn hóa thành danh xưng trung tính như `[Candidate]`, `Alex Chen`, `Student`.

3. **Phân loại Kỹ năng Tự động (Skill Classification):**
   - Hệ thống dựa vào từ khóa ngữ nghĩa để gán nhãn: `Listening`, `Reading`, `Writing`, `Speaking`, hoặc `Vocabulary`.

---

## 3. NGUYÊN TẮC CHỐNG SUY DIỄN (ANTI-EXTRAPOLATION & HALLUCINATION PREVENTION)

Để bảo đảm AI phản hồi chuẩn mực theo tiêu chí khảo thí IELTS:

1. **Đối với câu hỏi True / False / Not Given & Yes / No / Not Given:**
   - Nếu trong đoạn văn không có thông tin xác thực, câu trả lời **bắt buộc phải là NOT GIVEN**.
   - Cấm AI tự ý suy diễn dựa trên kiến thức bách khoa hoặc tri thức bên ngoài bài đọc.

2. **Đối với bài chấm Writing & Speaking:**
   - Phản hồi bắt buộc phải bao quát đủ **4 tiêu chí khảo thí chính thức**:
     * Writing: *Task Response / Achievement*, *Coherence & Cohesion*, *Lexical Resource*, *Grammatical Range & Accuracy*.
     * Speaking: *Fluency & Coherence*, *Lexical Resource*, *Grammatical Range & Accuracy*, *Pronunciation*.
   - Mọi mức điểm (Band score) phải đi kèm dẫn chứng trực tiếp từ bài làm của thí sinh.

---

## 4. QUY TẮC KIỂM TRA TÍNH HỢP LỆ (VALIDATION RULES)

Hàm `validate_dataset` tự động áp dụng các bộ lọc sau:
1. **Schema Check:** Bắt buộc có các trường `id`, `skill`, `messages`. Trường `messages` phải chứa ít nhất một cặp `user` và `assistant`.
2. **Min Length Check:** Nội dung `user` tối thiểu 5 ký tự; nội dung `assistant` tối thiểu 10 ký tự.
3. **Deduplication Check:** Sử dụng hàm băm SHA-256 trên nội dung câu hỏi để loại bỏ 100% các câu hỏi trùng lặp hoặc lặp lại giữa các file `.txt` và `.md`.

---

## 5. PHÂN CHIA TẬP DỮ LIỆU CÂN BẰNG (STRATIFIED SPLIT)

Bộ chia `split_dataset` thực hiện phân chia theo tỷ lệ chuẩn:
- **Tập Train (80%):** Dùng để cập nhật trọng số adapter qua LoRA.
- **Tập Validation (10%):** Dùng để tính toán validation loss sau mỗi epoch, tránh overfitting.
- **Tập Test (10%):** Dành riêng cho bước đánh giá benchmark độc lập cuối cùng.

File `data/splits/manifest.json` ghi lại chi tiết:
- Số lượng bản ghi từng tập.
- Mã băm SHA-256 xác thực toàn vẹn dữ liệu.
- Tỷ lệ phân bổ kỹ năng được bảo toàn đồng đều trên cả 3 tập.
