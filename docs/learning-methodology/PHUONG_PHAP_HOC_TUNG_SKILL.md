# ĐẶC TẢ PHƯƠNG PHÁP HỌC TẬP TỪNG KỸ NĂNG IELTS
## Hệ thống IELTS Learning Platform — Educational Architecture Specification

> **Mã tài liệu:** `DOC-EDU-METHODOLOGY-01`  
> **Phiên bản:** `2.0.0`  
> **Trạng thái:** Đặc tả quy chuẩn sư phạm và nghiệp vụ chính thức (Official Educational Specification)  
> **Phạm vi áp dụng:** Toàn bộ phân hệ học thuật, thuật toán thích ứng, ngân hàng đề thi và trợ lý AI của IELTS Learning Platform  
> **Đối tượng sử dụng:** Đội ngũ Thiết kế Chương trình (Curriculum Designers), Kỹ sư Phát triển Hệ thống (Software Engineers), Chuyên gia Khảo thí (Assessment Specialists), AI Prompt Engineers

---

## MỤC LỤC TỔNG QUAN

1. [Triết Lý Sư Phạm & Khung Kiến Trúc Tổng Thể](#1-triết-lý-sư-phạm--khung-kiến-trúc-tổng-thể)
2. [Khảo Sát Năng Lực Đầu Vào & Cá Nhân Hóa Lộ Trình](#2-khảo-sát-năng-lực-đầu-vào--cá-nhân-hóa-lộ-trình)
3. [Phương Pháp Học Kỹ Năng Nghe (Listening Methodology)](#3-phương-pháp-học-kỹ-năng-nghe-listening-methodology)
4. [Phương Pháp Học Kỹ Năng Đọc (Reading Methodology)](#4-phương-pháp-học-kỹ-năng-đọc-reading-methodology)
5. [Phương Pháp Học Kỹ Năng Viết (Writing Methodology)](#5-phương-pháp-học-kỹ-năng-viết-writing-methodology)
6. [Phương Pháp Học Kỹ Năng Nói (Speaking Methodology)](#6-phương-pháp-học-kỹ-năng-nói-speaking-methodology)
7. [Động Cơ Từ Vựng Trung Tâm & Thuật Toán Spaced Repetition (Vocabulary Engine)](#7-động-cơ-từ-vựng-trung-tâm--thuật-toán-spaced-repetition-vocabulary-engine)
8. [Hệ Thống Học Thích Ứng & Phân Định Trách Nhiệm AI (Adaptive Learning Engine)](#8-hệ-thống-học-thích-ứng--phân-định-trách-nhiệm-ai-adaptive-learning-engine)
9. [Theo Dõi Tiến Bộ, Thi Thử Mô Phỏng CDI & Tương Thích Dữ Liệu](#9-theo-dõi-tiến-bộ-thi-thử-mô-phỏng-cdi--tương-thích-dữ-liệu)
10. [Bảng Tổng Hợp Quy Chuẩn Nghiệp Vụ & Tham Số Cấu Hình](#10-bảng-tổng-hợp-quy-chuẩn-nghiệp-vụ--tham-số-cấu-hình)

---

## 1. TRIẾT LÝ SƯ PHẠM & KHUNG KIẾN TRÚC TỔNG THỂ

### 1.1. Nguyên Tắc Học Song Song Bốn Kỹ Năng (Parallel Skill Acquisition)

Khác với các phương pháp truyền thống học tách rời từng kỹ năng (học hết Nghe - Đọc mới sang Viết - Nói), IELTS Learning Platform vận hành theo nguyên lý **Thụ cảm và Sản sinh đan xen (Receptive-Productive Symbiosis)**:

```
                  ┌────────────────────────────────────────┐
                  │    TỪ VỰNG HỌC THUẬT & NGỮ PHÁP LÕI   │
                  │    (Central Lexical-Grammar Spine)     │
                  └──────────────────┬─────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌──────────────────┐                                   ┌──────────────────┐
│   KỸ NĂNG NGHE   │ ──────── Paraphrase Mapping ────> │   KỸ NĂNG ĐỌC    │
│  (Receptive-Oral)│ <─────── Lexical Resonance ────── │ (Receptive-Visual│
└────────┬─────────┘                                   └────────┬─────────┘
         │                                                      │
         │ Contextual Priming                  Rhetorical Scaffolding
         ▼                                                      ▼
┌──────────────────┐                                   ┌──────────────────┐
│   KỸ NĂNG NÓI    │ ◄────── Active Collocations ───── │   KỸ NĂNG VIẾT   │
│(Productive-Oral) │ ────── Fluency Consolidation ───> │(Productive-Text) │
└──────────────────┘                                   └──────────────────┘
```

* **Từ vựng làm trục xương sống (Lexical Core Spine):** Một đơn vị từ vựng (Unit Lexeme) hoặc cấu trúc ngữ pháp sau khi được học ở dạng thụ cảm trong bài Đọc/Nghe sẽ ngay lập tức được kích hoạt vào ngân hàng từ chủ động để người học sử dụng trong Viết và Nói.
* **Định lượng thay vì ngẫu nhiên:** Mọi đề xuất học tập đều dựa trên bằng chứng dữ liệu (Data-driven Learning), không phỏng đoán, không dựa trên cảm tính.
* **Tôn trọng tải nhận thức (Cognitive Load Theory):** Bài học được chia thành các đơn vị Micro-learning (15–25 phút), đảm bảo người học duy trì sự tập trung tối đa mà không bị quá tải thông tin.

### 1.2. Ba Trụ Cột Triển Khai Hệ Thống

Tài liệu này phân định rạch ròi ba nhóm quy chuẩn trong toàn bộ giải pháp:
1. **Phương pháp Sư phạm (Pedagogical Principles):** Khung lý thuyết ngôn ngữ học ứng dụng (SLA - Second Language Acquisition), quy trình tư duy, chiến lược làm bài và kỹ thuật tự đánh giá.
2. **Quy tắc Nghiệp vụ Bắt buộc (Mandatory Business Rules):** Các điều kiện logic, ràng buộc dữ liệu, quy tắc chuyển trạng thái mà hệ sinh thái phần mềm phải thực thi chính xác.
3. **Tham số Cấu hình (Configurable System Parameters):** Các trọng số số học, ngưỡng thời gian, tỷ lệ ngẫu nhiên có thể tinh chỉnh tại [`src/services/learningRules/config.ts`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/config.ts) mà không làm thay đổi logic nền tảng.

---

## 2. KHẢO SÁT NĂNG LỰC ĐẦU VÀO & CÁ NHÂN HÓA LỘ TRÌNH

### 2.1. Cấu Trúc Bài Kiểm Tra Đầu Vào (Diagnostic Placement Test)

Bài kiểm tra năng lực đầu vào không chỉ đưa ra một con số ước lượng tổng quan, mà phân tích phổ điểm chi tiết theo 4 kỹ năng:
* **Listening Diagnostic:** 20 câu hỏi đại diện cho 4 Parts với độ khó tăng dần từ CEFR B1 đến C1 (thời lượng 18 phút).
* **Reading Diagnostic:** 20 câu hỏi trích từ 3 bài đọc với các dạng điển hình (Matching Headings, True/False/Not Given, Completion) (thời lượng 25 phút).
* **Writing Diagnostic:** Phân tích một đoạn văn ngắn Task 1 (tổng hợp số liệu) và một bài viết luận 200 từ Task 2 nhằm đo lường khả năng lập luận, ngữ pháp cơ bản và vốn từ.
* **Speaking Diagnostic:** 3 câu hỏi Part 1, 1 chủ đề Part 2 (chuẩn bị 1 phút, nói 1 phút) và 2 câu hỏi mở rộng Part 3 ghi âm trực tiếp.

### 2.2. Ma Trận Hiệu Chuẩn Lộ Trình (Curriculum Calibration Matrix)

Lộ trình đào tạo được tính toán dựa trên bốn biến đầu vào bắt buộc:
1. **Điểm hiện tại ($B_{\text{current}}$):** Kết quả từ Placement Test hoặc điểm thi thật gần nhất không quá 3 tháng.
2. **Điểm mục tiêu ($B_{\text{target}}$):** Điểm Overall mong muốn cùng mức điểm sàn tối thiểu cho từng kỹ năng (No band under X).
3. **Thời gian còn lại ($T_{\text{days}}$):** Số ngày thực tế tính từ thời điểm hiện tại đến ngày thi dự kiến.
4. **Quỹ thời gian học mỗi ngày ($H_{\text{daily}}$):** Thời lượng cam kết (30, 45, 60 hoặc 90 phút/ngày).

$$\text{Tổng giờ học cần thiết } (G) = \sum_{s \in \{\text{L, R, W, S}\}} \max\left(0, B_{\text{target}, s} - B_{\text{current}, s}\right) \times K_s$$

*Trong đó hệ số tiêu chuẩn kinh nghiệm quốc tế (Cambridge Assessment English Benchmark):*
* Kỹ năng thụ cảm (Listening, Reading): $K_L = K_R = 80\text{ giờ}$ cho mỗi nấc tăng 0.5 Band.
* Kỹ năng sản sinh (Writing, Speaking): $K_W = K_S = 120\text{ giờ}$ cho mỗi nấc tăng 0.5 Band.

> [!IMPORTANT]
> **Quy tắc Chống Ảo Tưởng Tiến Độ (No False Timeline Guarantee):**  
> Hệ thống **tuyệt đối không đưa ra cam kết chắc chắn 100%** về thời gian tăng band (ví dụ: cấm tuyên bố *"Tăng 1.5 Band sau 30 ngày"*). Khi $\frac{G}{T_{\text{days}} \times (H_{\text{daily}} / 60)} > 1.25$, hệ thống phải phát cảnh báo hiện thực hóa kỳ vọng: Yêu cầu tăng thời gian học hàng ngày hoặc lùi ngày thi dự kiến để đảm bảo đạt khối lượng kiến thức chuẩn.

---

## 3. PHƯƠNG PHÁP HỌC KỸ NĂNG NGHE (LISTENING METHODOLOGY)

### 3.1. Các Tầng Luyện Nghe Chủ Động (Active Listening Hierarchy)

```
[ Tầng 4: Shadowing ] ────── Phản xạ cơ miệng, bắt chước ngữ điệu, nối âm chuẩn
         │
[ Tầng 3: Dictation ] ────── Nhận diện chính tả, hình vị, âm đuôi (-s, -ed), mạo từ
         │
[ Tầng 2: Intensive ] ────── Bắt từ khóa, định vị paraphrase, giải mã bẫy thông tin
         │
[ Tầng 1: Extensive ] ────── Nắm bắt bức tranh tổng quan, ngữ cảnh, thái độ người nói
```

1. **Nghe Tổng Quát (Extensive Listening):** Nghe toàn bộ audio ở tốc độ tự nhiên mà không đọc transcript. Mục tiêu xác định: Ai đang nói? Ngữ cảnh là gì (hội thoại thường nhật, đặt phòng khách sạn, phỏng vấn xin việc hay giảng bài đại học)? Ý định chính của người nói là gì?
2. **Nghe Chi Tiết (Intensive Listening):** Nghe từng đoạn hẹp liên quan trực tiếp đến câu hỏi bài thi. Phân tích cách người ra đề cài cắm thông tin gây nhiễu (Distractors) và cấu trúc hoán vị từ (Paraphrase).
3. **Chép Chính Tả (Dictation):** Áp dụng cho các phân đoạn 10–20 giây có mật độ thông tin học thuật cao hoặc phát âm phức tạp. Rèn luyện sự nhạy bén đối với các âm yếu (Weak forms), biến âm, trợ động từ và mạo từ.
4. **Đọc Nhại (Shadowing):** Người học nghe và nói nhại theo người bản xứ với độ trễ 0.5–1 giây. Đây là cây cầu kết nối trực tiếp phản xạ âm thanh của Listening sang ngữ điệu tự nhiên của Speaking.

### 3.2. Quy Trình Làm Bài 4 Bước Chuẩn Khảo Thí

| Bước | Hành động | Kỹ thuật trọng tâm & Lưu ý sống còn |
| :---: | :--- | :--- |
| **B1** | **Chuẩn bị trước khi nghe** *(Pre-Listening)* | Tận dụng triệt để 30–45 giây trước mỗi section: Đọc lướt chỉ dẫn số lượng từ cho phép (e.g., *NO MORE THAN TWO WORDS AND/OR A NUMBER*). Khoanh vùng từ khóa không thể thay thế (Tên riêng, năm, thuật ngữ chuyên ngành) và từ khóa có thể bị biến đổi (Động từ, tính từ). |
| **B2** | **Dự đoán đáp án** *(Prediction)* | Xác định loại từ cần điền (danh từ, động từ, tính từ, con số, mã bưu chính). Dự đoán trường nghĩa logic của ô trống (ví dụ: sau giới từ *in* cần một địa điểm hoặc một mốc thời gian). |
| **B3** | **Nghe & Bắt điểm rơi** *(Active Tracking)* | Giữ mắt nhìn trước 1–2 câu hỏi so với đoạn đang nghe để không bị lỡ nhịp. Đặt bút chì/con trỏ chuột tại vị trí câu hiện tại. Cảnh giác cao độ với các liên từ chuyển hướng: *However, Actually, But, Whereas, On second thought*. |
| **B4** | **Hậu kiểm tra** *(Post-Listening Audit)* | Kiểm tra tính chuẩn xác của ngữ pháp câu sau khi điền (sự hòa hợp chủ-vị). Soát lỗi chính tả từng chữ cái và đặc biệt là **danh từ số ít / số nhiều (-s / -es)**. |

### 3.3. Chiến Lược Cho Từng Dạng Bài Điển Hình

* **Form / Note / Table Completion (Part 1 & 4):**
  * Đánh dấu giới hạn từ.
  * Phân biệt cách phát âm các cặp số dễ nhầm: *teen* (/tiːn/ - nhấn âm 2) vs *ty* (/ti/ - nhấn âm 1).
  * Quy tắc đánh vần tên riêng quốc tế và ký tự kép (*double L*, *zero/oh*).
* **Multiple Choice (Part 2 & 3):**
  * Tuyệt đối không chăm chú nghe từ giống hệt trong phương án (đây thường là bẫy lặp từ - Word Spotting Trap).
  * Tìm câu trả lời tương đương về mặt ý nghĩa, được diễn đạt bằng tập hợp từ vựng hoàn toàn khác.
* **Map / Plan / Diagram Labelling (Part 2):**
  * Định vị ngay điểm xuất phát (*You are here*, *Starting point*, *Main entrance*).
  * Nắm vững từ vựng phương hướng: *clockwise, anticlockwise, adjacent to, opposite, corridor, intersection, bend*.
* **Matching Information (Part 3):**
  * Theo dõi sự biến đổi quan điểm giữa hai hay nhiều nhân vật (sự đồng thuận hoặc bác bỏ ý kiến của nhau).

### 3.4. Khung Phân Tích Căn Nguyên Lỗi Sai (Listening Error Root Cause Taxonomy)

Khi trả lời sai một câu Listening, hệ thống yêu cầu phân loại lỗi vào đúng 1 trong 4 nhóm căn nguyên:

```
                      CĂN NGUYÊN LỖI NGHE
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼                       ▼
[ ÂM THANH - NGỮ ÂM ]   [ VỐN TỪ VỰNG ]         [ BẪY KHẢO THÍ ]        [ QUẢN TRỊ TẬP TRUNG ]
- Nối âm (linking)      - Từ vựng hoàn toàn mới  - Bẫy tự sửa (Correction) - Mất tập trung 2-3s
- Nuốt âm (elision)     - Biết từ ở dạng đọc,   - Thông tin gây nhiễu   - Chưa đọc kịp câu hỏi
- Trọng âm / Âm đuôi    nhưng không nhận diện   - Suy diễn ngoài bài    - Kẹt lại ở câu trước
- Giảm âm (weak form)   được qua phát âm thực
```

> [!TIP]
> **Quy tắc Tăng Độ Khó Động:**  
> Hệ thống không tăng độ khó bài tập chỉ dựa trên số lượng bài học sinh đã bấm "Hoàn thành". Độ khó chỉ được nâng bậc khi:
> 1. Tỷ lệ chính xác trung bình của 3 bài gần nhất $\ge 80\%$.
> 2. Lỗi thuộc nhóm *Âm thanh - Ngữ âm* giảm dưới 15% tổng số lỗi sai.

---

## 4. PHƯƠNG PHÁP HỌC KỸ NĂNG ĐỌC (READING METHODOLOGY)

### 4.1. Bộ Kỹ Thuật Đọc Chiến Lược

1. **Skimming (Đọc lướt tìm ý chính):** Đọc với tốc độ 300–400 từ/phút để nắm cấu trúc bài, mục đích của tác giả và thông điệp trọng tâm của từng đoạn văn. Đọc kỹ câu chủ đề (thường nằm ở đầu hoặc cuối đoạn).
2. **Scanning (Đọc quét tìm dữ kiện cụ thể):** Di chuyển mắt tìm kiếm các neo thị giác (Visual Anchors): Chữ số, năm, tên người viết hoa, địa danh hoặc các thuật ngữ chuyên ngành đã xác định trong câu hỏi.
3. **Paragraph Structural Reading (Đọc theo cấu trúc phân tầng):** Nhận diện cách thức tác giả tổ chức lập luận:
   * *Problem - Solution* (Vấn đề - Giải pháp).
   * *Cause - Effect* (Nguyên nhân - Hệ quả).
   * *Chronological Order* (Trình tự thời gian lịch sử).
   * *Claim - Counter-claim* (Quan điểm - Luận điểm phản biện).
4. **Synonym & Paraphrase Mapping (Lập bản đồ từ đồng nghĩa):** Mọi câu hỏi Reading thực chất là một phương trình từ đồng nghĩa:

$$\text{Từ khóa trong câu hỏi} \iff \text{Bằng chứng tương đương trong bài đọc}$$

*Ví dụ thực tế:*
* *Câu hỏi:* The company decided to **curtail** its expenditure on public relations.
* *Bài đọc:* The board made a resolution to **scale back** spending on media campaigns.
* $\implies \text{Mapping: } \text{curtail} \equiv \text{scale back} \quad | \quad \text{expenditure} \equiv \text{spending}$.

### 4.2. Khung Phân Biệt Tuyệt Đối True / False / Not Given & Yes / No / Not Given

Nhiều người học mất điểm nặng nề do nhầm lẫn giữa sự mâu thuẫn thông tin và sự thiếu vắng bằng chứng. Hệ thống thiết lập ma trận logic bất biến:

| Trạng thái | Định nghĩa Logic Khảo Thí | Bằng chứng bài đọc yêu cầu | Thao tác kiểm chứng ngược |
| :---: | :--- | :--- | :--- |
| **TRUE / YES** | Thông tin trong câu hỏi **hoàn toàn trùng khớp và đồng thuận** với ý của bài đọc. | Tìm thấy từ đồng nghĩa hoặc cấu trúc diễn đạt tương đương 100% về mặt bản chất thông tin. | Khẳng định của câu hỏi là hệ quả trực tiếp từ văn bản. |
| **FALSE / NO** | Thông tin trong câu hỏi **trực tiếp mâu thuẫn, phủ định hoặc trái ngược** với bài đọc. | Bài đọc đưa ra thông tin đối lập rõ ràng (ví dụ: câu hỏi nói *tăng*, bài đọc nói *giảm* hoặc *giữ nguyên*). | Nếu câu hỏi là Đúng, bài đọc sẽ trở thành phi lý. |
| **NOT GIVEN** | Bài đọc **không có đủ thông tin** để xác nhận câu hỏi là Đúng hay Sai. Tác giả không đề cập hoặc chỉ đề cập một phần nhưng thiếu dữ kiện then chốt. | Có thể xuất hiện một số từ khóa trong bài, nhưng mối liên hệ logic giữa các từ khóa không được văn bản khẳng định. | Dù câu hỏi có đúng trong thực tế đời sống nhưng nếu bài đọc không nói thì vẫn là **NOT GIVEN**. |

> [!WARNING]
> **Quy tắc Nghiệp Vụ Chống Phỏng Đoán Đời Thực:**  
> Đề thi IELTS Reading chỉ kiểm tra khả năng đọc hiểu văn bản, không kiểm tra kiến thức khoa học thường thức. Nếu một dữ kiện là chân lý khoa học ngoài đời nhưng văn bản không đề cập, đáp án bắt buộc phải là **NOT GIVEN**.

### 4.3. Chiến Lược Cho Các Dạng Đọc Chuyên Biệt

* **Matching Headings:**
  * Luôn làm dạng này **trước tiên** cho đoạn văn đó để tận dụng lần đọc hiểu cấu trúc tổng thể.
  * Đọc câu chủ đề, lướt các câu hỗ trợ, cảnh giác với các từ nối tương phản (*However, But, In spite of*) làm đảo ngược ý của cả đoạn.
  * Gạch bỏ các tiêu đề đã chọn chắc chắn để thu hẹp phạm vi cho các đoạn sau.
* **Matching Information (Which paragraph contains...):**
  * Nên làm dạng này **sau cùng** vì đây là dạng tìm dữ kiện chi tiết rải rác. Khi đã làm các câu hỏi khác, người học đã quen với bài đọc và định vị nhanh hơn.
* **Summary / Sentence Completion:**
  * Phân tích ngữ pháp của chỗ trống (Cần danh từ đếm được hay không đếm được? Cần động từ nguyên thể hay phân từ?).
  * Từ cần điền phải lấy **nguyên văn (Exact words from the passage)**, không được tự ý biến đổi dạng từ hoặc sửa ngữ pháp của từ gốc.

### 4.4. Quy Tắc Quản Trị Thời Gian & Phân Phối Năng Lượng

Quy chuẩn tham khảo tiêu chuẩn cho 60 phút thi Reading:
* **Passage 1 (Độ khó 1/3):** Tối đa **17 phút** (Đảm bảo độ chính xác $\ge 90\%$).
* **Passage 2 (Độ khó 2/3):** Tối đa **20 phút**.
* **Passage 3 (Độ khó 3/3):** Dành **23 phút** (Nhiều câu hỏi trừu tượng, lập luận phức tạp).

Hệ thống theo dõi thời gian dừng lại trên từng câu hỏi (*Time per question*). Nếu một câu hỏi vượt quá **90 giây**, hệ thống kích hoạt gợi ý chiến thuật: *"Đánh dấu phân vân, chọn đáp án dự đoán khả dĩ nhất và chuyển sang câu tiếp theo để bảo toàn nhịp độ thi cử."*

---

## 5. PHƯƠNG PHÁP HỌC KỸ NĂNG VIẾT (WRITING METHODOLOGY)

### 5.1. Task 1 Academic: Báo Cáo Phân Tích Dữ Liệu & Quy Trình

#### Cấu Trúc Bốn Phần Chuẩn Mực

```
┌────────────────────────────────────────────────────────┐
│ ĐOẠN 1: INTRODUCTION (1-2 câu)                         │
│ Paraphrase lại đề bài bằng cấu trúc và từ vựng mới      │
├────────────────────────────────────────────────────────┤
│ ĐOẠN 2: OVERVIEW (2-3 câu) - TRÁI TIM CỦA TASK 1       │
│ Nêu 2-3 đặc điểm nổi bật nhất (Xu hướng chính,         │
│ điểm cao nhất/thấp nhất, thay đổi đột phá).             │
│ TUYỆT ĐỐI KHÔNG ĐƯA SỐ LIỆU CỤ THỂ VÀO OVERVIEW.       │
├────────────────────────────────────────────────────────┤
│ ĐOẠN 3: BODY PARAGRAPH 1 (3-4 câu)                     │
│ Nhóm dữ liệu logic 1 (theo đối tượng hoặc thời gian)   │
│ Có dẫn chứng số liệu, đơn vị, so sánh tương quan       │
├────────────────────────────────────────────────────────┤
│ ĐOẠN 4: BODY PARAGRAPH 2 (3-4 câu)                     │
│ Nhóm dữ liệu logic 2                                   │
│ Làm nổi bật sự tương phản hoặc tương đồng              │
└────────────────────────────────────────────────────────┘
```

#### Phương Pháp Phân Nhóm Theo Dạng Đồ Thị
1. **Đồ thị có yếu tố thời gian (Dynamic Data - Line Graph, Bar Chart theo năm):**
   * Tiêu điểm: Xu hướng biến động (*increase, decline, fluctuate, plateau, peak*), tốc độ biến động (*dramatically, marginally, steadily*).
2. **Đồ thị không có yếu tố thời gian (Static Data - Pie Chart, Table một thời điểm):**
   * Tiêu điểm: So sánh tỷ trọng, thứ hạng cao nhất/thấp nhất, chênh lệch tương đối (*in stark contrast to, twice as high as, accounted for the lion's share*).
3. **Bản đồ (Maps - So sánh quy hoạch qua các năm):**
   * Tiêu điểm: Mở rộng (*expanded, extended*), phá dỡ (*demolished, knocked down*), thay thế (*replaced by, converted into*), di dời (*relocated*), giữ nguyên (*remained intact*).
4. **Quy trình (Process Diagrams - Tự nhiên hoặc Nhân tạo):**
   * Tiêu điểm: Phân biệt quy trình nhân tạo (sử dụng thể bị động *Passive Voice* và ngôn ngữ tuần tự *Initially, Subsequently, At the subsequent stage*) và chu trình sinh học tự nhiên (sử dụng thể chủ động *Active Voice* cho vòng đời sinh trưởng).

### 5.2. Task 2: Cấu Trúc Luận Điểm Bốn Đoạn Cân Bằng (Balanced Essay Structure)

```
ĐOẠN 1: MỞ BÀI (Introduction - ~40 từ)
├── Câu 1: Hook / Background statement (Dẫn nhập chủ đề bằng cách paraphrase đề bài)
└── Câu 2: Thesis Statement (Tuyên bố rõ ràng quan điểm cá nhân và định hướng bài viết)

ĐOẠN 2: THÂN BÀI 1 (Body 1 - ~90-100 từ)
├── Câu 1: Topic Sentence (Nêu luận điểm chính 1 của đoạn)
├── Câu 2-3: Explanation (Giải thích cơ chế logic: Tại sao điều đó xảy ra? Hệ quả là gì?)
└── Câu 4-5: Example & Evidence (Đưa ví dụ minh họa cụ thể, thực tế hoặc kịch bản điển hình)

ĐOẠN 3: THÂN BÀI 2 (Body 2 - ~90-100 từ)
├── Câu 1: Topic Sentence (Nêu luận điểm chính 2 hoặc góc nhìn đối chiếu)
├── Câu 2-3: Explanation (Phân tích chi tiết chuỗi nhân quả)
└── Câu 4-5: Example & Rebuttal (Ví dụ minh họa và củng cố cho Thesis Statement)

ĐOẠN 4: KẾT BÀI (Conclusion - ~35-40 từ)
├── Câu 1: Restatement of Thesis (Khẳng định lại lập trường bằng ngôn từ mới)
└── Câu 2: Final Thought / Synthesis (Đúc kết tổng thể, không đưa ý tưởng mới vào kết bài)
```

### 5.3. Bốn Tiêu Chí Chấm Điểm Chính Thức Của Giám Khảo (Assessment Rubrics)

Hệ thống chấm điểm AI và phản hồi của giảng viên bắt buộc phân tích độc lập theo 4 tiêu chí của British Council / IDP:

| Tiêu chí | Trọng tâm đánh giá | Lỗi chí mạng thường gặp |
| :--- | :--- | :--- |
| **Task Achievement (T1) / Task Response (T2)** | Trả lời đầy đủ tất cả các vế của đề bài; có Overview rõ ràng (T1); lập trường nhất quán xuyên suốt bài (T2); luận điểm được phát triển có chiều sâu. | Thiếu Overview trong Task 1 (tối đa Band 5.0 TA); lạc đề; nêu quan điểm mập mờ hoặc đổi ý giữa bài; chỉ liệt kê ý mà không giải thích. |
| **Coherence & Cohesion (CC)** | Bố cục đoạn mạch lạc; dòng chảy lập luận tự nhiên; sử dụng từ nối linh hoạt, chính xác; phép quy chiếu (*referencing - this, these, such*) tốt. | Lạm dụng từ nối cơ học (*First, Second, Furthermore* ở đầu mọi câu); ngắt đoạn tùy tiện; dùng sai đại từ thay thế gây hiểu nhầm. |
| **Lexical Resource (LR)** | Vốn từ vựng học thuật phong phú; độ chính xác ngữ cảnh cao; sử dụng tự nhiên các cụm collocations ít phổ biến; biến đổi word family linh hoạt. | Học vẹt từ hoa mỹ ("từ khủng") nhưng đặt sai ngữ cảnh; sai chính tả; lặp đi lặp lại một từ vựng; dùng sai giới từ đi kèm collocation. |
| **Grammatical Range & Accuracy (GRA)** | Kết hợp nhuần nhuyễn giữa câu đơn, câu ghép và câu phức; sử dụng đa dạng cấu trúc (mệnh đề quan hệ, đảo ngữ, câu điều kiện, thể bị động); kiểm soát tốt dấu câu và thì. | Chỉ viết toàn câu đơn hoặc viết câu quá dài dẫn đến mất kiểm soát cấu trúc; sai lỗi cơ bản liên tục (chia động từ, mạo từ *a/an/the*). |

### 5.4. Vòng Lặp Phản Hồi Chẩn Đoán & Tái Viết (Diagnostic Feedback & Revision Loop)

```
[ 1. Soạn thảo bản nháp ] ──> [ 2. Phân tích AI & Chấm điểm 4 tiêu chí ]
                                            │
                                            ▼
[ 4. Hoàn thiện bài viết ] <── [ 3. Bóc tách lỗi sai theo 4 màu ]
   (Target Rewrite)             - Lỗi Ngữ pháp (Grammar Flags)
                                - Lỗi Dùng từ (Collocation Errors)
                                - Lỗi Lập luận (Logic Gaps)
                                - Đề xuất Paraphrase Band cao
```

> [!IMPORTANT]
> **Quy Tắc Nghiêm Cấm Học Thuộc Bản Mẫu (Anti-Rote Template Mandate):**  
> Các bộ khung bài viết (Templates) trong hệ thống chỉ đóng vai trò giàn giáo cấu trúc (Structural Scaffolding) hỗ trợ định hình tư duy. Hệ thống **tuyệt đối không cho phép** người học học vẹt các đoạn văn khuôn sáo vô nghĩa (ví dụ: *"This issue has sparked heated debate among scholars and laymen alike since time immemorial..."*). Giám khảo IELTS quốc tế sẽ ngay lập tức trừ điểm Task Response và Lexical Resource đối với bài viết chứa các câu rập khuôn học thuộc.

---

## 6. PHƯƠNG PHÁP HỌC KỸ NĂNG NÓI (SPEAKING METHODOLOGY)

### 6.1. Phương Pháp Luận Cho Từng Phần Thi

#### Part 1: Giao Tiếp Tự Nhiên Theo Mô Hình ARE
Các chủ đề đời thường (sở thích, quê hương, công việc, thói quen). Độ dài lý tưởng: 3–4 câu hoàn chỉnh (khoảng 15–20 giây/câu).
* **A - Answer:** Trả lời trực tiếp vào trọng tâm câu hỏi.
* **R - Reason:** Đưa ra lý do giải thích vì sao lại như vậy.
* **E - Example / Elaboration:** Bổ sung ví dụ thực tế hoặc cảm xúc cá nhân.
* *Ví dụ minh họa:*
  * *Hỏi:* Do you prefer reading physical books or e-books?
  * *Trả lời:* Personally, I definitely lean towards **physical books** (*Answer*). There is something truly therapeutic about the tactile sensation of turning paper pages and the scent of print, which digital screens simply cannot replicate (*Reason*). For instance, whenever I study for exams, having a tangible textbook in front of me helps me retain complex concepts much better without the digital eye strain (*Example*).

#### Part 2: Thuyết Trình Độc Thoại 2 Phút Theo Khung Cue Card
* **Kỹ thuật 1 Phút Ghi Chú Tối Ưu (1-Minute Note-taking Strategy):**
  * Không viết thành câu hoàn chỉnh; chỉ ghi từ khóa then chốt theo mô hình ngôi sao 5 cánh hoặc câu hỏi Wh- (*Who, When, Where, What happened, Why memorable*).
  * Viết sẵn 2–3 collocations Band 7+ và cấu trúc ngữ pháp cao cấp (ví dụ: một câu điều kiện loại 3 hoặc đảo ngữ) để chủ động chèn vào bài nói.
* **Quy tắc Duy Trì Dòng Nói (Sustained Speech Rule):**
  * Mục tiêu nói từ **1 phút 45 giây đến 2 phút**, cho đến khi giám khảo chủ động ngắt lời.
  * Nếu hết ý trước 1 phút 30 giây, kích hoạt chiến lược mở rộng: Kể về cảm xúc cá nhân trong quá khứ so với hiện tại, hoặc đưa ra giả định tương lai (*If I hadn't had that experience, I probably would never have...*).

#### Part 3: Thảo Luận Xã Hội Chuyên Sâu Theo Mô Hình PEEL
Các câu hỏi mang tính xã hội, trừu tượng, đòi hỏi tư duy phân tích đa chiều. Độ dài: 5–7 câu (khoảng 35–45 giây/câu).
* **P - Point:** Nêu luận điểm khái quát, khách quan (hạn chế lấy ví dụ bản thân tôi/gia đình tôi trong Part 3).
* **E - Explanation:** Phân tích sâu nguyên nhân, cơ chế hoặc tác động kinh tế/xã hội.
* **E - Example:** Đưa ra dẫn chứng thực tế từ xã hội, truyền thông hoặc xu hướng cộng đồng.
* **L - Link:** Chốt lại vấn đề hoặc liên hệ đến hệ quả dài hạn.

### 6.2. Bốn Tiêu Chí Chấm Speaking & Các Rào Cản Tâm Lý

1. **Fluency and Coherence (Độ trôi chảy & Mạch lạc):**
   * Khả năng nói liên tục, tốc độ ổn định, ngắt nghỉ đúng cụm nghĩa (Chunking).
   * Phân biệt giữa **Ngập ngừng ngôn ngữ (Language hesitation)** - dừng lại để tìm từ/ngữ pháp (bị trừ điểm) và **Ngập ngừng tư duy (Content hesitation)** - dừng lại để suy nghĩ ý tưởng (tự nhiên, không bị trừ điểm).
   * Sử dụng từ đệm tự nhiên: *To be perfectly honest, Well as far as I'm concerned, That's an intriguing question*.
2. **Lexical Resource (Vốn từ vựng):**
   * Dùng từ vựng đúng ngữ cảnh, thành ngữ tự nhiên (*idiomatic expressions* đúng mức, không khiên cưỡng), từ nối diễn giải (*paraphrasing* khi quên từ).
3. **Grammatical Range and Accuracy (Ngữ pháp):**
   * Sử dụng linh hoạt các thì quá khứ, hiện tại hoàn thành, câu phức, câu giả định. Kiểm soát tốt lỗi số ít/số nhiều và chia động từ cơ bản.
4. **Pronunciation (Phát âm):**
   * Đọc chuẩn từng âm vị IPA, bật âm cuối (*final sounds* như /s/, /z/, /t/, /d/).
   * Nhấn đúng trọng âm từ (*word stress*).
   * Ngữ điệu câu (*intonation*) và ngữ điệu biểu cảm (*expressive prosody*).

> [!IMPORTANT]
> **Quy Chuẩn Về Accent vs. Phát Âm (Accent Neutrality Principle):**  
> Hệ thống **tuyệt đối không phân biệt đối xử hay trừ điểm** dựa trên chất giọng vùng miền (Vietnamese accent, British accent, American accent, Australian accent). Giám khảo IELTS chỉ đánh giá độ rõ ràng (Clarity), tính dễ hiểu (Intelligibility), trọng âm và ngữ điệu. Tốc độ nói nhanh cũng không đồng nghĩa với độ trôi chảy; nói quá nhanh dẫn đến nuốt âm và sai ngữ pháp sẽ bị hạ điểm.

---

## 7. ĐỘNG CƠ TỪ VỰNG TRUNG TÂM & THUẬT TOÁN SPACED REPETITION (VOCABULARY ENGINE)

### 7.1. Cấu Trúc Dữ Liệu Từ Vựng Chuẩn Hóa

Mỗi đơn vị từ vựng trong hệ thống lưu trữ đầy đủ các trường thông tin sư phạm theo [`src/types/learningRules.ts`](file:///d:/Work/Freelance/Ielts_learning/src/types/learningRules.ts):

```json
{
  "id": "voc-mitigate",
  "word": "mitigate",
  "ipa": "/ˈmɪt.ɪ.ɡeɪt/",
  "partOfSpeech": "verb",
  "contextualDefinition": "Làm dịu bớt, giảm nhẹ mức độ nghiêm trọng hoặc tác hại của một vấn đề tiêu cực.",
  "example": "Government subsidies for clean energy are crucial to mitigate the long-term impact of climate change.",
  "exampleTranslation": "Các khoản trợ cấp của chính phủ cho năng lượng sạch là thiết yếu để giảm thiểu tác động lâu dài của biến đổi khí hậu.",
  "collocations": [
    "mitigate the impact of",
    "mitigate the risk",
    "mitigate the effects",
    "measures to mitigate"
  ],
  "wordFamily": {
    "noun": "mitigation",
    "adjective": "mitigating, unmitigated",
    "verb": "mitigate"
  },
  "synonyms": ["alleviate", "attenuate", "lessen", "cushion"],
  "topic": "Environment & Climate",
  "cefrLevel": "C1",
  "targetBand": 7.5,
  "academicSource": "Academic Word List (AWL) Sublist 2"
}
```

### 7.2. Vòng Đời 5 Trạng Thái Của Từ Vựng (5-Stage Lexical Lifecycle)

```
        ┌─────────────┐
        │     NEW     │ (Từ mới trong danh mục, người học chưa tương tác)
        └──────┬──────┘
               │ Lần đầu chạm mặt / Bắt đầu học
               ▼
        ┌─────────────┐   Đánh giá = Again (1)   ┌─────────────┐
        │  LEARNING   │ ───────────────────────> │    WEAK     │ (Từ yếu, hay quên,
        └──────┬──────┘ <─────────────────────── └─────────────┘  lập tức cần cứu vãn)
               │                                        ▲
               │ Repetition >= 1, Interval >= 3 ngày     │
               ▼                                        │
        ┌─────────────┐        Lapse / Quên khi ôn      │
        │   REVIEW    │ ────────────────────────────────┘
        └──────┬──────┘
               │ Đạt chuẩn: Repetition >= 4 AND Interval >= 21 AND Lapses <= 1
               ▼
        ┌─────────────┐
        │  MASTERED   │ (Đã thành thục, ghi nhớ bền vững vào dài hạn)
        └─────────────┘
```

### 7.3. Thuật Toán Lặp Lại Giãn Cách SuperMemo-2 (SM-2 Formulation)

Mỗi khi người học lật thẻ và đánh giá mức độ nhớ theo thang điểm 4 bậc ($q \in \{1, 2, 3, 4\}$):
* **1 - Again (Quên hẳn):** Trả về vòng học lại ngay.
* **2 - Hard (Nhớ khó khăn):** Tăng nhẹ khoảng thời gian ôn tập.
* **3 - Good (Nhớ chuẩn mực):** Tăng khoảng thời gian theo công thức cấp số nhân.
* **4 - Easy (Nhớ xuất sắc):** Thưởng thêm hệ số tăng tốc.

#### Công thức cập nhật Khoảng thời gian ($I_n$ - tính bằng ngày):

$$I_n = \begin{cases} 
1, & \text{khi } q = 1 \text{ (Quên)} \\
1, & \text{khi } n = 1 \text{ và } q > 1 \\
3, & \text{khi } n = 2 \text{ và } q > 1 \\
\lfloor I_{n-1} \times EF \times \alpha_q \rfloor, & \text{khi } n \ge 3 \text{ và } q > 1
\end{cases}$$

*Trong đó hệ số điều chỉnh chất lượng:* $\alpha_2 = 1.0, \quad \alpha_3 = 1.0, \quad \alpha_4 = 1.3$.

#### Công thức cập nhật Hệ số Dễ (Ease Factor - $EF$):

$$EF' = \max\left(1.3, \; EF + \left(0.1 - (4 - q) \times (0.08 + (4 - q) \times 0.02)\right)\right)$$

*Giới hạn sàn:* $EF \ge 1.3$ ([`LEARNING_RULES_CONFIG.srs.minimumEaseFactor`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/config.ts)) để tránh hiện tượng dồn ứ thẻ ôn tập (*Review Congestion*).

### 7.4. Phân Biệt Giữa Lập Lịch Ôn Tập (Scheduling) Và Điểm Ưu Tiên Lựa Chọn (Selection Priority)

Đây là hai cơ chế độc lập hoàn toàn trong hệ thống:
1. **Thuật toán Lập lịch (Scheduling):** Quyết định **thời điểm** một từ sẽ đến hạn (Due Date) dựa trên SM-2.
2. **Điểm Ưu Tiên Lựa Chọn (Selection Priority Score):** Khi một phiên học yêu cầu bốc ra $N$ từ (ví dụ: phiên 20 từ hàng ngày), hệ thống tính điểm ưu tiên cho toàn bộ kho từ để xếp hàng:

$$\text{PriorityScore} = (W_{\text{imp}} \cdot S_{\text{imp}}) + (W_{\text{gap}} \cdot S_{\text{gap}}) + S_{\text{due}} + S_{\text{lapse}} + B_{\text{topic}} + B_{\text{pinned}}$$

*Trong đó cấu hình trọng số chuẩn:*
* $S_{\text{imp}} = \text{importanceIndex} \times 0.35$ (Trọng số 0.35).
* $S_{\text{gap}} = \max\left(0, 100 - |\text{targetBand} - \text{wordBand}| \times 25\right) \times 0.25$ (Khoảng cách band 0.25).
* $S_{\text{due}} = \min(40, \text{daysOverdue} \times 8)$ (Càng quá hạn ôn tập, điểm ưu tiên càng tăng vọt).
* $S_{\text{lapse}} = \min(20, \text{lapses} \times 5)$ (Ưu tiên từ đã từng bị quên nhiều lần).
* $B_{\text{topic}} = +20\text{ điểm}$ nếu từ thuộc chủ đề bài học sắp tới.
* $B_{\text{pinned}} = +50\text{ điểm}$ nếu người học chủ động ghim từ khó cần chú ý.

### 7.5. Cơ Chế Bốc Mẫu Xác Suất Có Trọng Số (Weighted Random Bucket Selection)

Để tránh hiện tượng người học chỉ ôn mãi từ cũ mà không có từ mới, hoặc ngược lại chỉ học từ mới mà quên củng cố, một phiên học tiêu chuẩn 20 từ được phân bổ theo 3 ngăn chứa (Buckets):
* **Ngăn 1 (60% ~ 12 thẻ):** Nhóm `Learning` & `Weak` (Cần củng cố gấp).
* **Ngăn 2 (30% ~ 6 thẻ):** Nhóm `Review` (Đến hạn giãn cách).
* **Ngăn 3 (10% ~ 2 thẻ):** Nhóm `Mastered` (Ôn nhắc nhớ đường dài) hoặc từ `New` (Nạp mới).

**Quy tắc Xử Lý Ngoại Lệ (Fallback & Anti-Starvation Rules):**
1. *Nếu Ngăn 1 hoặc Ngăn 2 không đủ số lượng thẻ đến hạn:* Hạn ngạch trống sẽ được tự động chuyển nhượng cho Ngăn từ `New` để khuyến khích mở rộng vốn từ.
2. *Chống lặp từ trong cùng phiên (Anti-Spam Filter):* Một từ đã xuất hiện trong phiên ôn tập sẽ không được bốc lặp lại trong ít nhất 4 giờ tiếp theo, trừ khi người học bấm chọn *Again* (1).

### 7.6. Tích Hợp Từ Vựng Xuyên Suốt 4 Kỹ Năng

* **Vào Kỹ Năng Đọc (Reading Integration):** Trước khi làm bài đọc chuyên đề (ví dụ: *Biodiversity Loss*), hệ thống tự động bốc ra 5 collocations trọng tâm của bài đọc để người học kích hoạt trước não bộ (*Lexical Priming*).
* **Vào Kỹ Năng Nghe (Listening Integration):** Cung cấp các bài tập nghe điền chính tả tập trung đúng vào các collocations đang trong trạng thái `Weak`.
* **Vào Kỹ Năng Viết (Writing Integration):** Khung nộp bài kiểm tra sự hiện diện của ít nhất 3 từ vựng học thuật thuộc chủ đề đề bài. Hệ thống chấm điểm AI phân tích xem từ đó được dùng đúng collocation hay chưa.
* **Vào Kỹ Năng Nói (Speaking Integration):** Gợi ý 3 collocations mở rộng ngay dưới Cue Card Part 2 để người học chủ động tích hợp vào phần nói tự nhiên.

---

## 8. HỆ THỐNG HỌC THÍCH ỨNG & PHÂN ĐỊNH TRÁCH NHIỆM AI (ADAPTIVE LEARNING ENGINE)

### 8.1. Ma Trận Trách Nhiệm Thành Phần Hệ Thống (Separation of Concerns)

Nhằm đảm bảo tính toàn vẹn dữ liệu và độ tin cậy tuyệt đối, hệ thống phân định ranh giới nghiêm ngặt giữa các Engine toán học tất định (Deterministic Engines) và Trí tuệ Nhân tạo tạo sinh (Generative AI):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BỘ NÃO ĐIỀU HÀNH TẤT ĐỊNH                             │
│                  (Deterministic Operational Engines)                        │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ LEARNING PATH ENGINE │  VOCABULARY ENGINE   │       ASSESSMENT ENGINE       │
│ - Mở/Khóa bài học    │ - Thuật toán SM-2    │ - Chấm điểm trắc nghiệm L & R │
│ - Tính tiến độ %     │ - Tính PriorityScore │ - Làm tròn điểm chuẩn IELTS   │
│ - Điều hướng lộ trình│ - Quản lý Lifecycle  │ - Đồng hồ đếm ngược phòng thi │
└──────────┬───────────┴──────────┬───────────┴───────────────┬───────────────┘
           │                      │                           │
           │ Cung cấp dữ kiện gốc │ Xác thực quy tắc          │
           ▼                      ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TRỢ LÝ AI & LLM EVALUATOR                          │
│                            (Advisory & Diagnostic)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ - Nhận dạng lỗi ngữ pháp, cấu trúc và collocation trong Writing/Speaking.   │
│ - Đưa ra lời khuyên, gợi ý phương án viết lại band cao (Paraphrase).        │
│ - Giải thích cặn kẽ tại sao đáp án Reading/Listening lại là B mà không là A.│
│                                                                             │
│ [QUY TẮC BẤT BIẾN]: AI TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP TRỰC TIẾP SỬA ĐỔI          │
│ DỮ LIỆU ĐIỂM SỐ, TIẾN ĐỘ HỌC TẬP HAY TRẠNG THÁI TỪ VỰNG TRONG DATABASE      │
│ MÀ KHÔNG THÔNG QUA CÁC GATEWAY SERVICE ĐÃ ĐƯỢC KIỂM ĐỊNH.                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2. Luật Giảm Chấn Trong Học Thích Ứng (The Damping Rule)

Một sai lầm phổ biến của các hệ thống thích ứng non trẻ là thay đổi lộ trình quá đột ngột khi người học mắc một lỗi sai đơn lẻ. IELTS Learning Platform áp dụng **Luật Giảm Chấn (Damping Factor $\lambda = 0.3$)**:
* Một kỹ năng chỉ bị đánh giá là suy giảm phong độ khi người học có **ít nhất 3 lần liên tiếp** đạt tỷ lệ chính xác dưới ngưỡng yêu cầu trong cùng một dạng bài.
* Khi phát hiện lỗi lặp lại (ví dụ: sai liên tục 3 câu *Matching Headings*), hệ thống không hạ bậc toàn bộ khóa học mà chỉ chèn vào một đơn vị can thiệp vi mô (Micro-Intervention Drill: 5 câu chuyên sâu kèm giải thích chiến thuật) trước khi cho phép tiếp tục bài học chính.

---

## 9. THEO DÕI TIẾN BỘ, THI THỬ MÔ PHỎNG CDI & TƯƠNG THÍCH DỮ LIỆU

### 9.1. Bộ Chỉ Số Đánh Giá Tiến Bộ Thực Chất (Meaningful Progress KPIs)

Hệ thống kiên quyết bài trừ các chỉ số bề nổi như "Số bài học đã bấm hoàn thành" hay "Số giờ mở ứng dụng treo máy". Tiến độ thực chất được đo lường bằng:

1. **Tỷ Lệ Giữ Chân Kiến Thức Thực (True Memory Retention Rate):**  
   Tỷ lệ % các từ vựng thuộc nhóm `Review` và `Mastered` được đánh giá thành công ($\ge \text{Good}$) trong các đợt kiểm tra ngẫu nhiên.
2. **Tỷ Lệ Xóa Điểm Nghẽn Lỗi Sai (Error Remediation Rate):**  
   Tỷ lệ phần trăm các lỗi sai trong Error Bank được người học thực hành lại đúng trong vòng 7 ngày kể từ khi mắc lỗi.
3. **Chỉ Số Chuỗi Ngày Chuyên Cần Thật (Real Streak Quality):**  
   Streak chỉ được kích hoạt tính thêm 1 ngày khi người học hoàn thành **ít nhất 100% hạn ngạch nhiệm vụ hàng ngày (Daily Plan)** hoặc học tối thiểu 20 phút hoạt động trí tuệ chủ động. Hệ thống không tặng streak cho việc chỉ đăng nhập điểm danh tĩnh.
4. **Phân Biệt Điểm Luyện Tập vs. Điểm Thi Thử Chuẩn vs. Band Dự Đoán:**
   * **Practice Accuracy (%):** Tỷ lệ đúng bài tập theo dạng (chỉ dùng cho việc điều chỉnh học vi mô).
   * **Verified Mock Test Band:** Điểm số từ bài thi thử 4 kỹ năng hoàn chỉnh có kiểm soát thời gian nghiêm ngặt theo format Cambridge.
   * **Predicted Band Range:** Ước lượng khoảng dao động với độ tin cậy 95% (Ví dụ: $6.5 \pm 0.5$, không bao giờ khẳng định một con số tuyệt đối duy nhất).

### 9.2. Phòng Thi Thử Mô Phỏng Chuẩn Máy Tính (Authentic CDI Simulation)

Môi trường thi thử mô phỏng chính xác giao diện và quy tắc của kỳ thi IELTS trên máy tính (Computer-Delivered IELTS - CDI):
* **Cơ chế Đồng hồ Đếm ngược Nghiêm ngặt:** Chạy từng giây từ server/state. Khi hết giờ, bài thi tự động đóng và nộp ngay lập tức, không cho phép gia hạn thời gian làm bài.
* **Quy chuẩn Làm Tròn Band Quốc Tế (Official IELTS Rounding Rule):**

$$\text{Overall Band} = \frac{\text{Listening} + \text{Reading} + \text{Writing} + \text{Speaking}}{4}$$

| Điểm Trung Bình Cộng | Điểm Overall Quy Chuẩn | Ví dụ Thực Tế |
| :---: | :---: | :--- |
| $\text{Fraction} < 0.25$ | Làm tròn xuống số nguyên | $6.125 \implies \mathbf{6.0}$ |
| $0.25 \le \text{Fraction} < 0.75$ | Làm tròn về mốc **.5** | $6.25 \implies \mathbf{6.5} \quad \| \quad 6.625 \implies \mathbf{6.5}$ |
| $\text{Fraction} \ge 0.75$ | Làm tròn lên số nguyên tiếp theo | $6.75 \implies \mathbf{7.0} \quad \| \quad 7.875 \implies \mathbf{8.0}$ |

### 9.3. Chuẩn Tương Thích Dữ Liệu Anki (Anki Interoperability Protocol)

Để bảo đảm quyền tự do dữ liệu của người học, hệ thống hỗ trợ 2 chiều:
* **Export sang Anki (TSV / CSV UTF-8):** Xuất toàn bộ kho từ vựng kèm âm thanh, phiên âm IPA, định nghĩa, ví dụ, collocations và tag chủ đề theo định dạng chuẩn tương thích hoàn toàn với Anki Desktop và AnkiMobile.
* **Import từ Anki:** Cho phép người học nạp bộ thẻ cá nhân có sẵn vào hệ thống để tiếp tục chu kỳ lặp lại giãn cách SM-2 thống nhất trên nền tảng.

---

## 10. BẢNG TỔNG HỢP QUY CHUẨN NGHIỆP VỤ & THAM SỐ CẤU HÌNH

### 10.1. Danh Mục Tham Số Cấu Hình Hệ Thống (System Parameter Matrix)

Toàn bộ các tham số dưới đây được khai báo tập trung tại [`src/services/learningRules/config.ts`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/config.ts), có thể tinh chỉnh theo từng giai đoạn thử nghiệm A/B Testing mà không làm thay đổi logic lõi:

| Mã Tham Số | Giá Trị Mặc Định | Đơn Vị | Ý Nghĩa Sư Phạm & Nghiệp Vụ |
| :--- | :---: | :---: | :--- |
| `srs.defaultEaseFactor` | `2.5` | Hệ số | Điểm khởi đầu độ dễ của một từ vựng mới theo chuẩn thuật toán SM-2. |
| `srs.minimumEaseFactor` | `1.3` | Hệ số | Giới hạn sàn tuyệt đối, ngăn ngừa hiệu ứng dồn ứ thẻ ôn tập quá mức. |
| `srs.masteryRepetitionThreshold` | `4` | Lần | Số lần nhớ thành công liên tiếp tối thiểu để chuyển trạng thái `Mastered`. |
| `srs.masteryIntervalThreshold` | `21` | Ngày | Khoảng thời gian giãn cách tối thiểu để xác nhận từ đã vào trí nhớ dài hạn. |
| `vocab.bucketRatio.learningWeak` | `0.60` | Tỷ lệ | Tỷ trọng nhóm từ đang học/yếu trong một phiên ôn tập từ vựng tiêu chuẩn. |
| `vocab.bucketRatio.review` | `0.30` | Tỷ lệ | Tỷ trọng nhóm từ đến hạn ôn tập giãn cách. |
| `vocab.bucketRatio.masteredNew` | `0.10` | Tỷ lệ | Tỷ trọng nhóm từ thành thục cần nhắc lại hoặc từ vựng mới nạp thêm. |
| `vocab.topicBonusPoints` | `15` | Điểm | Điểm cộng ưu tiên khi từ trùng khớp với chủ đề bài học sắp tới. |
| `adaptive.dampingFactor` | `0.3` | Hệ số | Hệ số giảm chấn ngăn lộ trình học bị biến động quá mạnh do lỗi sai ngẫu nhiên. |
| `reading.passageMaxTimeMinutes` | `20` | Phút | Thời lượng chuẩn mực phân bổ cho 1 bài đọc Academic Reading. |
| `listening.maxAllowedSpellingErrors` | `0` | Lỗi | Số lỗi chính tả được dung thứ trong bài thi Nghe (sai 1 chữ cái = tính sai câu). |
| `dailyPlan.defaultTimeMinutes` | `45` | Phút | Thời lượng học mặc định được khuyến nghị cho người học mỗi ngày. |
| `dailyPlan.newVsReviewRatio` | `60:40` | Tỷ lệ | Phân bổ 60% thời gian cho bài học mới và 40% thời gian cho củng cố/ôn tập. |

### 10.2. Lời Kết Của Kiến Trúc Sư Hệ Thống

Tài liệu đặc tả này thiết lập **tiêu chuẩn vàng (Gold Standard)** cho toàn bộ quy trình thiết kế dữ liệu, thuật toán và phát triển tính năng trên IELTS Learning Platform. Mọi thành viên đội ngũ kỹ thuật, khảo thí và sư phạm khi tham gia xây dựng các module liên quan có trách nhiệm đối chiếu trực tiếp với các điều khoản trong tài liệu này, bảo đảm hệ thống luôn vận hành thống nhất, minh bạch, khoa học và phụng sự mục tiêu tiến bộ bền vững của người học.
