package com.ielts.platform.chatbot.infrastructure.ai;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class ToolCallRequest {
    private final String id;
    private final String toolName;
    private final Map<String, Object> arguments;
}
