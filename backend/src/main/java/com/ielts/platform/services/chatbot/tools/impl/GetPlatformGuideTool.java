package com.ielts.platform.services.chatbot.tools.impl;

import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.db.repository.KnowledgeChunkRepository;
import com.ielts.platform.services.chatbot.tools.ChatbotTool;
import com.ielts.platform.services.chatbot.tools.ToolDefinition;
import com.ielts.platform.services.chatbot.tools.ToolResult;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetPlatformGuideTool implements ChatbotTool {

    private final KnowledgeChunkRepository knowledgeChunkRepository;

    @Override
    public ToolDefinition getDefinition() {
        return ToolDefinition.builder()
                .name("getPlatformGuide")
                .description("Tra cứu tài liệu hướng dẫn chính thức về cách sử dụng các tính năng trên trang IELTS Platform.")
                .parameters(Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "feature", Map.of("type", "string", "description", "Tên tính năng cần tra cứu (ví dụ: 'dashboard', 'practice', 'mock_tests', 'onboarding')")
                        )
                ))
                .build();
    }

    @Override
    public ToolResult execute(String currentUserId, Map<String, Object> arguments) {
        long start = System.currentTimeMillis();
        String feature = arguments != null && arguments.get("feature") != null ? arguments.get("feature").toString().toLowerCase().trim() : "general";

        var chunks = knowledgeChunkRepository.searchApprovedChunks(feature, 3);
        if (chunks.isEmpty()) {
            chunks = knowledgeChunkRepository.searchApprovedChunks("IELTS", 3);
        }

        List<String> guidelines = chunks.stream().map(c -> c.getContent()).toList();
        Map<String, Object> response = Map.of(
                "feature", feature,
                "guidelines", guidelines
        );

        return ToolResult.success("getPlatformGuide", response, "Tài liệu hướng dẫn sử dụng IELTS Learning Platform", System.currentTimeMillis() - start);
    }
}
