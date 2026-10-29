package com.ielts.platform.core.security;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.db.model.ScopeClassification;

@Slf4j
@Component
public class ScopeGuard {

    private static final List<String> PROMPT_INJECTION_KEYWORDS = List.of(
            "ignore previous instructions", "ignore all previous", "bypass system", "bypass rule",
            "show system prompt", "reveal system prompt", "what is your system prompt",
            "you are now dan", "act as unrestricted", "override security",
            "drop table", "select * from users", "admin password", "secret key"
    );

    private static final Pattern PERSONAL_DATA_PATTERN = Pattern.compile(
            "(điểm của tôi|band của tôi|tôi đang ở band|tiến độ|học được bao nhiêu|mục tiêu|sổ từ|từ vựng đã lưu|bài thi gần nhất|lịch sử làm bài|kết quả thi|my score|my band|my progress|my vocabulary)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern PLATFORM_HELP_PATTERN = Pattern.compile(
            "(làm sao để|hướng dẫn sử dụng|tính năng|cách dùng|bắt đầu học|nền tảng|website này|chức năng|thi thử ở đâu|luyện thi ở đâu|lộ trình học là gì|how to use|platform guide)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern IELTS_KNOWLEDGE_PATTERN = Pattern.compile(
            "(ielts|writing|reading|listening|speaking|task 1|task 2|true false not given|tfng|inversion|ngữ pháp|từ vựng|collocation|paraphrase|band 7|band 8|tiêu chí|coherence|lexical|grammar|essay|chủ đề|mẹo làm bài)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern PRACTICE_PATTERN = Pattern.compile(
            "(chấm giúp|sửa giúp|nhận xét câu|cho tôi bài tập|luyện tập|thực hành|sửa lỗi|check this sentence|evaluate)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern OUT_OF_SCOPE_PATTERN = Pattern.compile(
            "(thời tiết|nấu ăn|chiêm tinh|tử vi|bóng đá|chính trị|tổng thống|giá vàng|bitcoin|chứng khoán|kể chuyện ma|viết code python|hack wifi|tâm sự tình yêu)",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Evaluates user input against safety boundaries and IELTS specific domain.
     */
    public ScopeClassification classify(String input) {
        if (input == null || input.trim().isBlank()) {
            return ScopeClassification.NEEDS_CLARIFICATION;
        }

        String normalized = input.toLowerCase(Locale.ROOT).trim();

        // 1. Check prompt injection
        for (String inj : PROMPT_INJECTION_KEYWORDS) {
            if (normalized.contains(inj)) {
                log.warn("Blocked potential prompt injection pattern: '{}'", inj);
                return ScopeClassification.UNSAFE_OR_UNAUTHORIZED;
            }
        }

        // 2. Check clear out-of-scope questions
        if (OUT_OF_SCOPE_PATTERN.matcher(normalized).find()) {
            return ScopeClassification.OUT_OF_SCOPE;
        }

        // 3. Check personal learning data requests
        if (PERSONAL_DATA_PATTERN.matcher(normalized).find()) {
            return ScopeClassification.PERSONAL_LEARNING_DATA;
        }

        // 4. Check platform help requests
        if (PLATFORM_HELP_PATTERN.matcher(normalized).find()) {
            return ScopeClassification.PLATFORM_HELP;
        }

        // 5. Check supported practice requests
        if (PRACTICE_PATTERN.matcher(normalized).find()) {
            return ScopeClassification.SUPPORTED_PRACTICE;
        }

        // 6. Check IELTS knowledge domain
        if (IELTS_KNOWLEDGE_PATTERN.matcher(normalized).find()) {
            return ScopeClassification.IELTS_KNOWLEDGE;
        }

        // Default: If input is long enough, treat as general IELTS learning question; otherwise ask clarification
        if (normalized.length() > 5) {
            return ScopeClassification.IELTS_KNOWLEDGE;
        }

        return ScopeClassification.NEEDS_CLARIFICATION;
    }

    /**
     * Standard polite refusal message when input is out of scope.
     */
    public String getOutOfScopeRefusalMessage() {
        return "Xin lỗi bạn, tôi là Trợ lý AI chuyên biệt của **IELTS Learning Platform**. Tôi chỉ có thể hỗ trợ các nội dung liên quan đến kiến thức luyện thi IELTS (Nghe, Đọc, Viết, Nói, Từ vựng, Ngữ pháp, Chiến lược làm bài) và hướng dẫn sử dụng các chức năng trên hệ thống.\n\nBạn có muốn hỏi về mẹo làm bài IELTS hoặc tra cứu tiến độ học tập của mình không?";
    }

    /**
     * Standard safety refusal when malicious instruction or prompt injection is detected.
     */
    public String getUnsafeRefusalMessage() {
        return "Yêu cầu của bạn không phù hợp với tiêu chuẩn an toàn của hệ thống. Tôi chỉ hỗ trợ các câu hỏi học tập và luyện thi IELTS chính thống.";
    }

    /**
     * Verifies that the model output does not leak backend system prompt or internal secrets.
     */
    public boolean isOutputSafe(String output) {
        if (output == null) return true;
        String lower = output.toLowerCase(Locale.ROOT);
        return !lower.contains("supabase_service_role") &&
                !lower.contains("jwt_secret") &&
                !lower.contains("r2_secret_access_key") &&
                !lower.contains("<system_instructions>");
    }
}
