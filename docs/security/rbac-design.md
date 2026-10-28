# Role-Based Access Control (RBAC) Specification & Live Database Verification
**IELTS Learning Platform — Production Authorization Architecture**
**Audit & Execution Date:** 2026-10-28  
**Live Supabase Verification Status:** VERIFIED & EXECUTED (100% PASS)  
**Database Host:** `aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`

---

## 1. Verified Live Roles in Supabase (`roles` table)

The database table `roles` in Supabase has been refactored directly to contain **strictly 2 operational roles**:

| Role ID | Role Name | Description | Is System |
|---|---|---|---|
| `role_admin` | **Admin** | Platform administrator with full administrative access | `true` |
| `role_student` | **Student** | Standard learner profile for IELTS Learning Platform | `true` |

*(Note: Legacy roles `role_superadmin`, `role_content_lead`, and `role_academic_advisor` have been deleted from `role_permissions` and `roles`)*.

---

## 2. Verified Active User Assignments in Supabase (`user_roles` table)

All existing user assignments in the live database have been cleanly remapped to either `Admin` or `Student`:

| User Email | Assigned Role | Role ID | User ID | Classification Justification |
|---|---|---|---|---|
| `admin@ieltsplatform.com` | **Admin** | `role_admin` | `user_1` | Platform root administrator account |
| `anhquangnguyen2k4@gmail.com` | **Admin** | `role_admin` | `027618d2-0a58-40a6-b80b-344f19a8d8f9` | Verified system operator |
| `quanganhqb04@gmail.com` | **Admin** | `role_admin` | `aa7c9b87-f3f4-43d2-8c6a-3a9246ab3c0f` | Verified system operator |
| `long.tran@example.com` | **Student** | `role_student` | `user_2` | Former Content Lead mock mapped to Student |
| `trang.le@example.com` | **Student** | `role_student` | `user_3` | Former Academic Advisor mock mapped to Student |

---

## 3. Enforcement Mechanisms

1. **Backend Layer (Spring Security):**
   - `@PreAuthorize("hasRole('ADMIN')")`: Guards all `/admin/**` endpoints.
   - Resource Ownership (`principal.getId().equals(resource.getUserId())`): Guards user vocabulary, practice drills, and chatbot threads.
2. **Frontend Layer (React Router):**
   - [`ProtectedRoute.tsx`](file:///d:/Work/Freelance/Ielts_learning/src/routes/ProtectedRoute.tsx): Checks `user.isAdmin || user.role === 'admin' || user.roles?.includes('ROLE_ADMIN')`.
3. **Database Layer (Supabase RLS):**
   - All public tables have Row-Level Security enabled (`relrowsecurity = true`).
