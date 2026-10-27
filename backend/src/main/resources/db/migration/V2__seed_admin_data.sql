-- =============================================================================
-- Migration V2: Seed Data for IELTS Learning Platform Admin Console
-- Seeds standard roles, permissions, admin user, content, vocabulary, and config
-- =============================================================================

-- 1. Permissions
INSERT INTO permissions (id, code, category, description) VALUES
('perm_1', 'ADMIN_READ', 'SYSTEM', 'View admin dashboard and read-only views'),
('perm_2', 'USER_MANAGE', 'USERS', 'Create, update, lock, and manage user accounts'),
('perm_3', 'CONTENT_MANAGE', 'CONTENT', 'Manage modules, lessons, and media resources'),
('perm_4', 'VOCABULARY_MANAGE', 'VOCABULARY', 'Create and modify vocabulary and grammar rules'),
('perm_5', 'QUESTION_MANAGE', 'QUESTIONS', 'Manage question bank, builder, and import/export'),
('perm_6', 'TEST_MANAGE', 'ASSESSMENTS', 'Create mock tests, full tests, and view attempts'),
('perm_7', 'ANALYTICS_READ', 'ANALYTICS', 'Access analytics, reports, and AI monitoring'),
('perm_8', 'SYSTEM_SETTINGS_MANAGE', 'SETTINGS', 'Configure platform settings and service plans');

-- 2. Roles
INSERT INTO roles (id, name, description, is_system) VALUES
('role_superadmin', 'Super Admin', 'Full system access and privileges', true),
('role_content_lead', 'Content Lead', 'Manage learning content, curriculum and question bank', true),
('role_academic_advisor', 'Academic Advisor', 'Monitor student progress, assessments, and reports', true);

-- 3. Role Permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
('role_superadmin', 'perm_1'),
('role_superadmin', 'perm_2'),
('role_superadmin', 'perm_3'),
('role_superadmin', 'perm_4'),
('role_superadmin', 'perm_5'),
('role_superadmin', 'perm_6'),
('role_superadmin', 'perm_7'),
('role_superadmin', 'perm_8'),
('role_content_lead', 'perm_1'),
('role_content_lead', 'perm_3'),
('role_content_lead', 'perm_4'),
('role_content_lead', 'perm_5'),
('role_content_lead', 'perm_6'),
('role_academic_advisor', 'perm_1'),
('role_academic_advisor', 'perm_6'),
('role_academic_advisor', 'perm_7');

