# HƯỚNG DẪN XỬ LÝ LỖI & SỰ CỐ PHỔ BIẾN (TROUBLESHOOTING)
# IELTS AI TRAINING ENGINE

Tài liệu này tổng hợp các vấn đề kỹ thuật thường gặp trong quá trình cài đặt, trích xuất tài liệu, huấn luyện LoRA và chạy suy luận, cùng các giải pháp khắc phục triệt để.

---

## 1. LỖI BỘ NHỚ GPU: CUDA OUT OF MEMORY (OOM)

### Biểu hiện:
```
torch.OutOfMemoryError: CUDA out of memory. Tried to allocate 850.00 MiB (GPU 0; 4.00 GiB total capacity; 3.20 GiB already allocated)
```

### Nguyên nhân:
Card đồ họa cục bộ có 4 GB VRAM (GTX 1650). Khi độ dài chuỗi (`max_seq_length`) vượt quá 1024 token hoặc kích thước batch size quá lớn, VRAM sẽ bị tràn.

### Giải pháp:
1. **Sử dụng cờ `--dry-run` để kiểm thử logic trước:**
   ```bash
   python -m ielts_ai train --config configs/training.yaml --dry-run
   ```
2. **Giảm kích thước batch và tăng số bước tích lũy gradient trong `configs/training.yaml`:**
   ```yaml
   per_device_train_batch_size: 1
   gradient_accumulation_steps: 8
   max_seq_length: 512
   ```
3. **Chuyển sang thiết bị CPU khi kiểm thử nội bộ:**
   Hệ thống có cơ chế fallback CPU tự động khi không tìm thấy CUDA hoặc khi VRAM không đủ.
4. **Đối với mô hình 7B:** Bắt buộc huấn luyện trên Google Colab T4 hoặc RunPod theo hướng dẫn trong [TRAINING_GUIDE.md](file:///d:/Work/Freelance/Ielts_learning/ai-training/docs/TRAINING_GUIDE.md).

---

## 2. LỖI BITSANDBYTES TRÊN HỆ ĐIỀU HÀNH WINDOWS

### Biểu hiện:
```
RuntimeError: bitsandbytes was compiled without GPU support or CUDA Setup failed on Windows.
```

### Nguyên nhân:
Thư viện `bitsandbytes` chính thức được tối ưu cho Linux. Trên Windows native, việc biên dịch CUDA C++ extension thường yêu cầu Visual Studio Build Tools và Windows SDK phức tạp.

### Giải pháp:
- **Cách 1 (Khuyến nghị):** Trên Windows, sử dụng LoRA 16-bit chuẩn với PyTorch native thay vì 4-bit QLoRA.
- **Cách 2:** Cài đặt bản build cộng đồng Windows của bitsandbytes:
  ```bash
  pip install bitsandbytes-windows
  ```
- **Cách 3:** Sử dụng môi trường WSL2 (Windows Subsystem for Linux), nơi bitsandbytes hoạt động hoàn hảo 100% như trên Linux.

---

## 3. LỖI PYTORCH CHỈ NHẬN DIỆN CPU DÙ MÁY CÓ CARD NVIDIA

### Biểu hiện:
Lệnh `doctor` báo:
```
Notice: You have an NVIDIA GPU, but PyTorch is running the CPU build (2.9.1+cpu).
```

### Nguyên nhân:
Khi cài đặt qua `pip install torch` thông thường trên Windows, pip có thể tải bản build mặc định không kèm CUDA runtime libraries để giảm dung lượng tải xuống.

### Giải pháp:
Cài đặt bản build CUDA 12.4 chính thức của PyTorch:
```bash
pip uninstall torch torchvision torchaudio -y
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
```
Kiểm tra lại bằng lệnh:
```bash
python -c "import torch; print('CUDA Available:', torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"
```

---

## 4. LỖI GIỚI HẠN TẢI HUGGING FACE HUB (RATE LIMIT / TOKEN)

### Biểu hiện:
```
Warning: You are sending unauthenticated requests to the HF Hub. Please set a HF_TOKEN to enable higher rate limits.
```
Hoặc: `HTTP 429 Too Many Requests`.

### Giải pháp:
1. Đăng ký tài khoản miễn phí tại [Hugging Face](https://huggingface.co).
2. Tạo Access Token (quyền `Read`) tại [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
3. Điền token vào file `.env`:
   ```env
   HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
   ```
4. Hoặc đăng nhập qua terminal:
   ```bash
   huggingface-cli login
   ```

---

## 5. TÀI LIỆU PDF QUÉT ẢNH (SCANNED PDF) KHÔNG TRÍCH XUẤT ĐƯỢC CHỮ

### Biểu hiện:
Bộ trích xuất cảnh báo:
```
[Warning: Page contains no extractable text. May be a scanned image requiring OCR].
```

### Nguyên nhân:
Tài liệu là file scan hoặc hình chụp không có lớp text layer dạng số (vector text). `PyMuPDF` chỉ trích xuất được chữ điện tử.

### Giải pháp:
1. Sử dụng Adobe Acrobat hoặc phần mềm OCR miễn phí (như Tesseract hoặc Google Drive $\rightarrow$ Open with Google Docs) để tạo lớp văn bản trước khi đưa vào `data/raw/`.
2. Hoặc xuất tài liệu ra định dạng `.docx` hoặc `.txt` rồi đưa vào hệ thống.
