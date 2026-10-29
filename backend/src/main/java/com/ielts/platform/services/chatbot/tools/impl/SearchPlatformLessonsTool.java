package com.ielts.platform.services.chatbot.tools.impl;

import java.util.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.db.model.LessonEntity;
import com.ielts.platform.db.repository.LessonRepository;
import com.ielts.platform.services.chatbot.tools.ChatbotTool;
import com.ielts.platform.services.chatbot.tools.ToolDefinition;
import com.ielts.platform.services.chatbot.tools.ToolResult;

@Slf4j
@Component
@RequiredArgsConstructor
public class SearchPlatformLessonsTool implements ChatbotTool {

    private final LessonRepository lessonRepository;

    @Override
    public ToolDefinition getDefinition() {
        return ToolDefinition.builder()
                .name("searchPlatformLessons")
                .description("Tìm kiếm danh sách bài học IELTS theo từ khóa trong kho học liệu nền tảng.")
                .parameters(Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "keyword", Map.of("type", "string", "description", "Từ khóa tìm kiếm bài học (ví dụ: 'writing', 'true false', 'grammar')")
                        )
                ))
                .build();
    }

    @Override
    public ToolResult execute(String currentUserId, Map<String, Object> arguments) {
        long start = System.currentTimeMillis();
        String keyword = arguments != null && arguments.get("keyword") != null ? arguments.get("keyword").toString().toLowerCase().trim() : "";

        List<LessonEntity> allLessons = lessonRepository.findAllByOrderBySortOrderAsc();
        List<Map<String, Object>> matched = new ArrayList<>();

        for (LessonEntity l : allLessons) {
            boolean match = keyword.isBlank() ||
                    (l.getTitle() != null && l.getTitle().toLowerCase().contains(keyword)) ||
                    (l.getType() != null && l.getType().toLowerCase().contains(keyword));
            if (match) {
                matched.add(Map.of(
                        "lessonId", l.getId(),
                        "title", l.getTitle(),
                        "type", l.getType(),
                        "durationMinutes", l.getDurationMinutes()
                ));
            }
            if (matched.size() >= 5) break;
        }

        Map<String, Object> response = Map.of(
                "query", keyword,
                "foundCount", matched.size(),
                "lessons", matched
        );

        return ToolResult.success("searchPlatformLessons", response, "Kho bài học chương trình IELTS Platform", System.currentTimeMillis() - start);
    }
}
