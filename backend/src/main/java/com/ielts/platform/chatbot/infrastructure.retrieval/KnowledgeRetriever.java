package com.ielts.platform.chatbot.infrastructure.retrieval;

import java.util.List;

public interface KnowledgeRetriever {
    List<RetrievedChunk> retrieve(String query, int topK);
}
