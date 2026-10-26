# BÁO CÁO TÁI CẤU TRÚC & CHUẨN HÓA MÃ NGUỒN THEO TIÊU CHUẨN DOANH NGHIỆP
**IELTS Learning Platform — Enterprise Architecture Refactor Report**

---

## 1. MỤC TIÊU & NGUYÊN TẮC THI CÔNG
- **Vai trò**: Senior Software Architect.
- **Tiêu chuẩn mục tiêu**: Tái cấu trúc có kiểm soát, phân định trách nhiệm mô-đun rõ ràng, chuẩn hóa đường biên public API (Barrel Exports), tối ưu cơ chế import và đảm bảo 100% độ ổn định hệ thống.
- **Nguyên tắc an toàn tuyệt đối**:
  1. **Zero Deletion Policy**: Tuyệt đối không xóa bất kỳ file nào. Giữ nguyên 100% toàn bộ source code, hình ảnh, animation, file cấu hình, script, dữ liệu JSON và tài liệu tham khảo.
  2. **Zero Renaming Policy**: Không đổi tên bất kỳ file tài nguyên, media hay animation nào.
  3. **Data Integrity**: Bảo toàn 100% dữ liệu phòng thi, logic SuperMemo-2, quy tắc chấm điểm và thiết kế UI Band7Writing.
  4. **Kiểm tra theo từng giai đoạn**: Chạy TypeScript compile, Unit Tests và Production Build ở mỗi bước thay đổi.

---

## 2. BẢNG SO SÁNH CẤU TRÚC TRƯỚC VÀ SAU CHUẨN HÓA

### 2.1. Cấu trúc Trước Chuẩn Hóa
```
Ielts_learning/
├── animation/              # 10 video animation gốc
├── dist/                   # Bản build production
├── docs/                   # LEARNING_RULES.md, ANIMATION_REGISTRY.md
├── downloads/              # Đề thi & tài liệu mẫu JSON
├── public/                 # Static assets (brand, stickers, visuals, videos)
├── scripts/                # Python processing scripts
├── singlefile/             # HTML tham chiếu Band7Writing
├── src/
│   ├── admin/              # Module Admin Console (chưa có barrel export chuẩn)
│   ├── assets/             # Vector icons
│   ├── components/         # Giao diện dùng chung (thiếu barrel exports tại root/common/layout)
│   ├── context/            # 4 React Context (chưa có entry point tập trung)
│   ├── hooks/              # Custom hooks (chưa có index.ts)
│   ├── i18n/               # Localization
│   ├── pages/              # 12 thư mục màn hình chức năng
│   ├── routes/             # Định tuyến App & Admin
│   ├── services/           # Dịch vụ API & Learning Rules (thiếu index.ts tập trung)
│   ├── types/              # 8 file types (chưa có index.ts tập trung)
│   └── utils/              # Tiện ích cn, formatters, assets (thiếu index.ts)
└── [Các file cấu hình & dữ liệu gốc tại root]
```

### 2.2. Cấu trúc Sau Chuẩn Hóa (Chuẩn Doanh Nghiệp)
```
Ielts_learning/
├── animation/              # [BẢO TOÀN 100%] 10 video gốc, phục vụ trực tiếp qua Vite dev & build
├── dist/                   # Production build artifact
├── docs/
│   ├── ARCHITECTURE.md     # [MỚI] Tài liệu kiến trúc phân tầng hệ thống chuẩn Enterprise
│   ├── CODE_ORGANIZATION.md # [MỚI] Báo cáo chi tiết quá trình tái cấu trúc & audit tài nguyên
│   ├── LEARNING_RULES.md   # [BẢO TOÀN] Quy chuẩn nghiệp vụ Learning Rules Engine
│   └── ANIMATION_REGISTRY.md # [BẢO TOÀN] Bảng đối chiếu frame & mapping sự kiện animation
├── downloads/              # [BẢO TOÀN] Dữ liệu đề thi IELTS mẫu (Cambridge, Collins, Task Sets)
├── public/                 # [BẢO TOÀN] Brand, stickers, visuals, videos loading
├── scripts/                # [BẢO TOÀN] Bộ script phân tích tài liệu và xử lý dữ liệu
├── singlefile/             # [BẢO TOÀN] Bộ snapshot HTML tham chiếu Band7Writing
├── src/
│   ├── admin/
│   │   ├── components/
│   │   │   ├── content/    # [BẢO TOÀN] 6 Drawers tạo mới nội dung
│   │   │   │   └── index.ts # [MỚI] Barrel export cho các ngăn kéo tạo mới
│   │   │   └── index.ts    # [MỚI] Barrel export cho toàn bộ thành phần Admin Console
│   │   ├── pages/          # [BẢO TOÀN] Các trang quản trị hệ thống
│   │   ├── services/       # [BẢO TOÀN] Admin Service & Question Builder Service
│   │   ├── types/          # [BẢO TOÀN] Kiểu dữ liệu quản trị
│   │   └── index.ts        # [MỚI] Entry point chuẩn của phân hệ Admin
│   ├── components/
│   │   ├── animation/      # [BẢO TOÀN] Động cơ Animation linh thú Nori & Google Flow
│   │   │   └── index.ts    # Barrel export AnimationRegistry, Celebration, Status...
│   │   ├── brand/          # [BẢO TOÀN] Logo & Nori Illustrations
│   │   ├── common/         # [BẢO TOÀN] UI Primitives
│   │   │   └── index.ts    # [MỚI] Barrel export đầy đủ cho 22 UI Components
│   │   ├── flashcard/      # [BẢO TOÀN] Hệ thống thẻ lật 3D Spaced Repetition
│   │   ├── layout/         # [BẢO TOÀN] AppShell, TestTakingLayout, Workspace...
│   │   │   └── index.ts    # [MỚI] Barrel export cho các Layouts
│   │   ├── loading/        # [BẢO TOÀN] Skeleton & AI Processing state
│   │   └── index.ts        # [MỚI] Root Barrel Export của toàn bộ tầng Component
│   ├── context/
│   │   └── index.ts        # [MỚI] Entry point tập trung cho 4 Context và Hooks tương ứng
│   ├── hooks/
│   │   └── index.ts        # [MỚI] Entry point tập trung cho Custom Hooks
│   ├── services/
│   │   ├── learningRules/  # [BẢO TOÀN] Bộ 6 engine nghiệp vụ trung tâm IELTS
│   │   └── index.ts        # [MỚI] Entry point tập trung cho toàn bộ Services & Rules
│   ├── types/
│   │   └── index.ts        # [MỚI] Entry point tập trung cho toàn bộ Domain Models
│   ├── utils/
│   │   └── index.ts        # [MỚI] Entry point tập trung cho Helper Functions & Assets
│   ├── App.tsx             # [BẢO TOÀN] Root Application Component
│   ├── main.tsx            # [BẢO TOÀN] React 19 Entrypoint
│   └── index.css           # [BẢO TOÀN] Tailwind CSS v4, Font Nunito & Keyframe Animations
└── [File cấu hình gốc]    # [BẢO TOÀN] package.json, vite.config.ts, tsconfig*.json
```

