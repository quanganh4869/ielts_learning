# HƯỚNG DẪN THIẾT LẬP MÔI TRƯỜNG HUẤN LUYỆN (SETUP GUIDE)
# IELTS AI TRAINING ENGINE — STANDALONE PYTHON PLATFORM

Tài liệu này hướng dẫn chi tiết cách thiết lập môi trường Python, cấu hình GPU, cài đặt dependencies và kiểm tra tính sẵn sàng của hệ thống để vận hành IELTS AI Training Engine.

---

## 1. YÊU CẦU PHẦN CỨNG & HỆ ĐIỀU HÀNH

| Thành phần | Cấu hình tối thiểu (Dev/Smoke Test) | Khuyến nghị (Production Fine-Tuning 7B) |
| :--- | :--- | :--- |
| **Hệ điều hành** | Windows 10/11 64-bit hoặc Ubuntu 22.04 LTS / WSL2 | Ubuntu 22.04 LTS (Linux Native hoặc RunPod/Colab) |
| **Python Runtime** | Python 3.10 – 3.13 | Python 3.10 – 3.11 |
| **System RAM** | 16 GB | 32 GB trở lên |
| **Dung lượng ổ cứng** | 20 GB SSD trống | 50 GB SSD NVMe |
| **GPU / VRAM** | NVIDIA GTX 1650 (4 GB VRAM) hoặc CPU Mode | NVIDIA A10G (24 GB) / A100 (40/80 GB) / Colab T4 (16 GB) |

> [!IMPORTANT]
> **Lưu ý đặc biệt cho card đồ họa NVIDIA GeForce GTX 1650 (4 GB VRAM):**
> - Mức VRAM 4 GB **chỉ khả thi để fine-tune mô hình siêu nhỏ (Qwen2.5-0.5B-Instruct)** với kỹ thuật LoRA hoặc chạy chế độ `--dry-run` để kiểm thử toàn bộ pipeline.
> - **Tuyệt đối không chạy fine-tune mô hình 7B trên GTX 1650**, vì mô hình 7B cần tối thiểu 14 GB VRAM ngay cả khi đã nén 4-bit QLoRA.
> - Để huấn luyện mô hình 7B phục vụ thực tế, hãy chuẩn bị dataset bằng bộ công cụ này tại máy nội bộ, sau đó đưa lên Google Colab hoặc RunPod theo hướng dẫn trong [TRAINING_GUIDE.md](file:///d:/Work/Freelance/Ielts_learning/ai-training/docs/TRAINING_GUIDE.md).

---

## 2. CÀI ĐẶT MÔI TRƯỜNG PYTHON ẢO (VIRTUAL ENVIRONMENT)

Để bảo đảm tính cô lập hoàn toàn với dự án Spring Boot và React, toàn bộ môi trường Python được quản lý riêng biệt trong thư mục `ai-training/`.

### Bước 2.1: Mở PowerShell và di chuyển vào thư mục `ai-training`
```powershell
cd d:\Work\Freelance\Ielts_learning\ai-training
```

### Bước 2.2: Khởi tạo Virtual Environment
```powershell
python -m venv venv
```

### Bước 2.3: Kích hoạt môi trường ảo
- **Trên Windows PowerShell:**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(Nếu gặp lỗi script execution policy, chạy lệnh: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`)*
- **Trên Linux / WSL2:**
  ```bash
  source venv/bin/activate
  ```

---

## 3. CÀI ĐẶT DEPENDENCIES

### Bước 3.1: Nâng cấp pip và build tools
```bash
python -m pip install --upgrade pip setuptools wheel
```

### Bước 3.2: Cài đặt PyTorch phù hợp với phần cứng

#### Cách A: Cài đặt PyTorch có CUDA (Nếu muốn tận dụng GPU GTX 1650)
Nếu máy bạn có card NVIDIA và đã cài Driver NVIDIA mới nhất:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
```

#### Cách B: Cài đặt PyTorch CPU (Chế độ nhẹ, chạy giả lập & dry-run)
```bash
pip install torch torchvision torchaudio
```

### Bước 3.3: Cài đặt các thư viện lõi của IELTS AI Engine
```bash
pip install -r requirements.txt
```

Hoặc cài đặt dưới dạng editable package:
```bash
pip install -e .
```

---

## 4. CẤU HÌNH FILE MÔI TRƯỜNG (.env)

Tạo file `.env` từ file mẫu `.env.example`:

```powershell
Copy-Item .env.example .env
```

Nội dung `.env`:
```env
# Hugging Face Hub (Tuỳ chọn: điền token cá nhân để tải mô hình nhanh hơn và không bị giới hạn rate limit)
HF_TOKEN=

# Đường dẫn thư mục dữ liệu nội bộ
RAW_DATA_DIR=data/raw
PROCESSED_DATA_DIR=data/processed
CANDIDATES_FILE=data/candidates/candidates.jsonl
DATASET_DIR=data/datasets
SPLITS_DIR=data/splits

# Cấu hình phần cứng
CUDA_VISIBLE_DEVICES=0
MAX_VRAM_GB=4.0
DEFAULT_DEVICE=auto
```

> [!TIP]
> Bạn có thể lấy token Hugging Face miễn phí tại [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens). Nếu không điền, hệ thống vẫn hoạt động bình thường ở chế độ anonymous với các open-weights models.

---

## 5. CHẠY BÁO CÁO KIỂM TRA SỨC KHỎE HỆ THỐNG (`doctor`)

Sau khi cài đặt xong, hãy chạy lệnh `doctor` để kiểm tra toàn bộ thư viện, phần cứng và tính khả thi:

```powershell
$env:PYTHONPATH="src"
python -m ielts_ai doctor
```

Hệ thống sẽ in bảng chẩn đoán chi tiết:
1. Trạng thái các thư viện: `torch`, `transformers`, `peft`, `trl`, `pymupdf`, `python-docx`, `openpyxl`.
2. Tài nguyên phần cứng: RAM, Disk, GPU VRAM.
3. Bảng phân tích tính khả thi cho các mô hình: Qwen2.5-0.5B, 1.5B, 7B.
4. Lời khuyên hành động cụ thể cho môi trường của bạn.
