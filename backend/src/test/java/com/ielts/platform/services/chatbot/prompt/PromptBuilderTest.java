package com.ielts.platform.services.chatbot.prompt;

import static org.junit.jupiter.api.Assertions.*;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import com.ielts.platform.services.chatbot.retrieval.RetrievedChunk;
import com.ielts.platform.services.chatbot.tools.ToolResult;

class PromptBuilderTest {

    private final PromptBuilder promptBuilder = new PromptBuilder();

    @Test
    @DisplayName("Should assemble system prompt with RAG chunks, tool data and anti-hallucination rules")
    void testBuildSystemPrompt() {
        List<RetrievedChunk> chunks = List.of(
                RetrievedChunk.builder()
                        .documentTitle("Hướng dẫn Writing Task 2")
                        .sectionTitle("Cấu trúc 4 đoạn")
                        .content("Mở bài cần có paraphrase và thesis statement.")
                        .build()
        );

        List<ToolResult> tools = List.of(
                ToolResult.success("getUserStudyProfile", Map.of("targetBand", 7.5), "Hồ sơ hệ thống", 20)
        );

        String systemPrompt = promptBuilder.buildSystemPrompt(chunks, tools);

        assertNotNull(systemPrompt);
        assertTrue(systemPrompt.contains("Nori IELTS Tutor"));
        assertTrue(systemPrompt.contains("ZERO-HALLUCINATION"));
        assertTrue(systemPrompt.contains("Hướng dẫn Writing Task 2"));
        assertTrue(systemPrompt.contains("getUserStudyProfile"));
        assertTrue(systemPrompt.contains("7.5"));
    }

    @Test
    @DisplayName("Should wrap user query inside anti-injection delimiters")
    void testWrapUserQuery() {
        String wrapped = promptBuilder.wrapUserQuery("Hello IELTS tutor");
        assertEquals("<user_query>\nHello IELTS tutor\n</user_query>", wrapped);
    }
}
