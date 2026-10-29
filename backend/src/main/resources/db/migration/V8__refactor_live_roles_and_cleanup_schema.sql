-- =============================================================================
-- Migration V8: Live Supabase Refactoring - Streamline Roles & Drop Unused Tables
-- =============================================================================

-- 1. Drop unused enrollments table
DROP TABLE IF EXISTS enrollments CASCADE;

-- 2. Remap user roles to strictly Admin and Student
UPDATE user_roles 
SET role_id = 'role_admin' 
WHERE user_id IN (SELECT id FROM users WHERE email IN ('quanganhqb04@gmail.com', 'admin@ieltsplatform.com', 'anhquangnguyen2k4@gmail.com'));

UPDATE user_roles 
SET role_id = 'role_student' 
WHERE role_id IN ('role_content_lead', 'role_academic_advisor', 'role_superadmin');

-- 3. Delete redundant roles from roles table
DELETE FROM role_permissions WHERE role_id IN ('role_superadmin', 'role_content_lead', 'role_academic_advisor');
DELETE FROM roles WHERE id IN ('role_superadmin', 'role_content_lead', 'role_academic_advisor');
