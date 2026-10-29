package com.ielts.platform.services.chatbot.tools;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ToolRegistry {

    private final Map<String, ChatbotTool> tools = new ConcurrentHashMap<>();

    public ToolRegistry(List<ChatbotTool> toolList) {
        if (toolList != null) {
            for (ChatbotTool tool : toolList) {
                registerTool(tool);
            }
        }
    }

    public void registerTool(ChatbotTool tool) {
        String name = tool.getDefinition().getName();
        tools.put(name, tool);
        log.info("Registered AI Chatbot Tool: {}", name);
    }

    public Optional<ChatbotTool> getTool(String name) {
        if (name == null) return Optional.empty();
        return Optional.ofNullable(tools.get(name));
    }

    public List<ToolDefinition> getAllDefinitions() {
        return tools.values().stream().map(ChatbotTool::getDefinition).toList();
    }

    public boolean isAllowed(String toolName) {
        return tools.containsKey(toolName);
    }
}
