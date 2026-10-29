package com.ielts.platform.services.chatbot.retrieval;

import java.util.List;

public interface KnowledgeRetriever {
    List<RetrievedChunk> retrieve(String query, int topK);
}
