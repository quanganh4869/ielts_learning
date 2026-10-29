package com.ielts.platform.services.chatbot.retrieval;

import java.util.List;

public interface EmbeddingProvider {
    List<Float> embedText(String text);
    int getDimension();
}
