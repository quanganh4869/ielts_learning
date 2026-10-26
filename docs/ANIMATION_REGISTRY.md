# BẢNG ĐỐI CHIẾU & QUY CHUẨN TÍCH HỢP ANIMATION LINH THÚ NORI & BRAND GOOGLE FLOW
**Hệ thống IELTS Learning Platform**

---

## 1. NGUYÊN TẮC QUẢN TRỊ TÀI NGUYÊN BẮT BUỘC
1. **Bảo tồn 100% định danh file gốc**: Giữ nguyên toàn bộ tên file, đuôi mở rộng, ký tự unicode và đường dẫn tương đối. Không đổi tên, không tạo bản sao chỉ để đổi tên và không tạo lại tài nguyên đã có.
2. **Kiểm tra trực quan đa mốc thời gian**: Xác định nội dung bằng cách trích xuất frame thực tế tại các mốc thời gian (0%, 25%, 50%, 75%, 100%) và kiểm tra góc nền RGB thay vì suy đoán qua tên file.
3. **Ánh xạ đúng ngữ cảnh nghiệp vụ (Business-Accurate Events)**:
   - Thành tích thực tế / Hoàn thành thi thử: `grand_celebration`
   - Hoàn thành bài học: `lesson_completed`
   - Chuỗi ngày chuyên cần: `study_streak`
   - Thêm khối học / khóa học: `module_added`
   - Lưu dữ liệu: `data_saved`
   - Mở khóa bài học / giai đoạn: `unlock_padlock`
   - Báo lỗi / Thao tác sai: `error_feedback`
   - Thử lại mạng / Timeout: `network_retry`
   - Ôn tập Flashcard: `study_session`
   - Tải dữ liệu thực tế / AI tính toán: `loading_juggling`
4. **Cơ chế chống lặp & Tối ưu hiệu năng**:
   - Sử dụng `useAnimationTrigger` ghi nhớ `eventKey` trong session bộ nhớ, chống re-render / remount / route change làm phát lại nhiều lần.
   - Hỗ trợ `prefers-reduced-motion` tự động chuyển sang sticker tĩnh.
   - Tránh blend mode sai màu nhân vật, luôn đặt trên nền `#FFFFFF` hoặc container bo tròn chuẩn EdTech.
   - Tự động giải phóng tài nguyên video khi unmount (`pause()`, `removeAttribute('src')`, `load()`).

---

## 2. BẢNG DANH MỤC & MAPPING CHI TIẾT TỪNG ASSET

