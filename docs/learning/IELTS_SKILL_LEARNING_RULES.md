# IELTS SKILL LEARNING RULES & PEDAGOGICAL SPECIFICATION
## Quy Chuẩn Phương Pháp Giảng Dạy & Khung Nghiệp Vụ 4 Kỹ Năng IELTS

> **Document ID:** `DOC-EDU-RULES-2026-V1`  
> **Status:** Official Master Specification / Source of Truth  
> **Target Audience:** Curriculum Designers, Academic Specialists, IELTS Lead Trainers, Software Engineers, AI Prompt Architects  
> **System Alignment:** IELTS Learning Platform Core Engine, Recommendation Services, Assessment APIs, Seed Data Generators  
> **Rule Classification Standard:**  
> - `[IELTS OFFICIAL]`: Official Cambridge Assessment English / IDP / British Council test regulations and public band descriptors.  
> - `[INTERNAL PEDAGOGY]`: Academic principles and instructional designs formulated specifically for the IELTS Learning Platform.  
> - `[PLATFORM BUSINESS]`: Concrete software constraints, database enums, algorithmic weights, and scoring thresholds.  

---

## MỤC LỤC TỔNG QUAN (TABLE OF CONTENTS)

1. [General Learning Principles (Nguyên Tắc Học Tập Chung)](#1-general-learning-principles)
2. [Listening Learning Rules (Quy Tắc Giảng Dạy Listening)](#2-listening-learning-rules)
3. [Reading Learning Rules (Quy Tắc Giảng Dạy Reading)](#3-reading-learning-rules)
4. [Writing Learning Rules (Quy Tắc Giảng Dạy Writing)](#4-writing-learning-rules)
5. [Speaking Learning Rules (Quy Tắc Giảng Dạy Speaking)](#5-speaking-learning-rules)
6. [Vocabulary Integration (Quy Tắc Tích Hợp Từ Vựng)](#6-vocabulary-integration)
7. [Learning Levels & Competency Profiles (Phân Cấp Độ & Hồ Sơ Năng Lực)](#7-learning-levels--competency-profiles)
8. [Standard Lesson Structure (Cấu Trúc Chuẩn Của Một Bài Học)](#8-standard-lesson-structure)
9. [Feedback & Mistake Management (Chữa Lỗi & Quản Lý Sai Sót)](#9-feedback--mistake-management)
10. [Mastery & Progression Rules (Điều Kiện Hoàn Thành & Thăng Cấp)](#10-mastery--progression-rules)
11. [Learning Plan Integration (Tích Hợp Lộ Trình Thích Ứng)](#11-learning-plan-integration)
12. [Exam Type & Official IELTS Alignment (Đồng Bộ Academic & General Training)](#12-exam-type--official-ielts-alignment)
13. [Content Quality Rules (Kiểm Soát Chất Lượng Nội Dung)](#13-content-quality-rules)
14. [Document Governance & Open Questions (Quản Trị Tài Liệu & Câu Hỏi Mở)](#14-document-governance--open-questions)

---

## 1. GENERAL LEARNING PRINCIPLES

### 1.1. Triết Lý Học Song Song Bốn Kỹ Năng (Parallel Skill Acquisition)
`[INTERNAL PEDAGOGY]`  
Hệ thống IELTS Learning Platform nghiêm cấm mô hình học tập tuần tự cô lập (Linear Waterfall Model - ví dụ: bắt học viên học xong 100% Listening rồi mới chuyển sang Reading, Writing, Speaking). Thay vào đó, nền tảng áp dụng mô hình **Thụ Cảm - Sản Sinh Đồng Hóa (Receptive-Productive Symbiosis)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│             CORE LEXICAL & GRAMMATICAL SPINE (Trục Từ Vựng & Cú Pháp) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌────────────────────────────────┐                    ┌────────────────────────────────┐
│   LISTENING (Receptive-Oral)   │ ── Paraphrase ───> │   READING (Receptive-Visual)   │
│   Tiếp nhận ngữ âm & diễn đạt │ <── Resonance ───  │   Tiếp nhận văn bản & luận điểm│
└──────────────┬─────────────────┘                    └──────────────┬─────────────────┘
               │                                                     │
               │ Contextual Priming                 Structural Models│
               ▼                                                     ▼
┌────────────────────────────────┐                    ┌────────────────────────────────┐
│    SPEAKING (Productive-Oral)  │ ◄── Collocations ─ │   WRITING (Productive-Text)    │
│   Phản xạ phát âm & ý tưởng    │ ── Fluency Push ─> │   Lập luận mạch lạc & học thuật│
└────────────────────────────────┘                    └────────────────────────────────┘
```

* **Nguyên lý kích hoạt từ vựng:** Một từ vựng hoặc điểm ngữ pháp được nạp thụ cảm qua bài Listening/Reading sẽ được hệ thống gợi ý và kích hoạt sang bài thực hành Speaking/Writing trong vòng 48 giờ để chuyển từ vốn từ thụ động (Passive Vocabulary) sang vốn từ chủ động (Active Vocabulary).
* **Nguyên lý cân bằng tải nhận thức:** Không bỏ rơi bất kỳ kỹ năng nào trong suốt tuần học. Học viên đang yếu Writing vẫn duy trì luyện tập Listening và Reading để nuôi dưỡng phản xạ tự nhiên của ngôn ngữ.

### 1.2. Khung Tiếp Cận Sư Phạm Đa Tầng (Multi-tiered Pedagogical Continuum)
`[INTERNAL PEDAGOGY]`  
Nền tảng tuyệt đối **không biến việc học thành chuỗi bài tập trắc nghiệm liên tục (Quiz Drilling)**. Mọi đơn vị kiến thức phải tuân theo lộ trình 5 giai đoạn:

| Giai Đoạn | Bản Chất Hoạt Động | Vai Trò Hệ Thống / Giáo Viên AI | Mục Tiêu Người Học |
| :--- | :--- | :--- | :--- |
| **1. Foundation (Nền Tảng)** | Học nguyên lý âm vị, ngữ pháp cốt lõi, từ loại, cấu trúc câu. | Cung cấp tài liệu trực quan, audio mẫu chuẩn quốc tế. | Hiểu đúng bản chất, sửa lỗi phát âm và ngữ pháp cơ bản. |
| **2. Skill Development (Chiến Lược)** | Học phương pháp xử lý dạng bài, bẫy distractor, kỹ thuật định vị thông tin. | Giảng giải quy trình làm bài (Framework), phân tích ví dụ mẫu có chú giải (Annotated Models). | Nắm vững thuật toán tư duy cho từng dạng câu hỏi IELTS. |
| **3. Guided Practice (Luyện Có Hướng Dẫn)** | Thực hành với bài tập ngắn, có gợi ý từ khóa, gợi ý đoạn văn chứa evidence. | Hiển thị Scaffolding (giàn giáo hỗ trợ), gợi ý bước tư duy khi học viên lúng túng. | Áp dụng chiến lược đúng mà không bị áp lực thời gian. |
| **4. Independent Practice (Luyện Độc Lập)** | Tự làm bài tập hoàn chỉnh với độ dài tiêu chuẩn trong điều kiện có bấm giờ. | Ghi nhận câu trả lời, không đưa gợi ý trong quá trình làm bài. | Đo lường năng lực độc lập và độ chính xác thực tế. |
| **5. Diagnostic & Feedback (Chẩn Đoán & Chữa Lỗi)** | Phân tích bài làm, giải thích nguyên nhân sai, so sánh bản nháp và bản sửa. | Trích xuất bằng chứng (Evidence), phân tích bẫy distractors, đề xuất bài tập khắc phục. | Nhận diện điểm yếu nhận thức và củng cố kiến thức hổng. |

### 1.3. Cá Nhân Hóa Dựa Trên Bằng Chứng (Data-Driven Personalization)
`[PLATFORM BUSINESS]`  
Lộ trình học tập của mỗi học viên được tái cấu trúc động dựa trên véc-tơ năng lực 6 chiều:
1. **Current Band ($B_{\text{current}}$):** Kết quả Diagnostic Test đầu vào hoặc bài thi thử gần nhất.
2. **Target Band ($B_{\text{target}}$):** Mục tiêu đầu ra tổng và mục tiêu sàn cho từng kỹ năng.
3. **Time-to-Exam ($T_{\text{days}}$):** Số ngày thực tế còn lại đến ngày thi chính thức.
4. **Accuracy Vector by Question Type:** Ma trận tỷ lệ trả lời đúng chi tiết cho 20+ dạng bài IELTS.
5. **Recurring Mistake Frequency:** Tần suất các lỗi hệ thống lặp lại qua các bài nộp.
6. **Active Daily Budget:** Thời lượng cam kết học hàng ngày (30, 45, 60, hoặc 90 phút).

### 1.4. Phân Biệt Điểm Ước Lượng Nội Bộ & Điểm Thi Thật
`[IELTS OFFICIAL]` & `[PLATFORM BUSINESS]`  
> [!IMPORTANT]
> **Quy Chuẩn Pháp Lý & Truyền Thông Nền Tảng:**
> - Điểm số do hệ thống tính toán luôn được định danh là **"Internal Estimated Band" (Band ước lượng nội bộ)** đi kèm khoảng tin cậy (Confidence Interval, ví dụ: $6.5 \pm 0.5$).
> - Tuyệt đối không sử dụng danh xưng "Official IELTS Score" cho kết quả thi thử hoặc bài nộp tự động.
> - **Cấm cam kết lộ trình cố định (No False Timeline Guarantees):** Không bao giờ tuyên bố các câu như *"Tăng 1.5 Band sau 30 ngày"* cho mọi học viên. Tốc độ tiến bộ phụ thuộc vào thời lượng tự học thực tế, khả năng tiếp thu ngôn ngữ và nền tảng ban đầu của từng cá nhân.

---

## 2. LISTENING LEARNING RULES

### 2.1. Phân Tầng Năng Lực Giảng Dạy Listening
`[INTERNAL PEDAGOGY]`

#### A. Giai Đoạn Foundation (Nhận Diện Ngữ Âm & Dữ Liệu Thực Tế)
Học viên ở trình độ cơ bản thường nghe không kịp hoặc nghe sai không phải vì thiếu từ vựng, mà vì hiện tượng âm thanh thực tế trong văn nói khác với mặt chữ. Giai đoạn Foundation tập trung vào:
* **Nhận diện âm vị tối thiểu (Minimal Pairs):** Phân biệt các cặp âm dễ gây nhầm lẫn: `/iː/` vs `/ɪ/` (*sheep* vs *ship*), `/e/` vs `/æ/` (*pen* vs *pan*), `/θ/` vs `/s/` (*think* vs *sink*), `/v/` vs `/b/` (*vest* vs *best*).
* **Cụm phụ âm cuối (Final Consonant Clusters):** Nhận diện âm đuôi quyết định thì và số lượng: `/-sts/` (*costs*), `/-skt/` (*asked*), `/-kts/` (*facts*).
* **Hiện tượng ngữ âm trong văn nói tự nhiên (Connected Speech):**
  - **Nối âm (Linking):** Phụ âm nối nguyên âm (*hold on* $\rightarrow$ `/həʊld-ɒn/`), bán nguyên âm `/w/` và `/j/` (*two apples* $\rightarrow$ `/tuː-w-æplz/`).
  - **Nuốt âm (Elision):** Triệt tiêu âm `/t/` và `/d/` khi đứng giữa phụ âm (*last night* $\rightarrow$ `/lɑːs-naɪt/`, *next door* $\rightarrow$ `/neks-dɔː/`).
  - **Đồng hóa âm (Assimilation):** Biến đổi âm (*handbag* $\rightarrow$ `/hæmbæɡ/`, *ten men* $\rightarrow$ `/tem men/`).
  - **Dạng yếu của từ chức năng (Weak Forms):** *to* $\rightarrow$ `/tə/`, *for* $\rightarrow$ `/fə/`, *been* $\rightarrow$ `/bɪn/`, *and* $\rightarrow$ `/ən/`.
* **Dữ liệu thực tế thường gặp:** Luyện nhận diện tốc độ cao bảng chữ cái đánh vần (A, E, I, J, G, H, Y), số nhà, số điện thoại, mã bưu chính (UK Postcodes: 2 chữ cái + số + chữ cái), ngày tháng, giờ giấc và tiền tệ (£, $, €).

#### B. Giai Đoạn Skill Development (Chiến Lược Xử Lý Bài Nghe)
* **Kỹ thuật Dự đoán Trước khi Nghe (Pre-listening Prediction):** Tận dụng 30-45 giây trước mỗi section để phân tích từ loại cần điền (noun, verb, adjective, number), dạng thông tin (name, distance, location) và ngữ cảnh đề bài.
* **Kỹ thuật Định vị Từ Khóa Không Thể Paraphrase (Anchor Keywords):** Xác định các từ khó biến đổi như tên riêng viết hoa, năm tháng, thuật ngữ chuyên ngành để theo dõi tiến độ của audio.
* **Kỹ thuật Nhận Diện Bẫy Đảo Chiều (Distractor Identification):** Huấn luyện học viên nhận diện các tín hiệu từ chối hoặc sửa sai trong hội thoại:
  - Tín hiệu đổi ý: *"I originally thought of... but actually...", "Well, let's go with the later date instead."*
  - Tín hiệu phủ định ngầm: *"We used to offer that service, but since last year it's been discontinued."*
* **Tín hiệu Định hướng Diễn thuyết (Signposting Language):** Nhận diện cấu trúc bài giảng Section 4 qua các cụm từ chuyển ý (*"Moving on to...", "What surprised researchers was...", "In contrast to previous theories..."*).

### 2.2. Quy Tắc Giảng Dạy Chi Tiết Theo Từng Dạng Bài Listening
`[INTERNAL PEDAGOGY]`

```
┌────────────────────────────────────────────────────────────────────────┐
│               IELTS LISTENING 9 QUESTION TYPE MATRIX                   │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 1. Form Completion       │ Điền thông tin hành chính, dịch vụ (Part 1) │
│ 2. Note Completion       │ Ghi chép bài giảng, tóm tắt ý chính (Part 4)│
│ 3. Table Completion      │ Điền dữ liệu đối chiếu theo dòng/cột        │
│ 4. Flow-chart Completion │ Tiến trình thí nghiệm, quy trình lịch sử    │
│ 5. Summary Completion    │ Tóm tắt đoạn nói có hoặc không có từ gợi ý  │
│ 6. Sentence Completion   │ Hoàn thành câu đơn lẻ chứa thông tin chuẩn  │
│ 7. Multiple Choice       │ Chọn 1 trong 3 đáp án hoặc chọn nhiều đáp án│
│ 8. Matching              │ Ghép đặc điểm với đối tượng phân loại       │
│ 9. Plan/Map/Diagram      │ Định vị địa điểm theo sơ đồ hoặc quy trình  │
└──────────────────────────┴─────────────────────────────────────────────┘
```

#### Dạng 1 to 6: Completion Types (Điền Từ Vào Chỗ Trống)
* **Quy tắc đếm từ nghiêm ngặt:** Đọc kỹ chỉ dẫn `NO MORE THAN X WORDS AND/OR A NUMBER`. Nếu đề yêu cầu `NO MORE THAN TWO WORDS` mà học viên điền `a red car` (3 từ) $\rightarrow$ Tự động chấm SAI dù ý nghĩa đúng.
* **Nguyên tắc giữ nguyên từ nghe được (Raw Form Retention):** Câu trả lời trong bài Completion **phải là từ chính xác xuất hiện trong audio**, không tự ý chia lại dạng từ hay thay bằng từ đồng nghĩa.
* **Chính tả và Số ít/Số nhiều:** Sai một ký tự hoặc thiếu số nhiều `s/es` khi audio phát âm rõ ràng $\rightarrow$ Không được tính điểm.

#### Dạng 7: Multiple Choice (Trắc Nghiệm Đơn & Đa Lựa Chọn)
* **Phương pháp đọc đề trước:** Không cố đọc toàn bộ cả 3 đáp án A, B, C một cách thụ động. Chỉ gạch chân từ khóa ở phần thân câu hỏi (Question Stem) để xác định trọng tâm; sau đó quét lướt sự khác biệt mấu chốt giữa các lựa chọn.
* **Bẫy tất cả các lựa chọn đều được nhắc đến:** 100% các bài Multiple Choice Band 6.5+ đều nhắc đến từ ngữ của cả 3 lựa chọn A, B, C trong audio. Lựa chọn sai thường rơi vào bẫy:
  - Nhắc đến trong quá khứ nhưng hiện tại đã bỏ.
  - Người nói A đề xuất nhưng người nói B phản đối.
  - Thông tin là sự thật nhưng không trả lời trực tiếp cho câu hỏi.

#### Dạng 8: Matching (Nối Đặc Điểm & Ý Tưởng)
* **Chiến thuật tập trung danh sách câu hỏi:** Danh sách lựa chọn cố định (thường là người, sách, hoặc giai đoạn) được nghe theo thứ tự ngẫu nhiên, nhưng các câu hỏi được sắp xếp theo đúng trình tự xuất hiện của audio.
* **Paraphrase liên tục:** Ý nghĩa trong các lựa chọn được diễn đạt lại bằng từ ngữ hoàn toàn khác trong băng ghi âm.

#### Dạng 9: Plan, Map & Diagram Labelling (Gắn Nhãn Bản Đồ & Sơ Đồ)
* **Xác định điểm khởi đầu (Starting Point):** Tìm vị trí `"You are here"` hoặc lối vào chính (*"Main Entrance"*, *"Reception"*).
* **La bàn và Định hướng Không gian:** Nắm vững hệ quy chiếu hướng Bắc/Nam/Đông/Tây (*"To the north of..."*) và tương đối (*"On your left-hand side"*, *"Directly opposite"*, *"In the far corner"*).

### 2.3. Quy Chuẩn 4 Sections/Parts Theo Khung Thi Chính Thức
`[IELTS OFFICIAL]`

| Section / Part | Bối Cảnh (Context) | Số Người Nói | Giọng & Tốc Độ | Độ Phức Tạp Học Thuật |
| :---: | :--- | :---: | :--- | :--- |
| **Part 1** | Tình huống xã hội hàng ngày (Đặt phòng, đăng ký tour, khiếu nại dịch vụ). | 2 người (Đối thoại) | Tiếng Anh chuẩn (Anh, Úc, Mỹ), tốc độ tự nhiên vừa phải. | Từ vựng đời sống, số liệu cụ thể, đánh vần họ tên. |
| **Part 2** | Bài nói độc thoại trong ngữ cảnh xã hội (Hướng dẫn viên bảo tàng, giới thiệu sự kiện cộng đồng). | 1 người (Độc thoại) | Thường là giọng Anh hoặc Úc, ngắt nghỉ rõ ràng. | Mô tả chi tiết không gian, lộ trình, quy định, tiện ích. |
| **Part 3** | Thảo luận học thuật giữa sinh viên và giảng viên hoặc một nhóm sinh viên. | 2–4 người (Đa thoại) | Đa dạng giọng vùng miền, tốc độ nhanh, có ngắt lời. | Đánh giá tài liệu, phân tích phương pháp luận, phản biện. |
| **Part 4** | Bài giảng đại học mang tính học thuật thuần túy về khoa học, lịch sử, động vật học. | 1 người (Thuyết trình) | Giọng học thuật chuẩn mực, liền mạch không có quãng nghỉ giữa bài. | Mật độ từ vựng chuyên ngành cao, cấu trúc lập luận phức tạp. |

### 2.4. Quy Trình Trải Nghiệm Học Tập Bài Listening
`[PLATFORM BUSINESS]`
1. **Pre-listening Phase:** Hiển thị mục tiêu học tập, danh sách 3–5 từ vựng then chốt cần kích hoạt, hướng dẫn kỹ thuật làm dạng bài mục tiêu.
2. **Strategy Walkthrough:** Cung cấp 1 ví dụ có audio ngắn (30-45 giây), hiển thị phân tích mẫu về cách dự đoán và cách bắt tín hiệu câu trả lời.
3. **Execution Phase:** Học viên nghe audio bài tập và điền/chọn đáp án trực tiếp trên giao diện tương tác.
4. **Scoring & Diagnosis Phase:**
   - Hệ thống tự động đối soát đáp án, ghi nhận đúng/sai.
   - **Interactive Transcript Engine:** Hiển thị transcript đồng bộ thời gian với audio. Nhấp vào bất kỳ câu nào trong transcript, audio sẽ phát ngay tại vị trí đó.
   - **Answer Evidence Highlighter:** Bôi đậm vị trí chứa câu trả lời bằng màu xanh lá (`#16A34A`), bôi đậm bẫy distractor bằng màu hổ phách (`#D97706`).
   - **Paraphrase Mapping Box:** Bảng đối chiếu song song: Từ khóa trong câu hỏi $\leftrightarrow$ Từ đồng nghĩa phát âm trong audio.

### 2.5. Phân Định Các Chế Độ Nghe (Listening Modes)
`[PLATFORM BUSINESS]`

| Chế Độ | Số Lượt Nghe | Tua / Dừng Audio | Hiển Thị Transcript | Gợi Ý Đáp Án | Mục Đích Sư Phạm |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Learning Mode** | Không giới hạn | Cho phép tự do | Cho phép xem bất kỳ lúc nào | Có gợi ý từ khóa | Giảng dạy kỹ thuật, phát triển năng lực nhận diện âm. |
| **Practice Mode** | Cấu hình (1 hoặc 2 lượt) | Chỉ cho phép tạm dừng | Chỉ xem sau khi nộp bài | Không có | Luyện tập củng cố kỹ năng và rèn phản xạ. |
| **Mock Test Mode** | **Duy nhất 1 lượt (Strict)** | **Cấm tua / Cấm dừng** | **Cấm tuyệt đối trong khi thi** | Không có | Mô phỏng chính xác áp lực bài thi thật Cambridge CDI. |

### 2.6. Ma Trận Chỉ Số Theo Dõi Năng Lực Listening
`[PLATFORM BUSINESS]`
* `Accuracy Rate (%)`: Tỷ lệ chính xác tổng và theo từng Part (Part 1-4).
* `Distractor Trap Fall Rate (%)`: Tỷ lệ học viên chọn trúng bẫy thông tin bị đảo chiều.
* `Spelling Error Rate (%)`: Tỷ lệ câu trả lời đúng ý nhưng sai chính tả hoặc sai số ít/số nhiều.
* `Blank Response Rate (%)`: Tỷ lệ câu hỏi không kịp nghe và để trống.
* `Average Latency to Answer (s)`: Khoảng thời gian từ lúc tín hiệu xuất hiện trong audio đến khi học viên nhập xong đáp án.

---

## 3. READING LEARNING RULES

### 3.1. Phương Pháp Học Reading: Đọc Hiểu Thực Chất Thay Vì "Mẹo Vặt"
`[INTERNAL PEDAGOGY]`  
Nền tảng kiên quyết **loại bỏ phương pháp "tìm keyword mù quáng" (Blind Keyword Matching)**. Trong các đề thi IELTS hiện đại từ Cambridge 14 trở đi, các câu hỏi khó đều sử dụng Paraphrase ý niệm (Conceptual Paraphrasing) hoặc cấu trúc ngữ pháp đảo ngược, khiến học viên chỉ tìm từ giống nhau 100% sẽ rơi thẳng vào bẫy của giám khảo.

```
┌────────────────────────────────────────────────────────────────────────┐
│             READING COGNITIVE PROCESSING HIERARCHY                    │
├────────────────────────────────────────────────────────────────────────┤
│ Level 4: EVALUATION & INFERENCE (Suy luận ngầm, thái độ tác giả)       │
│ Level 3: CONCEPTUAL PARAPHRASING (Hiểu cấu trúc tương đương ngữ nghĩa) │
│ Level 2: DETAILED SYNTACTIC PARSING (Phân tích cấu trúc ngữ pháp câu)  │
│ Level 1: SKIMMING & SCANNING (Bao quát ý chính & định vị vùng dữ liệu) │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Giai Đoạn Foundation
* **Phân tích cấu trúc câu phức tạp (Syntactic Parsing):** Xác định thành phần nòng cốt Chủ ngữ (S) - Vị ngữ (V) - Tân ngữ (O), bóc tách các mệnh đề quan hệ lồng ghép, mệnh đề phân từ (*participle clauses*), đảo ngữ (*inversion*).
* **Từ chỉ định & Sự liên kết (Reference Words & Cohesive Ties):** Xác định chính xác các đại từ thay thế (*it, they, this phenomenon, the former, the latter*) đang trỏ về danh từ hay ý tưởng nào ở câu trước.
* **Nhận diện Từ nối Luận điểm (Discourse Connectors):**
  - Tương phản: *However, Nevertheless, On the contrary, Despite this*.
  - Nguyên nhân - Hệ quả: *Consequently, Hence, It follows that*.
  - Nhượng bộ: *Admittedly, While it is true that, Even so*.
* **Skimming vs Scanning Chuẩn Mực:**
  - **Skimming:** Đọc lướt tiêu đề, câu đầu, câu cuối từng đoạn văn trong 2-3 phút để vẽ bản đồ tư duy về cấu trúc bài viết (Macro-structure).
  - **Scanning:** Di chuyển mắt tìm kiếm các thực thể độc nhất (con số, tên nhà khoa học, chữ viết hoa) để xác định đoạn văn chứa bằng chứng.

#### B. Giai Đoạn Skill Development
* **Giải mã Paraphrase Đa Tầng:**
  - Cấp độ từ: *fragile* $\rightarrow$ *vulnerable*; *deteriorate* $\rightarrow$ *worsen*.
  - Cấp độ ngữ: *solve the problem* $\rightarrow$ *address the issue*; *put pressure on* $\rightarrow$ *place a strain on*.
  - Cấp độ cấu trúc: Chủ động sang bị động; Danh từ hóa (*They extracted groundwater* $\rightarrow$ *The extraction of groundwater*).
* **Phân biệt Fact (Sự thật) và Opinion (Quan điểm):** Nhận diện các động từ tình thái và trạng từ giảm tải rủi ro (*hedging*): *suggests, claims, argues, is likely to, presumably, arguably*.

### 3.2. Quy Chuẩn Xử Lý Từng Dạng Bài Reading Chuyên Biệt
`[INTERNAL PEDAGOGY]`

#### A. Khung Phân Biệt Tuyệt Đối: True / False / Not Given & Yes / No / Not Given
`[IELTS OFFICIAL]` & `[INTERNAL PEDAGOGY]`

| Giá Trị Đáp Án | Định Nghĩa Sư Phạm Chuẩn | Ví Dụ Minh Họa |
| :---: | :--- | :--- |
| **TRUE / YES** | Thông tin trong câu hỏi **hoàn toàn trùng khớp về mặt ngữ nghĩa** với thông tin trong bài đọc (dù được paraphrase toàn diện). | *Bài đọc:* The library was erected in 1920.<br>*Câu hỏi:* The construction of the library finished in 1920. $\rightarrow$ **TRUE** |
| **FALSE / NO** | Thông tin trong câu hỏi **mâu thuẫn trực tiếp hoặc phủ định** thông tin trong bài đọc. Cả hai không thể cùng đúng tại một thời điểm. | *Bài đọc:* Only adult males were permitted to join.<br>*Câu hỏi:* Women were allowed to become members. $\rightarrow$ **FALSE** |
| **NOT GIVEN** | Bài đọc **không có đủ bằng chứng** để khẳng định câu hỏi là Đúng hay Sai. Có thể bài đọc nhắc đến chủ đề đó, nhưng không đề cập mối quan hệ hoặc con số cụ thể được nêu trong câu hỏi. | *Bài đọc:* John traveled to Paris by train in 1995.<br>*Câu hỏi:* John thought Paris was the most beautiful city he had visited. $\rightarrow$ **NOT GIVEN** |

> [!CAUTION]
> **Quy Tắc Chống Suy Đoán Ngoài Văn Bản (Anti-Extrapolation Rule):**
> Nghiêm cấm học viên dùng kiến thức thực tế bên ngoài (Common Sense / Real-world Knowledge) để suy diễn ra đáp án. Nếu một thông tin thực tế ngoài đời ai cũng biết là đúng, nhưng bài đọc không đề cập một chữ nào $\rightarrow$ Đáp án bắt buộc phải là **NOT GIVEN**.

#### B. Matching Headings (Nối Tiêu Đề Đoạn Văn)
* **Mục tiêu:** Đo lường khả năng tóm tắt ý chính của toàn bộ đoạn văn, không phải tìm chi tiết vụn vặt.
* **Quy trình chuẩn:** Đọc đoạn văn trước, tự tóm tắt ý chính bằng 1 cụm từ trong đầu (Gist Statement), sau đó mới đối chiếu với danh sách tiêu đề đề bài cho.
* **Bẫy chi tiết phụ:** Tiêu đề sai thường chứa nguyên văn một từ xuất hiện trong đoạn văn, nhưng từ đó chỉ đóng vai trò ví dụ phụ (Supporting Detail) chứ không bao quát toàn bộ đoạn.

#### C. Matching Information to Paragraphs (Tìm Đoạn Chứa Thông Tin Cụ Thể)
* **Phân biệt với Matching Headings:** Matching Information đi tìm một chi tiết cụ thể (*a reference to, an explanation of, a mention of*). Chi tiết này có thể chỉ nằm ẩn trong một nửa câu của đoạn văn.
* **Lưu ý quy định lặp đoạn:** Chú ý chỉ dẫn `NB You may use any letter more than once` $\rightarrow$ Chắc chắn có ít nhất một đoạn văn là đáp án cho 2 câu hỏi khác nhau.

### 3.3. Đối Chiếu Academic Reading vs General Training Reading
`[IELTS OFFICIAL]`

| Tiêu Chí | IELTS Academic Reading | IELTS General Training Reading |
| :--- | :--- | :--- |
| **Cấu Trúc Đề** | 3 Passages dài (tổng cộng 2.150 – 2.750 từ). | 3 Sections gồm 4–5 văn bản ngắn và 1 văn bản dài (tổng 2.000 – 2.500 từ). |
| **Nguồn Văn Bản** | Sách khoa học, tạp chí học thuật, báo cáo nghiên cứu, chuyên khảo. | Thông báo tuyển dụng, cẩm nang nhân viên, hợp đồng, quảng cáo dịch vụ, tạp chí đời sống. |
| **Chủ Đề Section 1** | Bài nghiên cứu khoa học xã hội hoặc tự nhiên nhập môn. | Ngữ cảnh sinh tồn thường ngày (Social Survival - 2 văn bản ngắn thực tế). |
| **Chủ Đề Section 2** | Nghiên cứu ứng dụng hoặc lịch sử chuyên sâu. | Ngữ cảnh nơi làm việc (Workplace Context - Đào tạo nhân viên, phúc lợi, an toàn lao động). |
| **Chủ Đề Section 3** | Bài đọc học thuật phức tạp, tranh luận lý thuyết trừu tượng. | Văn bản mở rộng về một chủ đề đời sống/lịch sử/khoa học đại chúng. |
| **Quy Đổi Điểm (30/40)** | Đạt Band **7.0**. | Đạt Band **6.0** (Thang điểm GT yêu cầu số câu đúng cao hơn để đạt cùng band). |

### 3.4. Quy Chuẩn Bằng Chứng & Chữa Lỗi Reading
`[PLATFORM BUSINESS]`
Khi học viên hoàn thành một bài đọc, hệ thống kích hoạt **Evidence Reasoning Panel**:
1. **Passage Pinpoint:** Định vị câu chứa bằng chứng trong văn bản, bôi sáng bằng viền xanh emerald (`border-emerald-500 bg-emerald-500/10`).
2. **Lexical Equation Table:** Bảng phương trình đồng nghĩa:
   $$\text{Question Statement: } \underline{\text{drastic measures}} \iff \text{Text Evidence: } \underline{\text{rigorous interventions}}$$
3. **Distractor Debunking Box:** Đối với các lựa chọn sai, hệ thống chỉ rõ:
   - Lựa chọn A: *Contradiction* (Mâu thuẫn với dòng 14).
   - Lựa chọn C: *Not Mentioned* (Bài đọc chỉ nhắc đến xe điện, không nhắc đến giá thành sản xuất pin).

---

## 4. WRITING LEARNING RULES

### 4.1. Khung Kiến Trúc Sư Phạm Writing: Viết Có Cấu Trúc
`[INTERNAL PEDAGOGY]`  
Học viết IELTS không phải là việc đưa đề bài cho học viên tự viết một bài luận dài rồi nhờ AI chấm một con số vô hồn. Hệ thống tiếp cận kỹ năng viết như một **công trình kiến trúc có giàn giáo (Scaffolded Writing Architecture)**:

```
Step 1: Prompt Deconstruction (Phân tích cấu trúc đề, xác định phạm vi)
   │
Step 2: Idea Generation & Categorization (Động não & gom nhóm ý tưởng)
   │
Step 3: Strategic Outlining (Lập dàn ý chi tiết từng đoạn văn)
   │
Step 4: Lexical & Grammatical Priming (Nạp từ vựng & cấu trúc ngữ pháp tương ứng)
   │
Step 5: Guided Sentence/Paragraph Drafting (Viết từng câu/đoạn có phản hồi tức thì)
   │
Step 6: Full Essay Assembly & Proofreading (Lắp ghép thành bài và tự soát lỗi)
   │
Step 7: Multidimensional Evaluation & Iterative Redrafting (Chấm điểm & Viết lại V2)
```

### 4.2. Khung Giảng Dạy Academic Writing Task 1
`[IELTS OFFICIAL]` & `[INTERNAL PEDAGOGY]`

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ACADEMIC TASK 1 ESSENTIAL MODULES                    │
├──────────────────────┬─────────────────────────────────────────────────┤
│ Trend Graphs         │ Line Graph (Biểu đồ đường qua các mốc thời gian)│
│ Comparative Data     │ Bar Chart, Column Chart (So sánh các đối tượng) │
│ Proportions & Share  │ Pie Chart (Thị phần, tỷ lệ phần trăm phân bổ)   │
│ Numerical Tables     │ Data Table (Bảng số liệu ma trận nhiều chiều)    │
│ Dynamic Processes    │ Man-made Process & Natural Life Cycle           │
│ Spatial Developments │ Comparative Maps (Bản đồ quy hoạch 2 mốc thời gian)
│ Combined Diagrams    │ Mixed Charts (Biểu đồ kết hợp: Line + Bar, v.v.)│
└──────────────────────┴─────────────────────────────────────────────────┘
```

#### Quy Chuẩn Cấu Trúc Bắt Buộc 3 Thành Phần (Task 1 Architecture):
1. **Introduction (1 câu):** Paraphrase lại hoàn toàn câu chủ đề của đề bài bằng ngôn ngữ cá nhân (thay đổi từ đồng nghĩa và cấu trúc câu: *shows* $\rightarrow$ *illustrates*, *the percentage of* $\rightarrow$ *the proportion of*).
2. **Overview (1–2 câu - BẮT BUỘC):**
   > [!IMPORTANT]
   > Không có Overview hoặc Overview chứa số liệu cụ thể $\rightarrow$ **Điểm Task Achievement tối đa chỉ đạt Band 5.0**.  
   > Overview phải nêu bật được 2 đặc điểm bao quát nhất:
   > - Với biểu đồ có thời gian: Xu hướng chung tăng/giảm nổi bật nhất và đối tượng luôn dẫn đầu/thấp nhất.
   > - Với biểu đồ tĩnh: Hạng mục chiếm tỷ trọng lớn nhất và nhỏ nhất.
   > - Với quy trình: Số lượng giai đoạn chính, điểm bắt đầu và điểm kết thúc.
   > - Với bản đồ: Xu hướng hiện đại hóa, công nghiệp hóa, hoặc sự thay đổi của cây xanh/giao thông.
3. **Detail Body Paragraphs (2 đoạn văn):**
   - Gom nhóm số liệu theo tư duy logic (không liệt kê tuần tự từ trái sang phải).
   - Chọn lọc các mốc số liệu nổi bật: điểm khởi đầu, điểm cao nhất (peak), điểm thấp nhất, điểm giao nhau, điểm kết thúc.
   - Luôn sử dụng ngôn ngữ so sánh (*in comparison with, whereas, followed by, threefold*).

### 4.3. Khung Giảng Dạy General Training Writing Task 1
`[IELTS OFFICIAL]` & `[INTERNAL PEDAGOGY]`
Đào tạo kỹ năng viết thư dựa trên **Mục Đích Giao Tiếp & Sắc Thái Ngôn Từ (Tone of Voice)**:

| Loại Thư | Đối Tượng Nhận | Lời Chào Chuẩn | Văn Phong (Register) | Lời Kết Chuẩn |
| :--- | :--- | :--- | :--- | :--- |
| **Formal** | Người chưa quen biết, cơ quan chức năng, quản lý công ty. | *Dear Sir or Madam,* hoặc *Dear Mr. Davis,* | Trang trọng, tuyệt đối không viết tắt (*don't* $\rightarrow$ *do not*), dùng cấu trúc bị động lịch sự. | *Yours faithfully,* (khi chào Sir/Madam)<br>*Yours sincerely,* (khi biết tên) |
| **Semi-formal** | Đồng nghiệp, giáo viên, chủ nhà trọ, đối tác quen biết. | *Dear Mr. Smith,* hoặc *Dear John,* | Lịch sự nhưng tự nhiên, hạn chế tiếng lóng, diễn đạt rõ ràng rành mạch. | *Warm regards,* hoặc *Yours sincerely,* |
| **Informal** | Bạn thân, thành viên gia đình, người thân thiết. | *Dear Sarah,* hoặc *Hi Alex,* | Gần gũi, được phép viết tắt, dùng câu cảm thán, từ vựng đời sống. | *Best wishes,* hoặc *All the best,* |

* **Yêu cầu Task Achievement trong Thư GT:** Phải hoàn thành đầy đủ và cân bằng cả **3 dấu gạch đầu dòng (bullet points)** của đề bài. Bỏ sót hoặc viết quá sơ sài 1 ý $\rightarrow$ Task Achievement bị hạ xuống Band 5.0 - 6.0.

### 4.4. Khung Giảng Dạy Task 2 (Áp Dụng Cho Cả Academic & General Training)
`[IELTS OFFICIAL]` & `[INTERNAL PEDAGOGY]`

```
┌────────────────────────────────────────────────────────────────────────┐
│                      IELTS TASK 2 ESSAY ESSENTIAL TYPES                │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 1. Opinion Essay         │ To what extent do you agree or disagree?    │
│ 2. Discussion Essay      │ Discuss both views and give your opinion    │
│ 3. Advantages & Disadv.  │ Do the advantages outweigh the disadvantages?│
│ 4. Problem & Solution    │ What are the causes and what solutions?     │
│ 5. Two-part Question     │ Direct Questions (2 câu hỏi riêng biệt)     │
└──────────────────────────┴─────────────────────────────────────────────┘
```

#### Quy Chuẩn Cấu Trúc Thân Bài Chuẩn Mực (PEEL Framework):
Mỗi đoạn thân bài Task 2 bắt buộc phải tuân thủ mô hình triển khai ý tưởng chiều sâu:
* **P (Point - Luận Điểm):** Câu chủ đề (*Topic Sentence*) nêu rõ lý do hoặc ý chính duy nhất của đoạn.
* **E (Explanation - Luận Cứ):** Giải thích logic tại sao luận điểm đó lại đúng, cơ chế tác động nhân quả (*This is because... As a consequence...*).
* **E (Example - Bằng Chứng/Ví Dụ):** Đưa ra một ví dụ minh họa khách quan, phù hợp thực tế đời sống (*For instance, a study conducted by...*).
* **L (Link - Câu Kết Nối):** Chốt lại luận điểm và liên kết trực tiếp trở lại câu hỏi của đề bài (*Therefore, it is evident that...*).

### 4.5. Hệ Thống 4 Tiêu Chí Chấm Điểm Writing Chính Thức
`[IELTS OFFICIAL]`

| Tiêu Chí | Trọng Tâm Đánh Giá Cốt Lõi | Các Lỗi Phổ Biến Gây Tụt Band |
| :--- | :--- | :--- |
| **1. Task Achievement (T1) / Task Response (T2)** | Trả lời đầy đủ mọi yêu cầu đề bài; có quan điểm rõ ràng xuyên suốt bài luận; luận điểm được giải thích sâu sắc, không chung chung. | Lạc đề; thiếu Overview ở Task 1; quan điểm không nhất quán (*fence-sitting*); đưa ý tưởng nhưng không giải thích. |
| **2. Coherence and Cohesion (CC)** | Bố cục đoạn văn hợp lý; mỗi đoạn có 1 ý tưởng trung tâm; sử dụng phương tiện liên kết tự nhiên, không gượng gạo; đại từ thay thế chính xác. | Không chia đoạn; lạm dụng từ nối cơ học ở đầu mọi câu (*Furthermore, Moreover, In addition*); ngắt mạch tư duy. |
| **3. Lexical Resource (LR)** | Vốn từ đa dạng; sử dụng collocations tự nhiên; dùng từ đúng văn cảnh học thuật; kiểm soát tốt chính tả và dạng từ (*word formation*). | Cố nhồi nhét "từ vựng khủng" Band 8+ nhưng dùng sai ngữ cảnh; sai chính tả lặp lại; lỗi dùng giới từ đi kèm từ vựng. |
| **4. Grammatical Range and Accuracy (GRA)** | Kết hợp linh hoạt câu đơn, câu ghép và câu phức; kiểm soát tốt thì, mạo từ (*a/an/the*), sự hòa hợp chủ-vị; tỷ lệ câu không có lỗi (*error-free sentences*). | Toàn câu đơn ngắn cụt lủn; viết câu phức quá dài gây mất kiểm soát cú pháp; sai mạo từ và dấu câu (*comma splice*). |

* **Trọng số tính điểm Writing:** Điểm bài thi Writing chính thức được tính theo tỷ lệ:
  $$\text{Writing Overall Band} = \text{RoundToHalf}\left(\frac{\text{Task 1 Score} \times 1 + \text{Task 2 Score} \times 2}{3}\right)$$

### 4.6. Quy Chuẩn AI Feedback & Quản Trị Phiên Bản Bài Viết
`[PLATFORM BUSINESS]`
* **Định danh lỗi cụ thể theo đoạn:** AI Feedback bắt buộc phải trích dẫn trực tiếp dòng văn bản của học viên, đánh dấu vị trí lỗi kèm mã phân loại (Grammar, Lexical, Cohesion, Task).
* **Mô hình trước & sau (Comparative Rewrite):** Cung cấp 2 bản sửa cho đoạn văn lỗi:
  - Bản sửa tối thiểu (*Minimal Fix - Band 6.5*): Giữ nguyên ý tưởng của học viên, chỉ sửa lỗi ngữ pháp và từ vựng để câu văn đúng chuẩn.
  - Bản nâng cấp học thuật (*Advanced Upgrade - Band 7.5+*): Viết lại với cấu trúc câu chặt chẽ hơn và collocations học thuật nâng cao.
* **Lịch sử phiên bản (Essay Versioning):** Hệ thống lưu trữ các bản nháp `V1 (Original)`, `V2 (Revised)`, `V3 (Polished)`. Cho phép xem chế độ so sánh đối chiếu (Diff Viewer) để học viên thấy rõ sự cải thiện từng tiêu chí điểm.

---

## 5. SPEAKING LEARNING RULES

### 5.1. Triết Lý Giảng Dạy: Giao Tiếp Tự Nhiên, Chống Học Thuộc Vẹt
`[INTERNAL PEDAGOGY]`  
Nền tảng tuyệt đối **không khuyến khích việc học sinh học thuộc lòng các câu trả lời mẫu dài (Script Memorization)**. Trong kỳ thi IELTS Speaking thật, giám khảo được đào tạo chuyên sâu để nhận diện thí sinh học vẹt (dấu hiệu: tốc độ nói không tự nhiên, ngữ điệu đều đều như đọc văn, phát âm từ vựng phức tạp trôi chảy nhưng lúng túng khi gặp câu hỏi bất ngờ). Thí sinh bị phát hiện học thuộc lòng sẽ bị phạt điểm nặng ở tiêu chí Fluency và Pronunciation.

### 5.2. Khung Giảng Dạy Chi Tiết 3 Parts Của Bài Thi Speaking
`[IELTS OFFICIAL]` & `[INTERNAL PEDAGOGY]`

```
┌────────────────────────────────────────────────────────────────────────┐
│                   IELTS SPEAKING 3-PART PROGRESSION                    │
├──────────────────┬──────────────────────┬──────────────────────────────┤
│ Part 1: Intro    │ 4–5 phút             │ Chủ đề quen thuộc thường ngày│
│ Part 2: Long Turn│ 3–4 phút (1 min prep)│ Độc thoại theo Cue Card      │
│ Part 3: Abstract │ 4–5 phút             │ Thảo luận chuyên sâu 2 chiều │
└──────────────────┴──────────────────────┴──────────────────────────────┘
```

#### A. Speaking Part 1: Kỹ Thuật Trả Lời Trực Diện & Mở Rộng Linh Hoạt
* **Thời lượng lý tưởng mỗi câu trả lời:** 2 đến 3 câu hoàn chỉnh (khoảng 15 – 25 giây). Tuyệt đối không trả lời cụt lủn "Yes/No", nhưng cũng không nói dông dài biến Part 1 thành bài thuyết trình.
* **Quy tắc A-R-E-A:**
  - **A (Answer):** Trả lời trực diện vào trọng tâm câu hỏi.
  - **R (Reason):** Đưa ra nguyên nhân giải thích vì sao.
  - **E (Example / Experience):** Đưa ra ví dụ cụ thể từ bản thân hoặc thực tế.
  - **A (Alternative):** So sánh với quá khứ hoặc đối tượng khác (*optional*).

#### B. Speaking Part 2: Công Thức Tận Dụng 1 Phút Chuẩn Bị & Duy Trì 2 Phút Nói
* **Chiến lược ghi chép 1 phút (Note-taking Strategy):** Tuyệt đối không viết thành câu hoàn chỉnh trên giấy nháp. Chia tờ giấy nháp thành 4 phần tương ứng 4 gợi ý trên Cue Card, chỉ ghi 2-3 từ khóa/collocations đắt giá cho mỗi nhánh.
* **Kỹ thuật duy trì bài nói không bị ngắt quãng (Pacing):**
  - Mở đầu bằng bối cảnh thời gian/không gian (*"I'd like to talk about an occasion when..."*).
  - Triển khai bài nói theo trình tự thời gian (Chronological Order) hoặc cấu trúc câu chuyện (Storytelling Arc: Mở đầu $\rightarrow$ Cao trào/Thử thách $\rightarrow$ Cách giải quyết $\rightarrow$ Cảm xúc cá nhân và bài học rút ra).
  - Nếu đã nói hết các gợi ý trên thẻ mà giám khảo chưa ngắt lời: Mở rộng sang tương lai (*"If I had the chance to do it again, I would..."*).

#### C. Speaking Part 3: Kỹ Thuật Tư Duy Trừu Tượng & Phản Biện Xã Hội
* **Chuyển dịch góc nhìn từ cá nhân sang xã hội:** Tránh dùng đại từ nhân xưng *"I, my family"* ở Part 3. Chuyển sang góc nhìn rộng lớn hơn: *"people in general", "the older generation", "from an economic standpoint"*.
* **Các cấu trúc phản xạ tư duy cao cấp:**
  - **So sánh quá khứ vs hiện tại:** *"Decades ago, people tended to... whereas nowadays, with the advent of technology..."*
  - **Đánh giá hai mặt vấn đề:** *"On the one hand, this trend fosters... However, on the flip side, we cannot overlook the risk of..."*
  - **Dự đoán xu hướng tương lai:** *"It is highly probable that in the foreseeable future..."*

### 5.3. Tiêu Chí Đánh Giá Speaking & Quy Chuẩn Phát Âm Công Bằng
`[IELTS OFFICIAL]`

```
┌────────────────────────────────────────────────────────────────────────┐
│                   4 OFFICIAL SPEAKING BAND DESCRIPTORS                 │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 1. Fluency & Coherence   │ Độ trôi chảy, tốc độ nói tự nhiên, mạch lạc │
│ 2. Lexical Resource      │ Vốn từ, thành ngữ tự nhiên, paraphrase      │
│ 3. Grammatical Range     │ Cấu trúc câu linh hoạt, độ chính xác ngữ pháp│
│ 4. Pronunciation         │ Trọng âm, ngữ điệu, sự rõ ràng, dễ hiểu     │
└──────────────────────────┴─────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Quy Chuẩn Phát Âm Công Bằng (Accent Equality Rule):**
> - Giám khảo IELTS chính thức và hệ thống AI **tuyệt đối không chấm điểm dựa trên việc học viên có "giọng Anh-Anh" (British Accent) hay "giọng Anh-Mỹ" (American Accent)**.
> - Tiêu chí Pronunciation đánh giá:
>   1. Độ rõ ràng của các âm vị (Phonemic clarity).
>   2. Phát âm chính xác trọng âm từ (Word stress) và trọng âm câu (Sentence stress).
>   3. Nhịp điệu và ngữ điệu (Rhythm & Intonation).
>   4. Khả năng ngắt cụm nghĩa (Chunking) để người nghe hiểu mạch lạc mà không phải căng tai phỏng đoán.
> - **Chất giọng mẹ đẻ (Regional Accent / Vietnamese Accent) hoàn toàn được chấp nhận** miễn là không gây cản trở đến sự hiểu nội dung của người nghe.

### 5.4. Quy Chuẩn AI Phân Tích Âm Thanh & Hạn Chế Kỹ Thuật
`[PLATFORM BUSINESS]`
* **Đo lường tốc độ nói (Speech Rate):** Tính toán số từ trên phút (WPM - Words Per Minute). Mức chuẩn tự nhiên của IELTS dao động từ **110 đến 140 WPM**. Dưới 90 WPM bị cảnh báo ngập ngừng kéo dài; trên 160 WPM bị cảnh báo nói quá vội mất kiểm soát nhịp thở.
* **Phân biệt ngập ngừng tự nhiên và ngập ngừng tìm từ:** Ngập ngừng tư duy về ý tưởng (*content pause*) là bình thường; ngập ngừng kéo dài để dịch từ ngữ (*lexical search pause*) sẽ ảnh hưởng đến điểm Fluency.
* **Cảnh báo chất lượng phần cứng:** Khi phát hiện tỷ lệ nhiễu âm thanh cao (Signal-to-Noise Ratio thấp) hoặc micrô bị méo tiếng, hệ thống hiển thị cảnh báo: *"Chất lượng ghi âm kém có thể làm sai lệch độ chính xác của bảng phân tích âm vị."*

---

## 6. VOCABULARY INTEGRATION

### 6.1. Từ Vựng Là Trục Xương Sống, Không Phải Kỹ Năng Thứ Năm
`[INTERNAL PEDAGOGY]`  
Từ vựng không tồn tại như một kỹ năng độc lập để học vẹt danh sách từ. Từ vựng là chất keo kết dính cả 4 kỹ năng:
* **Listening:** Nhận diện âm thanh của từ khi được phát âm trong câu có nối âm, nuốt âm.
* **Reading:** Hiểu nghĩa chính xác của từ trong văn cảnh học thuật và giải mã quan hệ đồng nghĩa.
* **Writing:** Vận dụng từ vựng chính xác về mặt kết hợp từ (Collocations) và sắc thái trang trọng.
* **Speaking:** Bật ra từ vựng tức thì với phát âm chuẩn, trọng âm đúng và ngữ điệu tự nhiên.

### 6.2. Cấu Trúc Bản Ghi Từ Vựng Chuẩn (Vocabulary Entry Schema)
`[PLATFORM BUSINESS]`
Mọi từ vựng trong hệ thống phải tuân thủ schema dữ liệu học thuật đầy đủ:
```typescript
interface VocabularyEntry {
  id: string;                      // e.g. "voc-deteriorate"
  word: string;                    // "deteriorate"
  phonetic: string;                // "/dɪˈtɪə.ri.ə.reɪt/"
  partOfSpeech: string;            // "verb"
  englishDefinition: string;       // "to become progressively worse"
  vietnameseMeaning: string;       // "suy giảm, xấu đi"
  exampleSentence: string;         // "Relations between the two countries have deteriorated sharply."
  collocations: string[];          // ["deteriorate rapidly", "deteriorate into chaos"]
  synonyms: string[];              // ["worsen", "decline", "degenerate"]
  antonyms: string[];              // ["improve", "ameliorate"]
  topic: string;                   // "Environment", "Health", "Society"
  cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
  targetBandRange: string;         // "6.5 - 7.5"
  audioUrl: string;                // Standard British & American authentic audio
}
```

### 6.3. Thuật Toán Lặp Lại Ngắt Quãng Hiệu Chuẩn (Calibrated SM-2 Algorithm)
`[PLATFORM BUSINESS]`  
Hệ thống sử dụng thuật toán Spaced Repetition hiệu chuẩn để quản lý trí nhớ dài hạn:
* **Thang đánh giá 4 mức phản xạ:**
  - `Again (q=1)`: Quên hoàn toàn nghĩa hoặc phát âm $\rightarrow$ Đặt lại chu kỳ ôn tập về Ngày 1, giảm Ease Factor.
  - `Hard (q=2)`: Nhớ nhưng mất nhiều thời gian suy nghĩ $\rightarrow$ Khoảng cách tăng chậm ($I_{n} = \max(1, \lfloor I_{n-1} \times 1.2 \rfloor)$).
  - `Good (q=3)`: Nhớ chuẩn xác $\rightarrow$ Chu kỳ nhân theo hệ số Ease Factor chuẩn.
  - `Easy (q=4)`: Nhớ tức thì kèm vận dụng được $\rightarrow$ Tăng vọt chu kỳ ($I_{n} = \lfloor I_{n-1} \times EF \times 1.3 \rfloor$).
* **Quy chuẩn chống học thụ động:** Lật mặt thẻ flashcard để xem nghĩa chỉ là bước tra cứu. Hệ thống **tuyệt đối không ghi nhận điểm nhớ nếu học viên chưa chọn 1 trong 4 nút đánh giá phản xạ thực tế**.

---

## 7. LEARNING LEVELS & COMPETENCY PROFILES

### 7.1. Phân Tầng Năng Lực 5 Cấp Độ Nền Tảng (Platform Level Taxonomy)
`[INTERNAL PEDAGOGY]` & `[PLATFORM BUSINESS]`

| Cấp Độ Nền Tảng | CEFR Tương Đương | Khoảng Band Mục Tiêu | Năng Lực Đầu Vào Tối Thiểu | Mục Tiêu Đầu Ra Trọng Tâm |
| :--- | :---: | :---: | :--- | :--- |
| **Foundation** | A2 | **3.0 – 4.0** | Biết ngữ pháp căn bản, vốn từ < 1.000 từ, nghe phát âm từng từ rời rạc. | Nắm chắc ngữ âm cốt lõi, 12 thì cơ bản, viết câu đơn/ghép đúng ngữ pháp. |
| **Elementary** | B1 | **4.5 – 5.0** | Giao tiếp đơn giản về bản thân, hiểu đoạn văn ngắn đời sống. | Viết được đoạn văn hoàn chỉnh, hiểu Part 1-2 Listening, làm quen dạng đề. |
| **Intermediate** | B2 | **5.5 – 6.0** | Hiểu ý chính bài báo học thuật đơn giản, viết essay có cấu trúc nhưng còn lỗi. | Nắm chắc phương pháp mọi dạng bài, tăng tốc độ đọc, hạn chế lỗi ngữ pháp. |
| **Upper-Intermediate**| B2+ / C1 | **6.5 – 7.0** | Đọc hiểu tốt văn bản phức tạp, viết bài luận chặt chẽ, nói trôi chảy có ngắt nghỉ. | Paraphrase linh hoạt, kiểm soát Task 1-2 sắc bén, phản xạ nói Part 3 tự nhiên. |
| **Advanced** | C1+ / C2 | **7.5 – 8.5+** | Sử dụng ngôn ngữ thuần thục, tinh tế, sai sót rất hiếm và tự sửa được. | Tối ưu hóa văn phong học thuật, tư duy lập luận phản biện sâu, phát âm tinh tế. |

### 7.2. Hồ Sơ Năng Lực Độc Lập Cho Từng Kỹ Năng (Independent Skill Profiling)
`[PLATFORM BUSINESS]`  
Hệ thống **tuyệt đối không áp đặt một cấp độ duy nhất cho cả 4 kỹ năng của một học viên**. Một người học có thể có hồ sơ năng lực không đồng đều:
```json
{
  "learnerId": "usr-882194",
  "skillProfiles": {
    "listening": { "level": "Upper-Intermediate", "estimatedBand": 7.0 },
    "reading":   { "level": "Advanced",           "estimatedBand": 7.5 },
    "writing":   { "level": "Elementary",         "estimatedBand": 5.0 },
    "speaking":  { "level": "Intermediate",       "estimatedBand": 6.0 }
  }
}
```
Khi đó, hệ thống tự động giao bài học trình độ Advanced cho Reading, nhưng vẫn phân phối bài học Foundation và Elementary cho Writing để bù đắp điểm yếu ngữ pháp.

---

## 8. STANDARD LESSON STRUCTURE

### 8.1. Cấu Trúc Khung Chuẩn Một Bài Học (Unified Lesson Blueprint)
`[PLATFORM BUSINESS]`  
Mọi bài học trên IELTS Learning Platform phải tuân thủ cấu trúc khối chức năng đồng nhất:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      STANDARD LESSON WORKFLOW                          │
├────────────────────────────────────────────────────────────────────────┤
│ [BLOCK 1] Metadata & Learning Objectives (Mục tiêu & Yêu cầu đầu ra)   │
│ [BLOCK 2] Prerequisite Concept Check (Kiểm tra kiến thức tiên quyết)  │
│ [BLOCK 3] Core Strategy & Theory (Lý thuyết chiến lược trọng tâm)     │
│ [BLOCK 4] Interactive Annotated Exemplar (Ví dụ mẫu có chú giải)       │
│ [BLOCK 5] Guided Micro-Practice (Luyện tập có giàn giáo hỗ trợ)        │
│ [BLOCK 6] Independent Timed Drill (Luyện tập độc lập có bấm giờ)       │
│ [BLOCK 7] Automated Diagnostic Analysis (Phân tích chẩn đoán lỗi)      │
│ [BLOCK 8] Synthesis & Next Step Recommendation (Tổng kết & Đề xuất)    │
└────────────────────────────────────────────────────────────────────────┘
```

### 8.2. Danh Mục Các Khối Chức Năng Theo Kỹ Năng (Block Taxonomy)
`[PLATFORM BUSINESS]`

| Kỹ Năng | Thành Phần Khối Bắt Buộc | Dữ Liệu Cần Cung Cấp | Hoạt Động Người Học |
| :--- | :--- | :--- | :--- |
| **Listening** | Audio Player, Interactive Transcript, Signal Highlighter, Waveform Scrubbing. | File audio chuẩn MP3, timestamp đồng bộ, danh sách từ tín hiệu. | Gạch chân từ khóa câu hỏi, nghe audio, nhập đáp án, bấm vào transcript nghe lại. |
| **Reading** | Split-screen Passage View, Text Highlighter, Note-taking Pin. | Đoạn văn bản định dạng phong phú, tọa độ đoạn văn chứa bằng chứng. | Đọc văn bản, bôi sáng từ khóa, đối chiếu song song câu hỏi và bài đọc. |
| **Writing** | Prompt Breakdown Card, Outlining Workspace, Draft Editor, Criteria Rubric. | Đề bài, hình ảnh biểu đồ (Task 1), bài mẫu phân tích 2 band điểm. | Lập dàn ý theo khung, viết từng đoạn văn, tự kiểm tra danh sách kiểm lỗi. |
| **Speaking** | Cue Card Inspector, Note Pad (1 min timer), Voice Recorder, Audio Visualizer. | Chủ đề nói, audio mẫu phát âm chuẩn, danh sách cụm từ nối tư duy. | Chuẩn bị ghi chú, bấm ghi âm bài nói, nghe lại file ghi âm của chính mình. |

---

## 9. FEEDBACK & MISTAKE MANAGEMENT

### 9.1. Phân Loại Danh Mục Lỗi Hệ Thống (Mistake Taxonomy)
`[PLATFORM BUSINESS]`

```
┌────────────────────────────────────────────────────────────────────────┐
│                   MISTAKE TAXONOMY CLASSIFICATION                      │
├───────────┬────────────────────────────────────────────────────────────┤
│ Listening │ L1: Acoustic Misperception (Nghe nhầm âm tương tự)         │
│           │ L2: Spelling & Number Format (Sai chính tả, sai định dạng) │
│           │ L3: Distractor Trap (Mắc bẫy thông tin đổi ý)              │
│           │ L4: Paraphrase Mismatch (Không nhận diện từ đồng nghĩa)    │
├───────────┼────────────────────────────────────────────────────────────┤
│ Reading   │ R1: Evidence Locator Failure (Định vị sai đoạn văn)        │
│           │ R2: Extrapolation Trap (Suy diễn vượt quá nội dung bài đọc)│
│           │ R3: Vocabulary Confusion (Hiểu sai nghĩa từ vựng cốt lõi) │
│           │ R4: Scope Overgeneralization (Nhầm lẫn all/some/most)      │
├───────────┼────────────────────────────────────────────────────────────┤
│ Writing   │ W1: Prompt Under-development (Bỏ sót yêu cầu đề bài)       │
│           │ W2: Structural Disorganization (Thiếu câu chủ đề, lộn xộn) │
│           │ W3: Inappropriate Register (Dùng văn nói trong văn viết)   │
│           │ W4: Syntactic Fracture (Sai cấu trúc ngữ pháp câu phức)    │
├───────────┼────────────────────────────────────────────────────────────┤
│ Speaking  │ S1: Excessive Hesitation (Ngập ngừng tìm từ > 3 giây)      │
│           │ S2: Flat Monotone (Ngữ điệu đều đều thiếu tự nhiên)        │
│           │ S3: Consonant Cluster Dropping (Rơi phụ âm cuối /s/, /t/)  │
│           │ S4: Over-simplification (Toàn câu đơn thiếu mở rộng ý)     │
└───────────┴────────────────────────────────────────────────────────────┘
```

### 9.2. Quy Chuẩn Sổ Tay Ghi Nhận Lỗi (Mistake Notebook Architecture)
Mỗi lần học viên làm sai, hệ thống tự động sinh một bản ghi chi tiết:
```json
{
  "mistakeId": "mst-91024",
  "skill": "reading",
  "questionType": "true_false_not_given",
  "errorCategory": "R2_Extrapolation_Trap",
  "userAnswer": "TRUE",
  "correctAnswer": "NOT_GIVEN",
  "passageContext": "The company experimented with solar power in their northern facilities.",
  "questionText": "The solar energy experiment was deemed an economic success.",
  "rootCauseExplanation": "Bài đọc chỉ nói công ty thử nghiệm điện mặt trời, hoàn toàn không đề cập việc thử nghiệm đó thành công hay thất bại về mặt kinh tế. Học viên đã tự suy đoán rằng vì công ty thử nghiệm nên chắc chắn thành công.",
  "remedialActionUrl": "/app/practice/reading?drill=not_given_distinction"
}
```

### 9.3. Cơ Chế Phát Hiện Lỗi Lặp Lại (Systemic Recurring Error Engine)
`[PLATFORM BUSINESS]`  
Nếu một mã lỗi (ví dụ: `W4: Syntactic Fracture` hoặc `L2: Spelling`) xuất hiện từ **3 lần trở lên trong vòng 7 ngày**, hệ thống tự động kích hoạt **Cảnh Báo Lỗ Hổng Kiến Thức (Knowledge Deficit Alert)**:
* Tạm thời hạ mức ưu tiên của các bài luyện đề nâng cao.
* Đẩy 1 bài học mini (10 phút) chuyên sâu về khắc phục lỗi đó vào danh sách nhiệm vụ bắt buộc của ngày tiếp theo.

---

## 10. MASTERY & PROGRESSION RULES

### 10.1. Vòng Đời Trạng Thái Bài Học (Lesson Progression Lifecycle)
`[PLATFORM BUSINESS]`

```
┌──────────────┐     Học viên mở bài     ┌──────────────┐
│ NOT STARTED  │ ──────────────────────> │ IN PROGRESS  │
└──────────────┘                         └──────┬───────┘
                                                │ Hoàn thành các khối
                                                ▼
                                         ┌──────────────┐
                                         │  COMPLETED   │
                                         └──────┬───────┘
                   Tỷ lệ đúng < 80%             │ Đánh giá năng lực độc lập
         ┌──────────────────────────────────────┴──────────────────────────────────────┐
         ▼                                                                             ▼
┌──────────────────┐                                                         ┌──────────────────┐
│  NEEDS REVIEW    │ ◄────────── Lặp lại lỗi sau 14 ngày ─────────────────── │     MASTERED     │
└──────────────────┘                                                         └──────────────────┘
```

### 10.2. Tiêu Chí Đạt Cấp Độ Nắm Vững (Mastery Criteria)
`[INTERNAL PEDAGOGY]`  
Một bài học hoặc kỹ năng chỉ được chuyển sang trạng thái **Mastered** khi thỏa mãn đồng thời các điều kiện định lượng sau:

#### Đối với Kỹ Năng Thụ Cảm (Listening & Reading):
1. **Tỷ lệ chính xác tối thiểu:** Đạt $\ge 80\%$ trong bài tập độc lập (Independent Practice) ngay sau bài học.
2. **Kiểm chứng củng cố (Retention Test):** Trả lời đúng $\ge 80\%$ trong một bộ câu hỏi kiểm tra ngẫu nhiên cùng dạng bài sau đó tối thiểu 3 ngày.
3. **Tốc độ làm bài:** Thời gian hoàn thành trung bình không vượt quá $1.2 \times$ thời gian tiêu chuẩn quy định cho dạng bài đó.

#### Đối với Kỹ Năng Sản Sinh (Writing & Speaking):
1. **Đạt điểm tiêu chuẩn:** Bài viết hoặc bài nói được chấm đạt tất cả 4 tiêu chí $\ge B_{\text{target}} - 0.5$.
2. **Hoàn thành sửa đổi:** Đã nộp ít nhất một bản viết lại hoặc ghi âm lại giải quyết được các lỗi chính được chỉ ra ở bản đầu tiên.
3. **Không còn lỗi sơ đẳng:** Không còn tồn tại lỗi ngữ pháp hoặc phát âm cấp độ Foundation trong bài nộp gần nhất.

---

## 11. LEARNING PLAN INTEGRATION

### 11.1. Thuật Toán Phân Bổ Thời Gian Thích Ứng (Adaptive Time Budgeting)
`[PLATFORM BUSINESS]`  
Hệ thống tính toán tỷ trọng phân bổ thời gian học tập giữa 4 kỹ năng dựa trên độ lệch Band ($\Delta B_s = \max(0.5, B_{\text{target}, s} - B_{\text{current}, s})$) và kết quả làm bài gần nhất:

$$W_s = \frac{\Delta B_s \times M_s}{\sum_{i \in \{L, R, W, S\}} (\Delta B_i \times M_i)}$$

*Trong đó:*  
* $W_s$: Tỷ lệ thời gian phân bổ cho kỹ năng $s$ trong tuần học.
* $M_s$: Hệ số nhân độ khó ($M_L = 1.0, M_R = 1.0, M_W = 1.5, M_S = 1.4$). Kỹ năng sản sinh luôn cần nhiều thời gian nghiền ngẫm và luyện viết/nói hơn.

> [!IMPORTANT]
> **Quy Tắc Không Triệt Tiêu Kỹ Năng (Zero Skill Starvation Invariant):**  
> Dù học viên có chênh lệch band lớn đến mức nào (ví dụ: Reading 8.0 nhưng Writing 5.0), tỷ lệ thời gian của kỹ năng cao nhất **không bao giờ được nhỏ hơn 10%** tổng thời lượng tuần. Phải duy trì tối thiểu 1 buổi tiếp xúc nhẹ mỗi tuần để không bị thoái hóa phản xạ ngôn ngữ.

### 11.2. Thứ Tự Ưu Tiên Ra Quyết Định Của Learning Engine
`[PLATFORM BUSINESS]`  
Mỗi ngày khi học viên đăng nhập, công cụ đề xuất bài học (`adaptiveEngine`) quét qua danh sách chờ theo thứ tự ưu tiên nghiêm ngặt:
1. **Priority 1 (Khẩn Cấp):** Nhiệm vụ chữa lỗi lặp lại hệ thống (`Recurring Mistake Drill`) khi học viên mắc lỗi $\ge 3$ lần.
2. **Priority 2 (Trí Nhớ):** Các thẻ từ vựng Spaced Repetition đến hạn ôn tập trong ngày ($\ge 10$ thẻ đến hạn).
3. **Priority 3 (Tiến Độ Chính):** Bài học tiếp theo theo lộ trình của kỹ năng đang có khoảng cách Band lớn nhất.
4. **Priority 4 (Thực Hành Có Hướng Dẫn):** Bài luyện tập độc lập củng cố cho bài học của ngày hôm trước.
5. **Priority 5 (Đánh Giá Định Kỳ):** Bài Mini-test hoặc Full Mock Test khi hoàn thành một mốc kiến thức (Milestone).

---

## 12. EXAM TYPE & OFFICIAL IELTS ALIGNMENT

### 12.1. Phân Tách Nội Dung Academic vs General Training
`[IELTS OFFICIAL]` & `[PLATFORM BUSINESS]`

| Kỹ Năng | IELTS Academic | IELTS General Training | Cơ Chế Nền Tảng Áp Dụng |
| :--- | :--- | :--- | :--- |
| **Listening** | Cấu trúc giống nhau 100% | Cấu trúc giống nhau 100% | Sử dụng chung ngân hàng đề và bài học. |
| **Speaking** | Cấu trúc giống nhau 100% | Cấu trúc giống nhau 100% | Sử dụng chung ngân hàng đề và chủ đề. |
| **Reading** | 3 bài đọc dài mang tính khoa học, nghiên cứu, chuyên khảo. | Section 1-2 về đời sống thường ngày và công việc; Section 3 là văn bản dài. | **Bắt buộc phân nhánh ngân hàng bài đọc và câu hỏi riêng biệt theo `exam_type`.** |
| **Writing Task 1** | Báo cáo số liệu, biểu đồ, quy trình, bản đồ (Data Report). | Viết thư cá nhân hoặc công việc (Letter Writing). | **Bắt buộc tách biệt bài học và rubric chấm điểm riêng theo `exam_type`.** |
| **Writing Task 2** | Bài luận tranh luận học thuật (Academic Essay). | Bài luận xã hội (Essay có thể mang văn phong gần gũi hơn một chút). | Dùng chung các dạng đề bài luận cơ bản nhưng phân loại độ khó. |

### 12.2. Bảng Quy Chuẩn Điểm Nghe & Đọc (Official Raw Score Conversion)
`[IELTS OFFICIAL]`

| Số Câu Đúng (/40) | Listening Band | Reading (Academic) Band | Reading (General Training) Band |
| :---: | :---: | :---: | :---: |
| **39 – 40** | 9.0 | 9.0 | 9.0 |
| **37 – 38** | 8.5 | 8.5 | 8.5 |
| **35 – 36** | 8.0 | 8.0 | 8.0 |
| **32 – 34** | 7.5 | 7.5 | 7.5 |
| **30 – 31** | 7.0 | 7.0 | 6.0 |
| **26 – 29** | 6.5 | 6.5 | 5.5 |
| **23 – 25** | 6.0 | 6.0 | 5.0 |
| **18 – 22** | 5.5 | 5.5 | 4.5 |
| **16 – 17** | 5.0 | 5.0 | 4.0 |
| **13 – 15** | 4.5 | 4.5 | 3.5 |
| **10 – 12** | 4.0 | 4.0 | 3.0 |

---

## 13. CONTENT QUALITY RULES

### 13.1. Tiêu Chuẩn Thẩm Định Nội Dung Trước Khi Xuất Bản (Content QA Gateways)
`[PLATFORM BUSINESS]`  
Mọi tài liệu bài giảng, bộ đề thi thử và câu hỏi trong ngân hàng dữ liệu phải vượt qua 5 cổng kiểm soát chất lượng nghiêm ngặt:
1. **Tính Nhất Quán Audio - Transcript (Listening):** 100% câu từ trong audio phải khớp hoàn toàn từng chữ với file Transcript, có gắn nhãn mốc thời gian chính xác đến từng mili-giây.
2. **Tính Hợp Lệ Của Bằng Chứng (Reading):** Mỗi câu hỏi trắc nghiệm hoặc điền từ phải có duy nhất một đoạn văn bản làm bằng chứng (Single Verified Evidence Span), loại trừ hoàn toàn các câu hỏi đa nghĩa gây tranh cãi.
3. **Độ Chuẩn Xác Của Đáp Án (Answer Key Rigor):** Đối với câu hỏi điền từ, hệ thống phải liệt kê đầy đủ các biến thể chấp nhận được (ví dụ: *spelling variants*: `colour / color`, `theatre / theater`, `two / 2`).
4. **Tính Trung Lập & Phi Định Kiến:** Nội dung bài đọc và bài nghe không chứa các thông tin mang tính thù địch, phân biệt chủng tộc, tôn giáo, hoặc vi phạm bản quyền thương hiệu.
5. **Độ Rõ Ràng Của Hình Ảnh Biểu Đồ (Writing Task 1):** Số liệu trên biểu đồ phải được render vector sắc nét, nhãn trục tọa độ rõ ràng, tỷ lệ phần trăm cộng lại trong Pie Chart phải đủ 100%.

### 13.2. Quy Tắc Ứng Xử Của AI Chấm Thi (AI Evaluator Guardrails)
`[PLATFORM BUSINESS]`
* **Cấm Bịa Đặt Điểm Số (No Hallucinated Scores):** Khi học viên nộp bài văn ngắn dưới 100 từ (Task 2) hoặc ghi âm Speaking dưới 30 giây, AI không được tự ý chấm điểm Band 6.0 hay 7.0 mà phải từ chối đánh giá kèm thông báo: *"Dung lượng bài làm chưa đủ độ dài tối thiểu để tiến hành khảo thí học thuật."*
* **Cấm Nhận Xét Chung Chung (No Vague Feedback):** Nghiêm cấm các câu nhận xét sáo rỗng như *"Your vocabulary is good but needs improvement"*. Nhận xét phải chỉ rõ: *"Học viên lặp lại động từ 'increase' 5 lần trong đoạn 2; đề xuất thay thế bằng 'surge', 'climb steadily', 'experience an upward trend'."*

---

## 14. DOCUMENT GOVERNANCE & OPEN QUESTIONS

### 14.1. Nhật Ký Thay Đổi Tài Liệu (Change Log)

| Phiên Bản | Ngày Cập Nhật | Người Phụ Trách | Tóm Tắt Nội Dung Cập Nhật |
| :---: | :---: | :--- | :--- |
| `1.0.0` | 2026-11-13 | Antigravity AI & Academic Lead | Khởi tạo tài liệu quy chuẩn phương pháp học tập 4 kỹ năng IELTS toàn diện. |

### 14.2. Câu Hỏi Mở Cần Chuyên Gia Học Thuật Xác Nhận (Open Academic Questions)
Trước khi đóng băng cấu hình production, các chuyên gia khảo thí IELTS cần phản hồi và xác nhận các nội dung sau:
1. **Ngưỡng chấm điểm phát âm tự động:** Có nên tích hợp công cụ nhận diện IPA chi tiết đến từng phụ âm gió cho học viên trình độ Foundation hay chỉ giới hạn ở mức độ đánh giá độ trôi chảy (Fluency) và ngắt nhịp (Chunking)?
2. **Quy tắc làm tròn điểm ước lượng Writing & Speaking của AI:** Hiện tại hệ thống đang làm tròn điểm theo bước nhảy 0.5 Band (như kỳ thi thật). Có nên hiển thị điểm thập phân chi tiết (ví dụ: 6.25 hay 6.75) trong quá trình luyện tập để học viên thấy rõ tiến bộ vi mô hay không?
3. **Trọng số phạt thời gian trong Practice Mode:** Khi học viên làm bài Reading vượt quá thời gian tiêu chuẩn 20 phút/passage, có nên trừ điểm ước lượng hay chỉ hiển thị cảnh báo tốc độ đọc chậm?

---
*Tài liệu này là tài sản sở hữu trí tuệ và kim chỉ nam học thuật của IELTS Learning Platform. Mọi thay đổi về mặt nghiệp vụ phải thông qua sự phê duyệt của Hội Đồng Học Thuật & Trưởng Ban Kiến Trúc Hệ Thống.*
