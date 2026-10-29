package com.ielts.platform.services.chatbot.tools;

import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ToolDefinition {
    private final String name;
    private final String description;
    private final Map<String, Object> parameters;
    private final String requiredRole;
}
