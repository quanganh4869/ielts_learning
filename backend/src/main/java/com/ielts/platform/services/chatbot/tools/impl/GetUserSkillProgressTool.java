package com.ielts.platform.services.chatbot.tools.impl;

import java.util.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.db.model.AssessmentAttemptEntity;
import com.ielts.platform.db.repository.AssessmentAttemptRepository;
import com.ielts.platform.services.chatbot.tools.ChatbotTool;
import com.ielts.platform.services.chatbot.tools.ToolDefinition;
import com.ielts.platform.services.chatbot.tools.ToolResult;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetUserSkillProgressTool implements ChatbotTool {

    private final AssessmentAttemptRepository assessmentAttemptRepository;

    @Override
    public ToolDefinition getDefinition() {
        return ToolDefinition.builder()
                .name("getUserSkillProgress")
                .description("Lấy tiến độ và điểm số thực tế các kỹ năng (Listening, Reading, Writing, Speaking) từ các bài thi đã làm của học viên.")
                .parameters(Map.of("type", "object", "properties", Map.of()))
                .build();
    }

    @Override
    public ToolResult execute(String currentUserId, Map<String, Object> arguments) {
        long start = System.currentTimeMillis();
        if (currentUserId == null || currentUserId.isBlank()) {
            return ToolResult.denied("getUserSkillProgress", "Chưa xác thực danh tính người dùng");
        }

        var attempts = assessmentAttemptRepository.findByUserIdOrderByStartedAtDesc(
                currentUserId, PageRequest.of(0, 20)).getContent();

        if (attempts.isEmpty()) {
            Map<String, Object> emptyData = Map.of(
                    "hasData", false,
                    "message", "Học viên chưa hoàn thành bài thi thử hoặc đánh giá nào trên hệ thống."
            );
            return ToolResult.success("getUserSkillProgress", emptyData, "Dữ liệu lịch sử làm bài tại IELTS Platform", System.currentTimeMillis() - start);
        }

        OptionalDouble avgScore = attempts.stream()
                .filter(a -> a.getBandScore() != null)
                .mapToDouble(a -> a.getBandScore().doubleValue())
                .average();

        Map<String, Object> result = new HashMap<>();
        result.put("hasData", true);
        result.put("totalAttempts", attempts.size());
        result.put("averageBandScore", avgScore.isPresent() ? Math.round(avgScore.getAsDouble() * 10.0) / 10.0 : null);
        result.put("latestAttemptBand", attempts.get(0).getBandScore());
        result.put("latestAttemptDate", attempts.get(0).getStartedAt() != null ? attempts.get(0).getStartedAt().toString() : null);

        return ToolResult.success("getUserSkillProgress", result, "Thống kê điểm số từ hệ thống làm bài thi IELTS Platform", System.currentTimeMillis() - start);
    }
}
