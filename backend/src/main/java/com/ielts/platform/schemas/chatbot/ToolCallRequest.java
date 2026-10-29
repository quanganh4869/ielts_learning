package com.ielts.platform.schemas.chatbot;

import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ToolCallRequest {
    private final String id;
    private final String toolName;
    private final Map<String, Object> arguments;
}
