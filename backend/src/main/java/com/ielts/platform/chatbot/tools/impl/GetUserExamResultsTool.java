package com.ielts.platform.chatbot.tools.impl;

import com.ielts.platform.admin.questions.model.AssessmentAttemptEntity;
import com.ielts.platform.admin.questions.repository.AssessmentAttemptRepository;
import com.ielts.platform.chatbot.tools.ChatbotTool;
import com.ielts.platform.chatbot.tools.ToolDefinition;
import com.ielts.platform.chatbot.tools.ToolResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetUserExamResultsTool implements ChatbotTool {

    private final AssessmentAttemptRepository assessmentAttemptRepository;

    @Override
    public ToolDefinition getDefinition() {
        return ToolDefinition.builder()
                .name("getUserExamResults")
                .description("Lấy kết quả chi tiết các bài thi thử IELTS (Mock Tests) đã hoàn thành.")
                .parameters(Map.of("type", "object", "properties", Map.of()))
                .build();
    }

    @Override
    public ToolResult execute(String currentUserId, Map<String, Object> arguments) {
        long start = System.currentTimeMillis();
        if (currentUserId == null || currentUserId.isBlank()) {
            return ToolResult.denied("getUserExamResults", "Chưa xác thực danh tính người dùng");
        }

        var attempts = assessmentAttemptRepository.findByUserIdOrderByStartedAtDesc(
                currentUserId, PageRequest.of(0, 5)).getContent();

        List<Map<String, Object>> list = new ArrayList<>();
        for (AssessmentAttemptEntity a : attempts) {
            Map<String, Object> item = new HashMap<>();
            item.put("attemptId", a.getId());
            item.put("assessmentId", a.getAssessmentId());
            item.put("bandScore", a.getBandScore() != null ? a.getBandScore() : "Đang xử lý");
            item.put("rawScore", a.getScore() != null ? a.getScore() : 0);
            item.put("status", a.getStatus());
            item.put("completedAt", a.getCompletedAt() != null ? a.getCompletedAt().toString() : "");
            list.add(item);
        }

        Map<String, Object> response = Map.of(
                "totalCompletedExams", list.size(),
                "exams", list
        );

        return ToolResult.success("getUserExamResults", response, "Hồ sơ kết quả thi thử tại IELTS Platform", System.currentTimeMillis() - start);
    }
}