| Đường dẫn file gốc | Kích thước | Định dạng & Độ phân giải | Thời lượng | Nền thực tế (RGB) | Nội dung hình ảnh & Hành động quan sát được | Sự kiện nghiệp vụ ánh xạ | Chế độ phát | Mức độ chắc chắn |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `animation/Book_opening_with_checkmark_anim…_1080p_20261026220238.mp4` | 1,040,772 bytes | MP4 (H.264), 1920×1080 | 4.0s | Off-white (`#ECEAEB` / `#F8F8F8`) | Cuốn sách 3D bìa xanh teal lật mở trang, dấu tích xanh ngọc (checkmark) hiện lên ở giữa, Nori ló đầu từ sau sách mỉm cười vẫy tay chào kèm các ngôi sao xanh lấp lánh tỏa sáng. | `lesson_completed`<br>*(Xác nhận hoàn thành bài học trên Lộ trình)* | Phát 1 lần (4.0s) | **100% Verified** |
| `animation/Floppy_disk_transforms_into_chec…_1080p_20261026220952.mp4` | 506,406 bytes | MP4 (H.264), 1920×1080 | 4.0s | Pure White (`#FFFFFF`) | Biểu tượng đĩa mềm 3D màu xanh teal xoay nhẹ rồi chuyển hóa mượt mà (smooth morph) thành dấu tích chữ V xanh ngọc kèm các vòng sóng tròn lan tỏa. | `data_saved`<br>*(Lưu đánh giá Flashcard, cài đặt, tiến độ)* | Phát 1 lần (3.8s) | **100% Verified** |
| `animation/Module_added_successfully_UI_ani…_1080p_20261026220700.mp4` | 355,133 bytes | MP4 (H.264), 1920×1080 | 4.0s | Pure White (`#FFFFFF`) | Một UI card bo tròn mang avatar Nori bay vào tâm, góc trên nổi lên huy hiệu tròn màu xanh ngọc và kích hoạt dấu tích xanh gợn sóng xác nhận. | `module_added`<br>*(Thêm module/khóa học mới trong Admin/Lộ trình)* | Phát 1 lần (3.5s) | **100% Verified** |
| `animation/Otter_character_shaking_error_do…_1080p_20261026220956.mp4` | 844,215 bytes | MP4 (H.264), 1920×1080 | 4.0s | Pure White (`#FFFFFF`) | Nori mặc đồng phục xanh teal cầm kẹp tài liệu, gãi đầu bối rối lo lắng, bong bóng dấu chấm than (!) và bóng đèn chập chờn rung lắc nghi vấn, sau đó sáng bừng tìm ra giải pháp. | `error_feedback`<br>*(Báo lỗi thất bại, câu trả lời chưa đúng, lỗi nhập)* | Phát 1 lần / theo state | **100% Verified** |
| `animation/Otter_character_study_streak_ani…_1080p_20261026220556.mp4` | 1,065,620 bytes | MP4 (H.264), 1920×1080 | 4.0s | Off-white (`#FAF7F8`) | Nori đứng tự hào bên cạnh ngọn lửa Streak bập bùng, các vòng sóng năng lượng Google Flow đa sắc kèm mã màu teal `#28665F` tỏa ra rực rỡ, Nori nhắm mắt mỉm cười mãn nguyện. | `study_streak`<br>*(Đạt cột mốc chuỗi ngày học chuyên cần trên Dashboard)* | Phát 1 lần (4.0s) | **100% Verified** |
| `animation/Otter_character_UI_transition_an…_1080p_20261026221626.mp4` | 1,017,440 bytes | MP4 (H.264), 1920×1080 | 4.0s | Off-white (`#FAF7F8`) | Nori cầm tablet chỉ tay thân thiện giới thiệu danh sách các thẻ bài học lộ trình bay vào xếp tầng tuần tự bên phải với nhãn màu teal `#28665F`. | `ui_transition`<br>*(Màn hình rỗng hướng dẫn lộ trình / EmptyState)* | Lặp nhẹ / Phát 1 lần | **100% Verified** |
| `animation/Otter_holding_refresh_loop_indic…_1080p_20261026221301.mp4` | 747,941 bytes | MP4 (H.264), 1920×1080 | 4.0s | Pure White (`#FFFFFF`) | Nori nhìn sổ tay băn khoăn, dấu hỏi chấm (?) hiện lên rồi Nori mỉm cười nâng biểu tượng vòng xoay refresh màu teal trên tay kèm dòng chữ *"Connection timed out. Tap to retry."* | `network_retry`<br>*(Khi ngắt kết nối mạng hoặc ErrorState có nút Thử lại)* | Lặp cho đến khi retry | **100% Verified** |
| `animation/Otter_jumping_for_celebration_an…_1080p_20261026215954.mp4` | 1,468,015 bytes | MP4 (H.264), 1920×1080 | 4.0s | Pure White (`#FFFFFF`) | Mưa hoa giấy confetti rực rỡ sắc màu bay lượn ngập tràn không gian, Nori nhảy bật lên cao ăn mừng với nụ cười hạnh phúc rạng rỡ. | `grand_celebration`<br>*(Hoàn thành thi thử IELTS / Đạt mục tiêu Band điểm)* | Phát 1 lần (4.0s) | **100% Verified** |
| `animation/Padlock_unlocks_revealing_book_icon_1080p_20261026221821.mp4` | 852,687 bytes | MP4 (H.264), 1920×1080 | 4.0s | Studio White (`#F5F5F5` to `#FFFFFF`) | Ổ khóa 3D màu trắng ngà viền xanh teal bật mở quai kèm vòng hào quang ánh sáng, biến hóa thành cuốn sách tri thức mở rộng với đốm sáng lơ lửng. | `unlock_padlock`<br>*(Mở khóa giai đoạn Phase / Khối học trên Lộ trình)* | Phát 1 lần (4.0s) | **100% Verified** |
| `animation/ô.mp4` | 521,005 bytes | MP4 (H.264), 1920×1080 | 4.0s | Pure White (`#FFFFFF`) | Nori ngồi khoanh chân ấm áp trên sàn, trước mặt là các tập thẻ flashcard và sách mở sẵn sàng. Nori ngoe nguẩy đuôi vui vẻ và vẫy tay chào đón học viên. | `study_session`<br>*(Không gian học Flashcard từ vựng & ngữ pháp)* | Lặp nhẹ nhàng | **100% Verified** |
| `Otter_icon_closing_animation_1080p_20261025225329.mp4` | 493,322 bytes | MP4 (H.264), 1920×1080 | 4.0s | Pure White (`#FFFFFF`) | Nori đứng vẫy tay tạm biệt thân thiện, sau đó nhân vật thu nhỏ dần vào tâm điểm và biến mất nhẹ nhàng. | `icon_closing`<br>*(Hiệu ứng đóng popup / drawer / kết thúc phiên học)* | Phát 1 lần | **100% Verified** |
| `public/loading-nori.webm` & `public/loading-nori.mp4` | 203,781 / 277,694 bytes | WebM (VP9 400×400) / MP4 480×480 | 4.0s | Pure White (`#FFFFFF`) | Nori ngồi tung hứng nhịp nhàng các quyển sách và quả cầu tri thức đa sắc màu theo quỹ đạo hình vòng cung mượt mà, mỉm cười kiên nhẫn. | `loading_juggling`<br>*(Đang tải dữ liệu thực tế / AI chấm điểm Writing-Speaking)* | Lặp liên tục trong khi tải | **100% Verified** |

