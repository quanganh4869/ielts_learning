package com.ielts.platform.chatbot.tools;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class ToolDefinition {
    private final String name;
    private final String description;
    private final Map<String, Object> parameters;
    private final String requiredRole;
}
