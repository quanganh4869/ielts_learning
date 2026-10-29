package com.ielts.platform.schemas.chatbot;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
