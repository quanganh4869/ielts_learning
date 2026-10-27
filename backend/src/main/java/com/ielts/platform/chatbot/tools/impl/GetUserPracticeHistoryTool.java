package com.ielts.platform.chatbot.tools.impl;

import com.ielts.platform.chatbot.tools.ChatbotTool;
import com.ielts.platform.chatbot.tools.ToolDefinition;
import com.ielts.platform.chatbot.tools.ToolResult;
import com.ielts.platform.study.model.PracticeSessionEntity;
import com.ielts.platform.study.repository.PracticeSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetUserPracticeHistoryTool implements ChatbotTool {

    private final PracticeSessionRepository practiceSessionRepository;

    @Override
    public ToolDefinition getDefinition() {
        return ToolDefinition.builder()
                .name("getUserPracticeHistory")
                .description("Lấy lịch sử các phiên luyện tập gần đây của học viên (Listening, Reading, Writing, Speaking).")
                .parameters(Map.of("type", "object", "properties", Map.of()))
                .build();
    }

    @Override
    public ToolResult execute(String currentUserId, Map<String, Object> arguments) {
        long start = System.currentTimeMillis();
        if (currentUserId == null || currentUserId.isBlank()) {
            return ToolResult.denied("getUserPracticeHistory", "Chưa xác thực danh tính người dùng");
        }

        var sessions = practiceSessionRepository.findByUserIdOrderByStartedAtDesc(
                currentUserId, PageRequest.of(0, 10)).getContent();

        List<Map<String, Object>> list = new ArrayList<>();
        for (PracticeSessionEntity s : sessions) {
            list.add(Map.of(
                    "skill", s.getSkill(),
                    "status", s.getStatus(),
                    "bandScore", s.getBandScore() != null ? s.getBandScore() : "Chưa chấm",
                    "correctAnswers", s.getCorrectAnswers(),
                    "totalQuestions", s.getTotalQuestions()
            ));
        }

        Map<String, Object> response = Map.of(
                "totalSessions", list.size(),
                "recentSessions", list
        );

        return ToolResult.success("getUserPracticeHistory", response, "Nhật ký luyện tập kỹ năng tại IELTS Platform", System.currentTimeMillis() - start);
    }
}
