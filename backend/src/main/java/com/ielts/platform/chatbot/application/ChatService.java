package com.ielts.platform.chatbot.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ielts.platform.chatbot.api.dto.ChatResponse;
import com.ielts.platform.chatbot.config.ChatbotProperties;
import com.ielts.platform.chatbot.domain.ChatConversation;
import com.ielts.platform.chatbot.domain.ChatMessage;
import com.ielts.platform.chatbot.domain.ScopeClassification;
import com.ielts.platform.chatbot.infrastructure.ai.AIProvider;
import com.ielts.platform.chatbot.infrastructure.ai.AIProviderFactory;
import com.ielts.platform.chatbot.infrastructure.ai.AIResponse;
import com.ielts.platform.chatbot.infrastructure.ai.PromptRequest;
import com.ielts.platform.chatbot.infrastructure.retrieval.KnowledgeRetriever;
import com.ielts.platform.chatbot.infrastructure.retrieval.RetrievedChunk;
import com.ielts.platform.chatbot.prompt.CitationBuilder;
import com.ielts.platform.chatbot.prompt.PromptBuilder;
import com.ielts.platform.chatbot.repository.ChatMessageRepository;
import com.ielts.platform.chatbot.security.ScopeGuard;
import com.ielts.platform.chatbot.tools.ToolExecutor;
import com.ielts.platform.chatbot.tools.ToolResult;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationService conversationService;
    private final ChatMessageRepository messageRepository;
    private final ScopeGuard scopeGuard;
    private final ToolExecutor toolExecutor;
    private final KnowledgeRetriever knowledgeRetriever;
    private final PromptBuilder promptBuilder;
    private final CitationBuilder citationBuilder;
    private final AIProviderFactory aiProviderFactory;
    private final ChatbotProperties properties;
    private final ObjectMapper objectMapper;

    // In-memory sliding rate limiter: userId -> queue of request timestamps
    private final Map<String, Queue<Long>> rateLimitMap = new ConcurrentHashMap<>();

    @Transactional
    public ChatResponse processUserMessage(String conversationId, String rawMessage, String currentUserId) {
        long startTime = System.currentTimeMillis();

        // 1. Validation & Rate Limit
        if (rawMessage == null || rawMessage.trim().isBlank()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Nội dung tin nhắn không được để trống");
        }
        String userQuery = rawMessage.trim();
        if (userQuery.length() > 2000) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Tin nhắn vượt quá giới hạn tối đa (2000 ký tự)");
        }
        checkRateLimit(currentUserId);

        // 2. IDOR Protection: Verify user owns the conversation
        ChatConversation conversation = conversationService.getConversation(conversationId, currentUserId);

        // 3. Save User Message
        String userMsgId = "msg_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        ChatMessage userMessage = ChatMessage.builder()
                .id(userMsgId)
                .conversationId(conversationId)
                .role("user")
                .content(userQuery)
                .latencyMs(0L)
                .status("COMPLETED")
                .createdAt(Instant.now())
                .build();
        messageRepository.save(userMessage);

        // 4. Update conversation title if first message
        if ("Hội thoại IELTS mới".equals(conversation.getTitle())) {
            String newTitle = userQuery.length() > 40 ? userQuery.substring(0, 37) + "..." : userQuery;
            conversationService.updateTitle(conversationId, newTitle, currentUserId);
        }

        // 5. Scope Guardrails
        ScopeClassification classification = scopeGuard.classify(userQuery);
        log.info("Classified query from user {}: scope='{}'", currentUserId, classification);

        String assistantMsgId = "msg_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        if (classification == ScopeClassification.UNSAFE_OR_UNAUTHORIZED) {
            return saveAndReturnDirectResponse(conversationId, assistantMsgId, scopeGuard.getUnsafeRefusalMessage(),
                    "FILTERED", Collections.emptyList(), System.currentTimeMillis() - startTime);
        }

        if (classification == ScopeClassification.OUT_OF_SCOPE) {
            return saveAndReturnDirectResponse(conversationId, assistantMsgId, scopeGuard.getOutOfScopeRefusalMessage(),
                    "COMPLETED", Collections.emptyList(), System.currentTimeMillis() - startTime);
        }

        // 6. Tool Calling Decision & Execution (Strict User Context Bound)
        List<ToolResult> toolResults = new ArrayList<>();
        if (classification == ScopeClassification.PERSONAL_LEARNING_DATA) {
            // Call profile & progress
            toolResults.add(toolExecutor.executeTool("getUserStudyProfile", currentUserId, Map.of(), assistantMsgId));
            toolResults.add(toolExecutor.executeTool("getUserSkillProgress", currentUserId, Map.of(), assistantMsgId));

            if (userQuery.toLowerCase().contains("từ vựng") || userQuery.toLowerCase().contains("vocab")) {
                toolResults.add(toolExecutor.executeTool("getUserVocabulary", currentUserId, Map.of(), assistantMsgId));
            }
            if (userQuery.toLowerCase().contains("thi") || userQuery.toLowerCase().contains("exam") || userQuery.toLowerCase().contains("kết quả")) {
                toolResults.add(toolExecutor.executeTool("getUserExamResults", currentUserId, Map.of(), assistantMsgId));
            }
            if (userQuery.toLowerCase().contains("luyện") || userQuery.toLowerCase().contains("practice")) {
                toolResults.add(toolExecutor.executeTool("getUserPracticeHistory", currentUserId, Map.of(), assistantMsgId));
            }
        } else if (classification == ScopeClassification.PLATFORM_HELP) {
            toolResults.add(toolExecutor.executeTool("getPlatformGuide", currentUserId, Map.of("feature", userQuery), assistantMsgId));
        } else if (userQuery.toLowerCase().contains("bài học") || userQuery.toLowerCase().contains("lesson")) {
            toolResults.add(toolExecutor.executeTool("searchPlatformLessons", currentUserId, Map.of("keyword", userQuery), assistantMsgId));
        }

        // 7. RAG Knowledge Retrieval (Approved documents only)
        List<RetrievedChunk> retrievedChunks = knowledgeRetriever.retrieve(userQuery, 3);

        // 8. Build Prompt with Safe Anti-Injection Envelope
        String systemPrompt = promptBuilder.buildSystemPrompt(retrievedChunks, toolResults);
        String wrappedUserQuery = promptBuilder.wrapUserQuery(userQuery);

        // 9. Load recent history for context continuity (max last 6 messages)
        List<ChatMessage> recentMessages = messageRepository.findByConversationIdOrderByCreatedAtDesc(
                conversationId, PageRequest.of(0, 6)).getContent();
        List<Map<String, String>> history = new ArrayList<>();
        // Invert to chronological order
        for (int i = recentMessages.size() - 1; i >= 0; i--) {
            ChatMessage m = recentMessages.get(i);
            if (!m.getId().equals(userMsgId)) { // skip currently inserted message
                history.add(Map.of("role", m.getRole(), "content", m.getContent()));
            }
        }

        PromptRequest promptRequest = PromptRequest.builder()
                .systemPrompt(systemPrompt)
                .conversationHistory(history)
                .userMessage(wrappedUserQuery)
                .temperature(properties.getTemperature())
                .maxTokens(properties.getMaxTokens())
                .build();

        // 10. Execute AI Provider
        AIProvider provider = aiProviderFactory.getActiveProvider();
        AIResponse aiResponse = provider.generateResponse(promptRequest);
        long latency = System.currentTimeMillis() - startTime;

        String answerContent = aiResponse.getContent();
        if (answerContent == null || answerContent.isBlank()) {
            answerContent = "Tôi đã xử lý câu hỏi của bạn nhưng không nhận được nội dung trả lời phù hợp từ mô hình AI. Vui lòng thử lại.";
        }

        // 11. Security Check: Output safety
        if (!scopeGuard.isOutputSafe(answerContent)) {
            log.warn("Filtered unsafe model output for user {}", currentUserId);
            answerContent = "Nội dung trả lời đã được lọc tự động để bảo đảm tiêu chuẩn an toàn của hệ thống.";
        }

        // 12. Build Citations & Persist
        List<CitationBuilder.CitationItem> citations = citationBuilder.buildCitations(retrievedChunks, toolResults);
        String citationsJson = "[]";
        try {
            citationsJson = objectMapper.writeValueAsString(citations);
        } catch (JsonProcessingException e) {
            log.warn("Could not serialize citations: {}", e.getMessage());
        }

        ChatMessage assistantMessage = ChatMessage.builder()
                .id(assistantMsgId)
                .conversationId(conversationId)
                .role("assistant")
                .content(answerContent)
                .latencyMs(latency)
                .status("COMPLETED")
                .citations(citationsJson)
                .createdAt(Instant.now())
                .build();
        messageRepository.save(assistantMessage);

        return ChatResponse.builder()
                .messageId(assistantMsgId)
                .conversationId(conversationId)
                .role("assistant")
                .content(answerContent)
                .latencyMs(latency)
                .status("COMPLETED")
                .citations(citations)
                .createdAt(assistantMessage.getCreatedAt().toString())
                .build();
    }

    private void checkRateLimit(String userId) {
        long now = System.currentTimeMillis();
        long windowStart = now - 60_000L;
        Queue<Long> timestamps = rateLimitMap.computeIfAbsent(userId, k -> new LinkedList<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peek() < windowStart) {
                timestamps.poll();
            }
            if (timestamps.size() >= properties.getRateLimitPerMinute()) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Bạn đang gửi tin nhắn quá nhanh. Vui lòng đợi ít giây trước khi thử lại.");
            }
            timestamps.offer(now);
        }
    }

    private ChatResponse saveAndReturnDirectResponse(
            String conversationId,
            String messageId,
            String content,
            String status,
            List<CitationBuilder.CitationItem> citations,
            long latencyMs
    ) {
        ChatMessage msg = ChatMessage.builder()
                .id(messageId)
                .conversationId(conversationId)
                .role("assistant")
                .content(content)
                .latencyMs(latencyMs)
                .status(status)
                .citations("[]")
                .createdAt(Instant.now())
                .build();
        messageRepository.save(msg);

        return ChatResponse.builder()
                .messageId(messageId)
                .conversationId(conversationId)
                .role("assistant")
                .content(content)
                .latencyMs(latencyMs)
                .status(status)
                .citations(citations)
                .createdAt(msg.getCreatedAt().toString())
                .build();
    }
}
