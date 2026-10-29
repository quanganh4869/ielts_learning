package com.ielts.platform.services.chatbot.ai;

import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.config.properties.ChatbotProperties;

@Slf4j
@Component
@RequiredArgsConstructor
public class AIProviderFactory {

    private final ChatbotProperties properties;
    private final OpenAICompatibleProvider openAICompatibleProvider;
    private final FallbackAIProvider fallbackAIProvider;

    public AIProvider getActiveProvider() {
        if ("fallback".equalsIgnoreCase(properties.getProvider())) {
            return fallbackAIProvider;
        }

        if (openAICompatibleProvider.isConfigured()) {
            return openAICompatibleProvider;
        }

        log.info("No active external AI Provider API key detected. Using FallbackAIProvider.");
        return fallbackAIProvider;
    }
}
