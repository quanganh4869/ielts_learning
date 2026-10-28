# Database Schema Migration Plan (Expand-and-Contract)
**IELTS Learning Platform — Production Database Migration Guide**
**Migration Script:** `V7__system_cleanup_and_target_schema_alignment.sql`  
**Framework:** Flyway Core  
**Risk Level:** LOW (Non-destructive, backward-compatible, additive constraints & deprecation metadata)

---

## 1. Migration Strategy: Expand-and-Contract

To guarantee zero downtime and 100% data preservation on production:
1. **Phase 1 (Expand):** Add any missing composite indexes (`user_vocabulary(user_id, next_review_at)`), enforce foreign key cascades, and document schema comments.
2. **Phase 2 (Migrate Consumers):** Ensure all backend repositories query `file_metadata` instead of legacy `media_assets`.
3. **Phase 3 (Deprecate):** Mark `permissions`, `role_permissions`, `service_plans`, `enrollments`, and `media_assets` with SQL comments and view wrappers rather than executing destructive `DROP TABLE` commands immediately.

---

## 2. Table-to-Table Mapping Matrix

| Old Table | New / Target Equivalent | Migration Action | Data Retention Plan |
|---|---|---|---|
| `media_assets` | `file_metadata` | Migrate existing rows to `file_metadata` where `bucket_name='ielts-platform-storage'`. | 100% Retained; `media_assets` preserved as legacy read-only. |
| `permissions` | Role-based policies (`roles`) | Soft-deprecated. No data dropped. | 100% Preserved for audit integrity. |
| `role_permissions` | Role-based policies (`roles`) | Soft-deprecated. | 100% Preserved. |
| `service_plans` | `system_settings` (for future flags) | Soft-deprecated. | 100% Preserved. |
| `enrollments` | Direct user progress tracking | Soft-deprecated. | 100% Preserved. |

---

## 3. Rollback & Verification Procedure

- **Pre-Migration Baseline:**
  - Execute row count verification: `SELECT count(*) FROM users`, `SELECT count(*) FROM assessment_attempts`.
- **Flyway Application:**
  - Standard Flyway execution automatically records checksum in `flyway_schema_history`.
- **Post-Migration Verification:**
  - Verify that Spring Boot boots cleanly with `ddl-auto: validate`.
  - Execute full test suite (`mvn test`) across all 96 unit and integration tests.
