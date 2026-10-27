package com.ielts.platform.chatbot.infrastructure.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ielts.platform.chatbot.config.ChatbotProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenAICompatibleProvider implements AIProvider {

    private final ChatbotProperties properties;
    private final ObjectMapper objectMapper;

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public boolean isConfigured() {
        return properties.hasApiKey();
    }

    @Override
    public String getProviderName() {
        return "OpenAICompatible (" + properties.getModel() + ")";
    }

    @Override
    public AIResponse generateResponse(PromptRequest request) {
        long startTime = System.currentTimeMillis();
        if (!isConfigured()) {
            return AIResponse.builder()
                    .content("AI Provider chưa được cấu hình khóa API (API Key) trên server. Vui lòng cấu hình biến môi trường AI_API_KEY hoặc GEMINI_API_KEY.")
                    .finishReason("NOT_CONFIGURED")
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .modelName("none")
                    .fallbackUsed(true)
                    .build();
        }

        try {
            List<Map<String, Object>> messages = new ArrayList<>();
            // 1. System Prompt
            if (request.getSystemPrompt() != null && !request.getSystemPrompt().isBlank()) {
                messages.add(Map.of("role", "system", "content", request.getSystemPrompt()));
            }

            // 2. Conversation History
            if (request.getConversationHistory() != null) {
                for (Map<String, String> m : request.getConversationHistory()) {
                    messages.add(Map.of("role", m.get("role"), "content", m.get("content")));
                }
            }

            // 3. Current User Message
            messages.add(Map.of("role", "user", "content", request.getUserMessage()));

            Map<String, Object> payload = new HashMap<>();
            payload.put("model", properties.getModel());
            payload.put("messages", messages);
            payload.put("temperature", request.getTemperature());
            payload.put("max_tokens", request.getMaxTokens());

            // 4. Tools (if provided)
            if (request.getToolSchemas() != null && !request.getToolSchemas().isEmpty()) {
                payload.put("tools", request.getToolSchemas());
                payload.put("tool_choice", "auto");
            }

            String requestBody = objectMapper.writeValueAsString(payload);
            String url = properties.getBaseUrl().replaceAll("/+$", "") + "/chat/completions";

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + properties.getApiKey().trim())
                    .timeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            long latency = System.currentTimeMillis() - startTime;

            if (response.statusCode() >= 400) {
                log.error("AI Provider returned HTTP {}: {}", response.statusCode(), response.body());
                return AIResponse.builder()
                        .content("Đã xảy ra lỗi khi kết nối với mô hình AI (" + response.statusCode() + "). Vui lòng thử lại sau.")
                        .finishReason("ERROR")
                        .latencyMs(latency)
                        .modelName(properties.getModel())
                        .fallbackUsed(true)
                        .build();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                return AIResponse.builder()
                        .content("Mô hình AI không trả về nội dung phù hợp.")
                        .finishReason("EMPTY")
                        .latencyMs(latency)
                        .modelName(properties.getModel())
                        .build();
            }

            JsonNode firstChoice = choices.get(0);
            JsonNode messageNode = firstChoice.path("message");
            String textContent = messageNode.path("content").asText(null);
            String finishReason = firstChoice.path("finish_reason").asText("stop");

            // Parse tool calls if LLM requested them
            List<ToolCallRequest> toolCalls = new ArrayList<>();
            JsonNode toolCallsNode = messageNode.path("tool_calls");
            if (toolCallsNode.isArray()) {
                for (JsonNode tc : toolCallsNode) {
                    String tcId = tc.path("id").asText();
                    String functionName = tc.path("function").path("name").asText();
                    String argsStr = tc.path("function").path("arguments").asText("{}");
                    Map<String, Object> argsMap = objectMapper.readValue(argsStr, Map.class);
                    toolCalls.add(ToolCallRequest.builder()
                            .id(tcId)
                            .toolName(functionName)
                            .arguments(argsMap)
                            .build());
                }
            }

            return AIResponse.builder()
                    .content(textContent)
                    .toolCalls(toolCalls)
                    .finishReason(finishReason)
                    .latencyMs(latency)
                    .modelName(properties.getModel())
                    .fallbackUsed(false)
                    .build();

        } catch (Exception e) {
            long latency = System.currentTimeMillis() - startTime;
            log.error("Exception calling AI Provider: {}", e.getMessage(), e);
            return AIResponse.builder()
                    .content("Không thể hoàn tất kết nối tới AI Provider: " + e.getMessage())
                    .finishReason("EXCEPTION")
                    .latencyMs(latency)
                    .modelName(properties.getModel())
                    .fallbackUsed(true)
                    .build();
        }
    }
}
