package com.ielts.platform.schemas.chatbot;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ielts.platform.services.chatbot.prompt.CitationBuilder;

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
