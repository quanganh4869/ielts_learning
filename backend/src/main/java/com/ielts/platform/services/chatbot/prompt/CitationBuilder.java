package com.ielts.platform.services.chatbot.prompt;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;
import lombok.Builder;
import lombok.Getter;
import com.ielts.platform.services.chatbot.retrieval.RetrievedChunk;
import com.ielts.platform.services.chatbot.tools.ToolResult;

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
