package com.ielts.platform.chatbot.infrastructure.ai;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AIResponse {
    private final String content;
    private final List<ToolCallRequest> toolCalls;
    private final String finishReason;
    private final long latencyMs;
    private final String modelName;
    private final boolean fallbackUsed;

    public boolean hasToolCalls() {
        return toolCalls != null && !toolCalls.isEmpty();
    }
}
