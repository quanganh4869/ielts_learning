package com.ielts.platform.services.chatbot.tools;

import java.util.Map;

public interface ChatbotTool {

    ToolDefinition getDefinition();

    /**
     * Executes the tool strictly bounded to the authenticated current user.
     * The model CANNOT override or spoof target userId.
     */
    ToolResult execute(String currentUserId, Map<String, Object> arguments);
}
