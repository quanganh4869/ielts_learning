package com.ielts.platform.chatbot.infrastructure.retrieval;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RetrievedChunk {
    private final String documentId;
    private final String documentTitle;
    private final String category;
    private final int chunkIndex;
    private final String content;
    private final String sectionTitle;
}
