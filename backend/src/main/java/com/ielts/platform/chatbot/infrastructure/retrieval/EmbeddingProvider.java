package com.ielts.platform.chatbot.infrastructure.retrieval;

import java.util.List;

/**
 * Interface contract for vector embedding generation (compatible with text-embedding-3-small,
 * Vertex AI textembedding-gecko, or HuggingFace local models).
 */
public interface EmbeddingProvider {
    List<Float> embedText(String text);
    int getDimension();
}
