# BACKEND ARCHITECTURE & ADMIN API SPECIFICATION
**IELTS Learning Platform — Enterprise Spring Boot 3.3.5 / Java 17 LTS**

---

## 1. Tổng Quan Kiến Trúc (Architectural Overview)

Backend Admin được thiết kế theo kiến trúc **Modular Monolith** kết hợp **Domain-Driven Design (DDD)** và **Layered Clean Architecture**. 

```
backend/
├── pom.xml                                 # Maven dependencies & plugins (Spring Boot 3.3.5, Java 17)
├── src/main/resources/
│   ├── application.yml                     # Cấu hình production/dev (PostgreSQL, JWT, HikariCP, Flyway, Swagger)
│   └── db/migration/
│       ├── V1__init_admin_schema.sql       # DDL: 13 bảng thực thể, foreign keys, indexes, constraints
│       └── V2__seed_admin_data.sql         # Seed: Quyền hạn, vai trò, user mẫu, từ vựng, ngữ pháp, đề thi
└── src/main/java/com/ielts/platform/
    ├── IeltsAdminApplication.java          # Entry point Spring Boot + JPA Auditing
    ├── config/                             # Security, OpenApi Swagger, CORS, Jackson
    ├── security/                           # JWT Authentication Filter, Provider, RBAC, UserPrincipal
    ├── common/                             # ApiResponse<T>, PageResponse<T>, ErrorCode, GlobalExceptionHandler
    └── admin/                              # Domain Packages (Controller, Service, Repository, Entity, DTO)
        ├── users/                          # User accounts, roles, permissions, sessions, login events
        ├── audit/                          # Audit logs & tracking actions
        ├── dashboard/                      # Dashboard summary, 7-day activity metrics, attention items
        ├── vocabulary/                     # Vocabulary bank, CEFR, band scores, definitions, audio
        ├── content/                        # Modules, Lessons, Grammar rules, Media asset library
        ├── questions/                      # Question builder, Mock tests, Assessments, Learning plans
        └── settings/                       # System key-value configurations & platform toggles
```

---

## 2. Mô Hình Phân Quyền & Bảo Mật (RBAC & Security)

### Quyền Hạn (Permissions)
- `ADMIN_READ`: Xem bảng điều khiển và các tài nguyên quản trị chế độ đọc.
- `USER_MANAGE`: Tạo, cập nhật, khóa/mở khóa tài khoản học viên và quản trị viên.
- `CONTENT_MANAGE`: Quản lý chương trình học, Modules, Bài học, Kho media.
- `VOCABULARY_MANAGE`: Quản lý kho từ vựng IELTS, quy tắc ngữ pháp.
- `QUESTION_MANAGE`: Quản lý ngân hàng câu hỏi, builder và import/export.
- `TEST_MANAGE`: Quản lý đề thi mock test, full test, theo dõi bài làm của thí sinh.
- `ANALYTICS_READ`: Truy cập báo cáo phân tích, theo dõi AI scoring task.
- `SYSTEM_SETTINGS_MANAGE`: Cấu hình hệ thống, tham số vận hành.

### Vai Trò (Roles)
- **Super Admin**: Sở hữu 100% permissions trên toàn hệ thống.
- **Content Lead**: Quản lý nội dung học thuật, từ vựng, đề thi (`CONTENT_MANAGE`, `VOCABULARY_MANAGE`, `QUESTION_MANAGE`, `TEST_MANAGE`).
- **Academic Advisor**: Xem tiến độ học tập, kết quả bài thi học viên (`ADMIN_READ`, `TEST_MANAGE`, `ANALYTICS_READ`).

---

## 3. Danh Mục REST API Chính

| Method | Endpoint | Quyền Yêu Cầu | Mô Tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | *Public* | Xác thực email/password, trả về Bearer JWT token |
| `GET` | `/api/v1/admin/dashboard/summary` | `ADMIN_READ` | Thống kê KPIs, biểu đồ học tập 7 ngày, việc cần chú ý |
| `GET` | `/api/v1/admin/users` | `USER_MANAGE` | Tìm kiếm, lọc và phân trang danh sách người dùng |
| `POST` | `/api/v1/admin/users` | `USER_MANAGE` | Tạo tài khoản người dùng / quản trị viên mới |
| `PATCH`| `/api/v1/admin/users/{id}/status` | `USER_MANAGE` | Khóa hoặc kích hoạt tài khoản (`ACTIVE`, `SUSPENDED`) |
| `GET` | `/api/v1/admin/vocabulary` | `VOCABULARY_MANAGE` | Tìm kiếm kho từ vựng theo từ, CEFR, trạng thái |
| `POST` | `/api/v1/admin/vocabulary` | `VOCABULARY_MANAGE` | Thêm từ mới vào từ điển IELTS |
| `PUT` | `/api/v1/admin/vocabulary/{id}` | `VOCABULARY_MANAGE` | Chỉnh sửa định nghĩa, ví dụ, nghĩa tiếng Việt |
| `DELETE`| `/api/v1/admin/vocabulary/{id}` | `VOCABULARY_MANAGE` | Xóa từ vựng khỏi ngân hàng dữ liệu |
| `GET` | `/api/v1/admin/content/modules` | `CONTENT_MANAGE` | Lấy danh sách modules học tập theo thứ tự |
| `POST` | `/api/v1/admin/content/modules` | `CONTENT_MANAGE` | Tạo module học tập mới |
| `GET` | `/api/v1/admin/content/modules/{id}/lessons` | `CONTENT_MANAGE` | Lấy các bài học thuộc module |
| `POST` | `/api/v1/admin/content/lessons` | `CONTENT_MANAGE` | Tạo bài học mới |
| `GET` | `/api/v1/admin/questions` | `QUESTION_MANAGE` | Tìm kiếm ngân hàng câu hỏi theo skill, type, prompt |
| `POST` | `/api/v1/admin/questions` | `QUESTION_MANAGE` | Thêm câu hỏi vào ngân hàng đề thi |
| `GET` | `/api/v1/admin/assessments` | `TEST_MANAGE` | Danh sách bài thi thử / Mock tests |
| `GET` | `/api/v1/admin/audit-logs` | `ADMIN_READ` | Xem nhật ký audit trail các thao tác hệ thống |
| `GET` | `/api/v1/admin/settings` | `SYSTEM_SETTINGS_MANAGE` | Xem toàn bộ cấu hình hệ thống |
| `PATCH`| `/api/v1/admin/settings/{key}` | `SYSTEM_SETTINGS_MANAGE` | Cập nhật cấu hình hệ thống |

---

## 4. Swagger UI & Kiểm Thử
- **OpenAPI 3.0 Specs**: `http://localhost:8080/api/v1/v3/api-docs`
- **Swagger Interactive UI**: `http://localhost:8080/api/v1/swagger-ui.html`
- **Test Command**: Chạy `mvn test` từ thư mục `backend/` để thực thi toàn bộ unit & integration tests với in-memory H2 database.
