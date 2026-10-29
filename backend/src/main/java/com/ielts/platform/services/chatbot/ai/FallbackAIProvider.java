package com.ielts.platform.services.chatbot.ai;

import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.schemas.chatbot.AIResponse;
import com.ielts.platform.schemas.chatbot.PromptRequest;

@Slf4j
@Component
public class FallbackAIProvider implements AIProvider {

    @Override
    public boolean isConfigured() {
        return true;
    }

    @Override
    public String getProviderName() {
        return "Deterministic Fallback Provider";
    }

    @Override
    public AIResponse generateResponse(PromptRequest request) {
        long start = System.currentTimeMillis();
        String userQuery = request.getUserMessage() != null ? request.getUserMessage().toLowerCase() : "";

        // If tools returned data or system prompt contains verified context:
        StringBuilder sb = new StringBuilder();
        if (userQuery.contains("tiêu chí") || userQuery.contains("writing")) {
            sb.append("Theo tiêu chuẩn khảo thí IELTS chính thức, bài thi **Writing Task 2** được đánh giá dựa trên 4 tiêu chí đồng trọng số (25% mỗi tiêu chí):\n\n")
              .append("1. **Task Achievement / Task Response:** Trả lời trực diện, đầy đủ tất cả các phần của đề bài.\n")
              .append("2. **Coherence & Cohesion:** Tính mạch lạc và liên kết logic giữa các câu, đoạn (dùng công thức P-E-E).\n")
              .append("3. **Lexical Resource:** Sử dụng linh hoạt collocations học thuật và paraphrase chính xác.\n")
              .append("4. **Grammatical Range & Accuracy:** Sử dụng đa dạng các cấu trúc câu phức và kiểm soát lỗi ngữ pháp.\n\n")
              .append("*(Nguồn trích dẫn: Tài liệu hướng dẫn IELTS Writing Task 2 đã phê duyệt)*");
        } else if (userQuery.contains("true false") || userQuery.contains("tfng")) {
            sb.append("Quy tắc phân biệt **TRUE, FALSE và NOT GIVEN** trong IELTS Reading:\n\n")
              .append("- **TRUE:** Thông tin hoàn toàn đồng nhất hoặc được paraphrase tương đương nghĩa với bài đọc.\n")
              .append("- **FALSE:** Thông tin đối lập trực tiếp (contradicts) với bài đọc.\n")
              .append("- **NOT GIVEN:** Bài đọc không nhắc tới hoặc không đủ dữ kiện để kết luận.\n\n")
              .append("*(Lưu ý: Tuyệt đối không suy diễn từ kiến thức đời thực ngoài bài đọc!)*");
        } else {
            sb.append("Tôi đã nhận được câu hỏi của bạn. Hệ thống AI Provider chính đang chạy ở chế độ bảo vệ khi chưa cấu hình khóa API trực tuyến (`AI_API_KEY`).\n\n")
              .append("Bạn có thể đặt câu hỏi về các chủ đề IELTS chính thống như tiêu chí chấm Writing, mẹo Reading True/False/Not Given, hoặc kiểm tra tiến độ học tập cá nhân.");
        }

        return AIResponse.builder()
                .content(sb.toString())
                .finishReason("stop")
                .latencyMs(System.currentTimeMillis() - start)
                .modelName("fallback-engine")
                .fallbackUsed(true)
                .build();
    }
}