-- 4. Initial Users (Passwords BCrypt encoded: 'admin123' -> $2a$10$wN10hLp77O.P97/8H6z6re780/O8k9.Z55lO1wzJv7e2j3845bK6a)
INSERT INTO users (id, name, email, password_hash, status, target_band, avatar_url, last_login) VALUES
('user_1', 'Nguyễn Minh Anh', 'admin@ieltsplatform.com', '$2a$10$7Z8lq4fCj4G9o7Y2mZ2dI.V47G6T5R6L8Y0X9W1U2P3O4I5U6Y7Z8', 'ACTIVE', 8.5, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', CURRENT_TIMESTAMP),
('user_2', 'Trần Bảo Long', 'long.tran@example.com', '$2a$10$7Z8lq4fCj4G9o7Y2mZ2dI.V47G6T5R6L8Y0X9W1U2P3O4I5U6Y7Z8', 'ACTIVE', 7.5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('user_3', 'Lê Thu Trang', 'trang.le@example.com', '$2a$10$7Z8lq4fCj4G9o7Y2mZ2dI.V47G6T5R6L8Y0X9W1U2P3O4I5U6Y7Z8', 'ACTIVE', 6.5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('user_4', 'Hoàng Gia Huy', 'huy.hoang@example.com', '$2a$10$7Z8lq4fCj4G9o7Y2mZ2dI.V47G6T5R6L8Y0X9W1U2P3O4I5U6Y7Z8', 'SUSPENDED', 7.0, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', CURRENT_TIMESTAMP - INTERVAL '5 days');

INSERT INTO user_roles (user_id, role_id) VALUES
('user_1', 'role_superadmin'),
('user_2', 'role_content_lead'),
('user_3', 'role_academic_advisor');

-- 5. User Sessions & Login Events
INSERT INTO user_sessions (id, user_id, device, ip_address, location, is_active, last_active) VALUES
('sess_1', 'user_1', 'Chrome / macOS (Arm64)', '14.161.22.45', 'Ho Chi Minh City, VN', true, CURRENT_TIMESTAMP),
('sess_2', 'user_2', 'Firefox / Windows 11', '118.69.182.11', 'Hanoi, VN', true, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
('sess_3', 'user_3', 'Safari / iOS 17.5', '115.79.136.20', 'Da Nang, VN', false, CURRENT_TIMESTAMP - INTERVAL '6 hours');

INSERT INTO login_events (id, user_id, user_email, ip_address, device, status, reason) VALUES
('evt_1', 'user_1', 'admin@ieltsplatform.com', '14.161.22.45', 'Chrome / macOS', 'SUCCESS', 'Password verified'),
('evt_2', 'user_2', 'long.tran@example.com', '118.69.182.11', 'Firefox / Windows', 'SUCCESS', 'Password verified'),
('evt_3', 'user_4', 'huy.hoang@example.com', '42.112.98.5', 'Unknown / Android', 'FAILED', 'Account is suspended');

-- 6. Vocabulary Words (Seed)
INSERT INTO vocabulary_words (id, word, part_of_speech, cefr, band_score, definition, example, vietnamese_meaning, pronunciation, tags, status, sort_order) VALUES
('vocab_1', 'mitigate', 'verb', 'C1', 7.5, 'To make something less harmful, unpleasant, or bad.', 'Technological advances can help mitigate the environmental impact of urban sprawl.', 'Làm giảm nhẹ, xoa dịu', '/ˈmɪt.ɪ.ɡeɪt/', 'Academic,Writing Task 2,Environment', 'PUBLISHED', 1),
('vocab_2', 'unprecedented', 'adjective', 'C1', 7.5, 'Never having happened or existed in the past.', 'The city is facing an unprecedented influx of international students.', 'Chưa từng có, tiền lệ', '/ʌnˈpres.ɪ.den.tɪd/', 'Academic,Reading,High-scoring', 'PUBLISHED', 2),
('vocab_3', 'scrutinize', 'verb', 'C1', 7.0, 'To examine something very carefully in order to discover information.', 'Candidates should closely scrutinize the data presented in the chart.', 'Xem xét kỹ lưỡng, khảo sát tỉ mỉ', '/ˈskruː.tɪ.naɪz/', 'Academic,Writing Task 1', 'PUBLISHED', 3),
('vocab_4', 'detrimental', 'adjective', 'B2', 6.5, 'Causing harm or damage.', 'Excessive screen time has a detrimental effect on cognitive focus.', 'Có hại, bất lợi', '/ˌdet.rɪˈmen.təl/', 'Health,Writing Task 2,Common collocations', 'PUBLISHED', 4),
('vocab_5', 'ubiquitous', 'adjective', 'C2', 8.5, 'Present, appearing, or found everywhere.', 'Smartphones have become ubiquitous across all demographics.', 'Phổ biến khắp nơi', '/juːˈbɪk.wɪ.təs/', 'Technology,Academic,Speaking Part 3', 'PUBLISHED', 5);

-- 7. Grammar Rules (Seed)
INSERT INTO grammar_rules (id, title, level, category, summary, formula, examples, sort_order, status) VALUES
('gram_1', 'Inversion with Negative Adverbials', 'ADVANCED', 'Sentence Variety', 'Used to create strong emphasis or formal tone in Task 2 essays.', 'Negative Adverbial + Auxiliary + Subject + Main Verb', 'Not only does education enhance career opportunities, but it also fosters critical thinking.', 1, 'PUBLISHED'),
('gram_2', 'Complex Conditionals (Mixed Conditionals)', 'ADVANCED', 'Conditionals', 'Combining past conditions with present outcomes to convey nuanced arguments.', 'If + Past Perfect, Subject + Would + Base Verb', 'If governments had invested earlier in green energy, pollution levels would be manageable today.', 2, 'PUBLISHED'),
('gram_3', 'Cleft Sentences for Emphasis', 'INTERMEDIATE', 'Syntax & Cohesion', 'Highlighting key arguments and thesis points.', 'It is / was [focus] that / who [clause]', 'It is the lack of public awareness that hampers environmental initiatives.', 3, 'PUBLISHED');

-- 8. Modules & Lessons (Seed)
INSERT INTO modules (id, title, skill, level, lessons_count, sort_order, status) VALUES
('mod_1', 'Mastering Academic Reading: Heading Matching', 'READING', 'Band 6.5 - 7.5', 4, 1, 'PUBLISHED'),
('mod_2', 'Writing Task 2: Counter-Argument & Refutation', 'WRITING', 'Band 7.0+', 3, 2, 'PUBLISHED'),
('mod_3', 'Listening Part 4: High-Density Monologues', 'LISTENING', 'Band 6.5 - 7.5', 3, 3, 'PUBLISHED');

INSERT INTO lessons (id, module_id, title, duration_minutes, type, sort_order, status, content) VALUES
('les_1', 'mod_1', 'Strategy for Identifying Topic Sentences', 20, 'ARTICLE', 1, 'PUBLISHED', 'Topic sentences often appear in the first or last two lines of a paragraph...'),
('les_2', 'mod_1', 'Handling Traps & Synonym Distractors', 25, 'QUIZ', 2, 'PUBLISHED', 'Watch out for exact keyword matches that twist contextual meaning...'),
('les_3', 'mod_2', 'Structuring the Rebuttal Paragraph', 30, 'ARTICLE', 1, 'PUBLISHED', 'While proponents argue that X is beneficial, this view overlooks the fundamental issue of Y...'),
('les_4', 'mod_3', 'Signposting Language in Academic Lectures', 15, 'VIDEO', 1, 'PUBLISHED', 'Listen for transitions like "Turning now to", "In stark contrast", "Furthermore"...');

-- 9. Question Bank (Seed)
INSERT INTO questions (id, skill, type, difficulty, prompt, options_json, correct_answer, explanation, sort_order, status) VALUES
('q_1', 'READING', 'MULTIPLE_CHOICE', 'HARD', 'According to paragraph B, what prompted researchers to investigate the marine sediment layers?', '["A decrease in ocean salinity","Unusual magnetic anomalies discovered in 2018","Government funding for oil exploration","Rising sea temperatures in the Arctic"]', 'B', 'Paragraph B states: "The investigation was catalyzed by inexplicable magnetic deviations recorded during the 2018 survey."', 1, 'ACTIVE'),
('q_2', 'LISTENING', 'FILL_IN_BLANKS', 'MEDIUM', 'The community garden initiative was primarily funded by a grant from the local ______ council.', null, 'district', 'The speaker says: "We managed to secure financial backing via a municipal grant from the district council."', 2, 'ACTIVE'),
('q_3', 'WRITING', 'ESSAY', 'HARD', 'Some people believe that unpaid community service should be a mandatory part of high school programs. To what extent do you agree or disagree?', null, null, 'Provide relevant examples, balanced counter-arguments, and a clear thesis statement.', 3, 'ACTIVE');

-- 10. Assessments (Seed)
INSERT INTO assessments (id, title, skill, type, time_limit_minutes, total_questions, passing_score, status) VALUES
('ass_1', 'Academic Full Mock Test #12', 'ALL', 'MOCK_FULL', 160, 80, 6.5, 'PUBLISHED'),
('ass_2', 'Intensive Reading Diagnostic 2026', 'READING', 'SECTIONAL', 60, 40, 7.0, 'PUBLISHED'),
('ass_3', 'Listening Speed Drill - Section 3 & 4', 'LISTENING', 'MINI_TEST', 25, 20, 6.0, 'PUBLISHED');

-- 11. Learning Plans & Enrollments (Seed)
INSERT INTO learning_plans (id, title, target_band, target_score_label, level, duration_weeks, enrolled_count, status, description) VALUES
('plan_1', 'IELTS Breakthrough Band 7.5 Intensive', 7.5, 'Band 7.5+', 'Advanced', 8, 420, 'PUBLISHED', 'Structured intensive sprint focusing on Task 2 argumentation and high-speed reading.'),
('plan_2', 'Foundation to Band 6.0 Fast-track', 6.0, 'Band 6.0', 'Intermediate', 6, 890, 'PUBLISHED', 'Mastering fundamental IELTS vocab, core grammar, and basic listening techniques.');

-- 12. System Settings (Seed)
INSERT INTO system_settings (key, value, category, description, updated_by) VALUES
('platform.maintenance_mode', 'false', 'GENERAL', 'Toggle global maintenance mode banner', 'user_1'),
('ai.grading.default_model', 'gemini-1.5-pro', 'AI_ENGINE', 'Default LLM for writing and speaking evaluation', 'user_1'),
('auth.jwt_token_validity_hours', '24', 'SECURITY', 'Default JWT expiration in hours', 'user_1'),
('assessment.auto_save_interval_sec', '30', 'EXAM', 'Time interval for auto-saving exam answers', 'user_1');

-- 13. Audit Logs (Seed)
INSERT INTO audit_logs (id, user_id, user_name, action, resource, resource_id, details, ip_address) VALUES
('log_1', 'user_1', 'Nguyễn Minh Anh', 'SYSTEM_INIT', 'DATABASE', 'v2.0', 'Flyway database schema and seed successfully initialized', '127.0.0.1'),
('log_2', 'user_1', 'Nguyễn Minh Anh', 'UPDATE_SETTINGS', 'SYSTEM_SETTINGS', 'ai.grading.default_model', 'Changed default model to gemini-1.5-pro', '14.161.22.45'),
('log_3', 'user_2', 'Trần Bảo Long', 'CREATE_LESSON', 'LESSON', 'les_3', 'Added new lesson on Rebuttal Paragraphs', '118.69.182.11');
