package com.ielts.platform.chatbot.tools;

import java.util.Map;

/**
 * Contract for all backend business tools accessible by the IELTS AI Chatbot.
 */
public interface ChatbotTool {

    ToolDefinition getDefinition();

    /**
     * Executes the tool strictly bounded to the authenticated current user.
     * The model CANNOT override or spoof target userId.
     */
    ToolResult execute(String currentUserId, Map<String, Object> arguments);
}
