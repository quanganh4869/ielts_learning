package com.ielts.platform.chatbot.infrastructure.ai;

/**
 * Pluggable AI Provider contract. Allows switching between OpenAI, Gemini, Claude,
 * or self-hosted LLM without modifying any business logic.
 */
public interface AIProvider {

    AIResponse generateResponse(PromptRequest request);

    boolean isConfigured();

    String getProviderName();
}
