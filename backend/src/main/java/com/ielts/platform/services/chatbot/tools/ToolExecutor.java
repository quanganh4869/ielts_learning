package com.ielts.platform.services.chatbot.tools;

import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.db.model.ChatToolCall;
import com.ielts.platform.db.repository.ChatToolCallRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class ToolExecutor {

    private final ToolRegistry toolRegistry;
    private final ChatToolCallRepository chatToolCallRepository;
    private final ObjectMapper objectMapper;

    /**
     * Executes a tool strictly binding current authenticated user context.
     * Prevents privilege escalation and logs tool execution audit trail.
     */
    public ToolResult executeTool(String toolName, String currentUserId, Map<String, Object> arguments, String messageId) {
        if (!toolRegistry.isAllowed(toolName)) {
            log.warn("Blocked unauthorized tool execution attempt: tool={}, user={}", toolName, currentUserId);
            return ToolResult.denied(toolName, "Công cụ không nằm trong danh mục được phép truy cập");
        }

        ChatbotTool tool = toolRegistry.getTool(toolName).orElse(null);
        if (tool == null) {
            return ToolResult.failure(toolName, "Không tìm thấy implementation của công cụ", 0);
        }

        long start = System.currentTimeMillis();
        ToolResult result;
        try {
            result = tool.execute(currentUserId, arguments != null ? arguments : Map.of());
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            log.error("Tool execution failed: tool={}, user={}, err={}", toolName, currentUserId, e.getMessage(), e);
            result = ToolResult.failure(toolName, "Lỗi khi truy xuất dữ liệu: " + e.getMessage(), duration);
        }

        // Persist audit record if messageId is attached
        if (messageId != null && !messageId.isBlank()) {
            try {
                ChatToolCall audit = ChatToolCall.builder()
                        .id("tc_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                        .messageId(messageId)
                        .toolName(toolName)
                        .inputArguments(arguments != null ? objectMapper.writeValueAsString(arguments) : "{}")
                        .outputResult(result.getData() != null ? objectMapper.writeValueAsString(result.getData()) : result.getErrorMessage())
                        .status(result.getStatus())
                        .executionTimeMs(result.getExecutionTimeMs())
                        .build();
                chatToolCallRepository.save(audit);
            } catch (Exception logErr) {
                log.warn("Could not save tool call audit: {}", logErr.getMessage());
            }
        }

        return result;
    }
}
