package com.ielts.platform.chatbot.api.dto;

import com.ielts.platform.chatbot.prompt.CitationBuilder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String messageId;
    private String conversationId;
    private String role;
    private String content;
    private Long latencyMs;
    private String status;
    private List<CitationBuilder.CitationItem> citations;
    private String createdAt;
}
