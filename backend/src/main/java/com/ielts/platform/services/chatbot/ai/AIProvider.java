package com.ielts.platform.services.chatbot.ai;

import com.ielts.platform.schemas.chatbot.AIResponse;
import com.ielts.platform.schemas.chatbot.PromptRequest;

public interface AIProvider {

    AIResponse generateResponse(PromptRequest request);

    boolean isConfigured();

    String getProviderName();
}
