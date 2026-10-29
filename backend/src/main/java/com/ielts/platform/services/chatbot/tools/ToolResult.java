package com.ielts.platform.services.chatbot.tools;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ToolResult {
    private final String toolName;
    private final String status; // 'SUCCESS', 'FAILED', 'DENIED'
    private final Object data;
    private final String citation;
    private final String errorMessage;
    private final long executionTimeMs;

    public static ToolResult success(String toolName, Object data, String citation, long timeMs) {
        return ToolResult.builder()
                .toolName(toolName)
                .status("SUCCESS")
                .data(data)
                .citation(citation)
                .executionTimeMs(timeMs)
                .build();
    }

    public static ToolResult failure(String toolName, String errorMessage, long timeMs) {
        return ToolResult.builder()
                .toolName(toolName)
                .status("FAILED")
                .errorMessage(errorMessage)
                .executionTimeMs(timeMs)
                .build();
    }

    public static ToolResult denied(String toolName, String reason) {
        return ToolResult.builder()
                .toolName(toolName)
                .status("DENIED")
                .errorMessage(reason)
                .executionTimeMs(0)
                .build();
    }
}
