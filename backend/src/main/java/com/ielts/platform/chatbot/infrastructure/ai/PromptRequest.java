package com.ielts.platform.chatbot.infrastructure.ai;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Builder
public class PromptRequest {
    private final String systemPrompt;
    private final List<Map<String, String>> conversationHistory; // list of {role: "user|assistant", content: "..."}
    private final String userMessage;
    private final List<Map<String, Object>> toolSchemas;
    @Builder.Default
    private final double temperature = 0.3;
    @Builder.Default
    private final int maxTokens = 1200;
}
