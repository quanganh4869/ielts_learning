package com.ielts.platform.chatbot.prompt;

import com.ielts.platform.chatbot.infrastructure.retrieval.RetrievedChunk;
import com.ielts.platform.chatbot.tools.ToolResult;
import lombok.Builder;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CitationBuilder {

    @Getter
    @Builder
    public static class CitationItem {
        private final String type; // 'RAG_KNOWLEDGE', 'API_TOOL', 'PLATFORM_DOC'
        private final String title;
        private final String source;
        private final String section;
    }

    public List<CitationItem> buildCitations(List<RetrievedChunk> chunks, List<ToolResult> toolResults) {
        List<CitationItem> list = new ArrayList<>();

        if (chunks != null) {
            for (RetrievedChunk chunk : chunks) {
                list.add(CitationItem.builder()
                        .type("RAG_KNOWLEDGE")
                        .title(chunk.getDocumentTitle())
                        .source(chunk.getCategory())
                        .section(chunk.getSectionTitle())
                        .build());
            }
        }

        if (toolResults != null) {
            for (ToolResult tr : toolResults) {
                if ("SUCCESS".equals(tr.getStatus()) && tr.getCitation() != null) {
                    list.add(CitationItem.builder()
                            .type("API_TOOL")
                            .title("Dữ liệu thực tế: " + tr.getToolName())
                            .source("IELTS Platform Database")
                            .section(tr.getCitation())
                            .build());
                }
            }
        }

        return list;
    }
}