---

## 3. KIẾN TRÚC THÀNH PHẦN FRONTEND DÙNG CHUNG

- **`AnimationRegistry.ts`**: Lưu trữ ánh xạ tập trung kiểu TypeScript an toàn (`Record<AnimationEventType, AnimationAssetMeta>`), chứa đường dẫn chính, đường dẫn phụ WebM/MP4, ảnh fallback và metadata.
- **`VideoPlayer.tsx`**: Component hiển thị video tối ưu với `preload="metadata"`, `muted`, `playsInline`, lắng nghe `prefers-reduced-motion` và tự động dọn dẹp khi unmount.
- **`useAnimationTrigger.ts`**: Hook cung cấp `claimEvent(key)` chống phát lại do React re-render, remount hoặc chuyển route qua lại.
- **`CelebrationAnimation.tsx`**: Modal ăn mừng chuẩn EdTech Band7Writing với các event `grand_celebration`, `lesson_completed`, `study_streak`.
- **`StatusAnimation.tsx`**: Modal hoặc Inline card thể hiện trạng thái `module_added`, `data_saved`, `unlock_padlock`, `error_feedback`, `network_retry`.
- **`LoadingAnimation.tsx`**: Hiệu ứng Nori tung hứng sách tải dữ liệu mượt mà kèm thanh tiến trình.
- **`EmptyStateIllustration.tsx`**: Hiệu ứng trạng thái rỗng hướng dẫn người học qua video Nori.
- **`FlashcardFlip.tsx` (`FlashcardCompanion`)**: Bạn đồng hành Nori hiển thị video `ô.mp4` trong phiên học từ vựng Flashcard.