---

## 3. PHÂN LOẠI & BẢO TOÀN CÁC TÀI NGUYÊN TẠI ROOT

Toàn bộ các file tại thư mục gốc được giữ nguyên 100%, phân loại mục đích rõ ràng:

1. **Nhóm Video Animation**:
   - `animation/*.mp4`: 10 tệp animation thương hiệu được phục vụ trực tiếp qua Vite dev server và sao chép vào `dist/animation/` khi build.
   - `loading.mp4` & `Otter_icon_closing_animation_1080p_20261025225329.mp4`: Tệp video gốc chất lượng cao 1080p.
2. **Nhóm Thiết kế Gốc & Source Visuals**:
   - `logo.jpg`, `logo_isolated.jpg`, `logo_tight.png`, `logo_transparent.png`, `logo_wordmark.png`: Tệp gốc vector/raster bộ nhận diện thương hiệu.
   - `nori_character.png`, `nori_avatar.png`: File thiết kế nhân vật Nori kích thước lớn.
   - `cropped_preview.png`, `image1.jpg`, `image2.jpg`, `slice_*.png`, `loading_frame_*.png`: Tệp hình ảnh tham chiếu và frame mẫu.
3. **Nhóm Dữ liệu Khảo cứu & Lưu trữ**:
   - `singlefile.rar`, `singlefile/`: Bản lưu trữ hoàn chỉnh các trang mẫu Band7Writing phục vụ tham chiếu thiết kế.
   - `ielts_fighter_page.html`, `book_inventory.txt`, `parsed_sections.json`, `download`: Dữ liệu phân tích và biên mục tài liệu đề thi mẫu.
4. **Nhóm Cấu hình Hệ thống**:
   - `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.oxlintrc.json`, `.gitignore`: Giữ nguyên cấu hình và phiên bản dependency của dự án.

---

## 4. KẾT QUẢ KIỂM TRA CHẤT LƯỢNG (VERIFICATION AUDIT)

| Kiểm tra | Lệnh thực hiện | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Git Safety Checkpoint** | `git status` | Toàn bộ trạng thái ban đầu và các thay đổi được ghi nhận an toàn vào Git commit. Không có file nào bị xóa hay mất mát. | **ĐẠT (100%)** |
| **TypeScript Type Checking** | `tsc -b` | 0 lỗi biên dịch. Tất cả barrel exports và kiểu dữ liệu ăn khớp hoàn toàn. | **ĐẠT (0 Lỗi)** |
| **Static Code Analysis (Linter)** | `npx oxlint` | Quét 171 tệp mã nguồn với 116 quy tắc kiểm tra. Không có lỗi runtime (0 errors). | **ĐẠT** |
| **Unit Test Suite** | `npm test -- --run` | Toàn bộ 37/37 kiểm thử trong `learningRules.test.ts` và `questionSetBuilder.test.ts` vượt qua thành công. | **ĐẠT (37/37 Green)** |
| **Production Build** | `npm run build` | 2094 modules được chuyển đổi thành công trong 920ms. Thư mục `dist/` kèm toàn bộ tài nguyên `dist/animation/` được đóng gói hoàn chỉnh. | **ĐẠT** |
| **HTTP Dev Server Health** | Python probe | Tất cả các tuyến chính (`/`, `/app/dashboard`, `/app/learning-path`, `/app/practice/vocabulary/review`, `/admin/content/vocabulary`) và toàn bộ 13 tệp animation video đều phản hồi HTTP Status 200 OK. | **ĐẠT** |
