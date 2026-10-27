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
├── animation/              # [BẢO TOÀN 100%] 11 video gốc (bao gồm Otter closing), phục vụ trực tiếp qua Vite dev & build
├── dist/                   # Production build artifact
├── docs/                   # Tài liệu kiến trúc, quy chuẩn & phương pháp học
├── public/                 # Static assets phục vụ trực tiếp web (brand, stickers, visuals, videos)
├── resources/              # [MỚI - SẮP XẾP GỌN GÀNG] Toàn bộ tài nguyên gốc, ảnh khảo sát & dữ liệu nghiên cứu
│   ├── brand/              # Tệp thiết kế vector/raster logo, mascot Nori & source video loading
│   ├── previews/           # Ảnh chụp giao diện tham khảo, frame tách lớp & preview slices
│   └── research/           # Dữ liệu phân tích đề thi, snapshot HTML Band7Writing & kho tài liệu IELTS
│       ├── singlefile/     # 15 trang HTML snapshot offline Band7Writing
│       └── downloads-materials/ # Bộ đề thi mẫu số hóa Cambridge, Collins, Mat Clark...
├── scripts/                # Bộ script Python phân tích tài liệu và xử lý dữ liệu
├── src/                    # Kiến trúc mã nguồn React + TypeScript
└── [File cấu hình gốc]    # package.json, vite.config.ts, tsconfig*.json, index.html, README.md, .gitignore
```
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

## 3. PHÂN LOẠI & SẮP XẾP TÀI NGUYÊN VÀO THƯ MỤC CHUYÊN BIỆT (ZERO ROOT CLUTTER)

Thư mục gốc được tinh gọn tuyệt đối theo chuẩn Enterprise, toàn bộ tài nguyên nghiên cứu và đồ họa được chuyển vào các thư mục có tổ chức:

1. **Nhóm Video Animation (`animation/` & `public/`)**:
   - `animation/*.mp4`: 11 tệp animation thương hiệu chuẩn 1080p (đã quy tụ đầy đủ cả `Otter_icon_closing_animation_1080p_20261025225329.mp4`).
   - `public/`: Chứa các video loading và icon closing được phục vụ trực tiếp cho trình duyệt và đóng gói tự động vào `dist/`.
2. **Nhóm Thiết kế Gốc & Source Visuals (`resources/brand/`)**:
   - `logo.jpg`, `logo_isolated.jpg`, `logo_tight.png`, `logo_transparent.png`, `logo_wordmark.png`: Tệp gốc vector/raster bộ nhận diện thương hiệu.
   - `nori_character.png`, `nori_avatar.png`: File thiết kế nhân vật Nori kích thước lớn.
   - `loading.mp4`: Tệp video gốc chất lượng cao lưu trữ dự phòng.
3. **Nhóm Giao diện Tham chiếu & Slices (`resources/previews/`)**:
   - `cropped_preview.png`, `image1.jpg`, `image2.jpg`, `slice_*.png`, `loading_frame_*.png`: Tệp hình ảnh tham chiếu và frame mẫu.
4. **Nhóm Dữ liệu Khảo cứu & Lưu trữ (`resources/research/`)**:
   - `singlefile/`, `singlefile.rar`: Bản lưu trữ hoàn chỉnh các trang mẫu Band7Writing phục vụ tham chiếu thiết kế.
   - `ielts_fighter_page.html`, `book_inventory.txt`, `parsed_sections.json`, `download`: Dữ liệu phân tích và biên mục tài liệu đề thi mẫu.
   - `downloads-materials/`: Kho đề mẫu số hóa Cambridge, Collins, Mat Clark...
5. **Nhóm Cấu hình Hệ thống tại Root**:
   - `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.oxlintrc.json`, `.gitignore`, `index.html`, `README.md`.

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
