package com.ielts.platform.chatbot.infrastructure.retrieval;

import com.ielts.platform.chatbot.domain.KnowledgeChunk;
import com.ielts.platform.chatbot.domain.KnowledgeDocument;
import com.ielts.platform.chatbot.repository.KnowledgeChunkRepository;
import com.ielts.platform.chatbot.repository.KnowledgeDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseKnowledgeRetriever implements KnowledgeRetriever {

    private final KnowledgeChunkRepository chunkRepository;
    private final KnowledgeDocumentRepository documentRepository;

    @Override
    public List<RetrievedChunk> retrieve(String query, int topK) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        // Tokenize query words to search approved chunks
        String[] keywords = query.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\\s]", " ")
                .split("\\s+");

        Map<String, KnowledgeChunk> matchedMap = new LinkedHashMap<>();

        for (String kw : keywords) {
            if (kw.length() < 3) continue; // skip small stop words
            List<KnowledgeChunk> chunks = chunkRepository.searchApprovedChunks(kw, topK);
            for (KnowledgeChunk chunk : chunks) {
                matchedMap.putIfAbsent(chunk.getId(), chunk);
                if (matchedMap.size() >= topK) break;
            }
            if (matchedMap.size() >= topK) break;
        }

        List<RetrievedChunk> results = new ArrayList<>();
        for (KnowledgeChunk chunk : matchedMap.values()) {
            String title = "Tài liệu học tập IELTS";
            String cat = "IELTS_ACADEMIC";
            Optional<KnowledgeDocument> docOpt = documentRepository.findById(chunk.getDocumentId());
            if (docOpt.isPresent()) {
                title = docOpt.get().getTitle();
                cat = docOpt.get().getCategory();
            }

            results.add(RetrievedChunk.builder()
                    .documentId(chunk.getDocumentId())
                    .documentTitle(title)
                    .category(cat)
                    .chunkIndex(chunk.getChunkIndex())
                    .content(chunk.getContent())
                    .sectionTitle(chunk.getSectionTitle())
                    .build());
        }

        return results;
    }
}
