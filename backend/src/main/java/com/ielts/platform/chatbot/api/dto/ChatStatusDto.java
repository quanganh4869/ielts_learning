package com.ielts.platform.chatbot.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatStatusDto {
    private String status; // 'ONLINE', 'FALLBACK_MODE'
    private String activeProvider;
    private boolean configured;
    private String modelName;
    private List<String> availableTools;
    private long approvedKnowledgeChunks;
}
