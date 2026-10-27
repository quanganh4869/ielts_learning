-- V6: AI Chatbot, Tool Calling Audit, and Approved IELTS Knowledge Base Schema

-- 1. Chat Conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Hội thoại IELTS mới',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id, updated_at DESC);

-- 2. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL, -- 'user', 'assistant', 'system', 'tool'
    content TEXT NOT NULL,
    latency_ms BIGINT DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'FAILED', 'FILTERED'
    citations JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, created_at ASC);

-- 3. Tool Calls Audit & Security Log
CREATE TABLE IF NOT EXISTS chat_tool_calls (
    id VARCHAR(64) PRIMARY KEY,
    message_id VARCHAR(64) NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    tool_name VARCHAR(128) NOT NULL,
    input_arguments JSONB DEFAULT '{}'::jsonb,
    output_result JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'DENIED'
    execution_time_ms BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_tool_calls_msg ON chat_tool_calls(message_id);

-- 4. Knowledge Documents (Approved Corpus for RAG)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'IELTS_ACADEMIC', -- 'PLATFORM_GUIDE', 'IELTS_ACADEMIC', 'GRAMMAR', 'VOCABULARY', 'EXAM_STRATEGY'
    source_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    file_hash VARCHAR(128) NOT NULL,
    r2_key VARCHAR(512),
    status VARCHAR(32) NOT NULL DEFAULT 'APPROVED', -- 'UPLOADED', 'PROCESSING', 'APPROVED', 'REJECTED', 'INDEXED', 'ARCHIVED'
    version INT NOT NULL DEFAULT 1,
    uploaded_by VARCHAR(64) NOT NULL DEFAULT 'system_admin',
    approved_by VARCHAR(64) DEFAULT 'system_admin',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_status ON knowledge_documents(status, category);

-- 5. Knowledge Chunks
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    section_title VARCHAR(255),
    token_count INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc ON knowledge_chunks(document_id, chunk_index);

-- Seed Authentic Platform Knowledge & IELTS Guidelines into Knowledge Base
INSERT INTO knowledge_documents (id, title, category, source_filename, file_size, file_hash, status, version, uploaded_by, approved_by)
VALUES
('doc_guide_001', 'Hướng dẫn sử dụng nền tảng IELTS Learning Platform', 'PLATFORM_GUIDE', 'platform_guide_v1.md', 4500, 'h_guide_001', 'APPROVED', 1, 'admin', 'admin'),
('doc_ielts_001', 'Tiêu chuẩn chấm điểm IELTS Writing Task 2 và cấu trúc bài luận Band 7+', 'EXAM_STRATEGY', 'ielts_writing_task2_guide.md', 6800, 'h_writing_001', 'APPROVED', 1, 'admin', 'admin'),
('doc_ielts_002', 'Chiến lược làm bài IELTS Reading: Phân biệt True, False và Not Given', 'EXAM_STRATEGY', 'ielts_reading_tfng_strategy.md', 5200, 'h_reading_001', 'APPROVED', 1, 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO knowledge_chunks (id, document_id, chunk_index, content, section_title, token_count)
VALUES
('chunk_g_01', 'doc_guide_001', 0, 'IELTS Learning Platform cung cấp 6 module chính: 1. Tổng quan (Dashboard) xem mục tiêu band, streak ngày học và phân tích điểm kỹ năng. 2. Lộ trình học (Learning Path) thiết kế cá nhân hóa theo tuần và giai đoạn. 3. Luyện thi (Practice) gồm 4 kỹ năng Nghe, Đọc, Viết, Nói kèm trò chơi ngữ pháp Sentence Garden. 4. Thi thử (Mock Tests) mô phỏng phòng thi chuẩn Cambridge có tính giờ. 5. Trợ lý AI (AI Tutor) hỗ trợ giải thích bài tập, tra cứu từ vựng và chấm điểm sơ bộ. 6. Thống kê (Statistics) đo lường tiến độ chi tiết.', 'Giới thiệu các chức năng hệ thống', 180),
('chunk_g_02', 'doc_guide_001', 1, 'Cách bắt đầu học tập: Người dùng mới nên hoàn thành bài Đánh giá năng lực đầu vào (Placement Assessment) tại trang Onboarding để hệ thống ước tính band điểm xuất phát và tự động gợi ý lộ trình học phù hợp nhất.', 'Quy trình Onboarding và kiểm tra đầu vào', 95),
('chunk_w_01', 'doc_ielts_001', 0, 'Tiêu chí chấm điểm IELTS Writing gồm 4 tiêu chí có trọng số bằng nhau (25% mỗi tiêu chí): 1. Task Achievement / Task Response (Mức độ hoàn thành yêu cầu đề bài). 2. Coherence and Cohesion (Tính mạch lạc và liên kết câu/đoạn). 3. Lexical Resource (Vốn từ vựng học thuật, collocations, paraphrase chính xác). 4. Grammatical Range and Accuracy (Sự đa dạng và độ chính xác của các cấu trúc ngữ pháp phức).', '4 Tiêu chí chấm điểm IELTS Writing', 160),
('chunk_w_02', 'doc_ielts_001', 1, 'Cấu trúc bài luận IELTS Writing Task 2 chuẩn 4 đoạn (Band 7.0+): Mở bài (Introduction) gồm 2 câu: Paraphrase câu chủ đề đề bài + Thesis Statement nêu rõ quan điểm cá nhân. Thân bài 1 (Body 1) triển khai luận điểm 1 theo công thức P-E-E (Point, Explanation, Example). Thân bài 2 (Body 2) triển khai luận điểm 2 theo công thức P-E-E. Kết bài (Conclusion) tóm tắt lại 2 luận điểm chính và khẳng định lại quan điểm.', 'Cấu trúc bài luận 4 đoạn Task 2', 150),
('chunk_r_01', 'doc_ielts_002', 0, 'Quy tắc phân biệt True, False và Not Given trong IELTS Reading: 1. TRUE: Thông tin trong câu hỏi hoàn toàn trùng khớp hoặc tương đương ngữ nghĩa (paraphrase) với thông tin trong bài đọc. 2. FALSE: Thông tin trong câu hỏi mâu thuẫn trực tiếp (contradicts) với thông tin trong bài đọc. 3. NOT GIVEN: Thông tin không được đề cập trong bài, hoặc bài đọc chỉ nói một phần nhưng không thể khẳng định hay phủ định toàn bộ câu hỏi. Lưu ý: Không tự suy diễn từ kiến thức thực tế ngoài đời thực.', 'Quy tắc TRUE / FALSE / NOT GIVEN', 165)
ON CONFLICT (id) DO NOTHING;
