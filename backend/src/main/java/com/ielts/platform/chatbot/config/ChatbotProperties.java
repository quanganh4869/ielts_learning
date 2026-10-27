package com.ielts.platform.chatbot.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.chatbot")
public class ChatbotProperties {

    /**
     * AI Provider type: 'openai', 'gemini', 'fallback', or 'auto'.
     */
    private String provider = "auto";

    /**
     * AI API Key (Supports OpenAI or Gemini/Groq API keys).
     */
    private String apiKey;

    /**
     * AI Endpoint Base URL.
     * Default: OpenAI V1 endpoint. For Gemini: https://generativelanguage.googleapis.com/v1beta/openai
     */
    private String baseUrl = "https://api.openai.com/v1";

    /**
     * AI Model name.
     */
    private String model = "gpt-4o-mini";

    /**
     * Default sampling temperature. Low for consistency on IELTS academic content.
     */
    private double temperature = 0.3;

    /**
     * Max output tokens.
     */
    private int maxTokens = 1200;

    /**
     * Provider HTTP request timeout in seconds.
     */
    private int timeoutSeconds = 25;

    /**
     * Rate limit: Max messages per user per minute.
     */
    private int rateLimitPerMinute = 20;

    public boolean hasApiKey() {
        return StringUtils.hasText(apiKey) && !apiKey.trim().startsWith("mock_");
    }
}
