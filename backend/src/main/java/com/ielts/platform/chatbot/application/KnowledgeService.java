package com.ielts.platform.chatbot.application;

import com.ielts.platform.chatbot.domain.KnowledgeChunk;
import com.ielts.platform.chatbot.domain.KnowledgeDocument;
import com.ielts.platform.chatbot.repository.KnowledgeChunkRepository;
import com.ielts.platform.chatbot.repository.KnowledgeDocumentRepository;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeService {

    private final KnowledgeDocumentRepository documentRepository;
    private final KnowledgeChunkRepository chunkRepository;

    public Page<KnowledgeDocument> listDocuments(Pageable pageable) {
        return documentRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public KnowledgeDocument getDocument(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài liệu kiến thức"));
    }

    public List<KnowledgeChunk> getDocumentChunks(String documentId) {
        return chunkRepository.findByDocumentIdOrderByChunkIndexAsc(documentId);
    }

    @Transactional
    public KnowledgeDocument approveDocument(String documentId, String adminUserId) {
        KnowledgeDocument doc = getDocument(documentId);
        doc.setStatus("APPROVED");
        doc.setApprovedBy(adminUserId);
        doc.setUpdatedAt(Instant.now());
        return documentRepository.save(doc);
    }

    @Transactional
    public KnowledgeDocument rejectDocument(String documentId, String adminUserId) {
        KnowledgeDocument doc = getDocument(documentId);
        doc.setStatus("REJECTED");
        doc.setApprovedBy(adminUserId);
        doc.setUpdatedAt(Instant.now());
        return documentRepository.save(doc);
    }

    @Transactional
    public KnowledgeDocument createAndIndexTextDocument(
            String title,
            String category,
            String sourceFilename,
            String rawContent,
            String adminUserId
    ) {
        if (title == null || title.isBlank()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Tiêu đề tài liệu không được để trống");
        }
        if (rawContent == null || rawContent.isBlank()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Nội dung tài liệu không được để trống");
        }

        String docId = "doc_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        KnowledgeDocument doc = KnowledgeDocument.builder()
                .id(docId)
                .title(title.trim())
                .category(category != null ? category.trim() : "IELTS_ACADEMIC")
                .sourceFilename(sourceFilename != null ? sourceFilename.trim() : "uploaded_doc.txt")
                .fileSize((long) rawContent.length())
                .fileHash("hash_" + Integer.toHexString(rawContent.hashCode()))
                .status("APPROVED") // approved directly by admin
                .version(1)
                .uploadedBy(adminUserId)
                .approvedBy(adminUserId)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        KnowledgeDocument savedDoc = documentRepository.save(doc);

        // Simple sentence/paragraph chunking (~250 words per chunk)
        String[] paragraphs = rawContent.split("\\n\\s*\\n");
        List<KnowledgeChunk> chunkList = new ArrayList<>();
        int chunkIdx = 0;

        for (String para : paragraphs) {
            String trimmed = para.trim();
            if (trimmed.length() < 20) continue; // skip very short lines

            KnowledgeChunk chunk = KnowledgeChunk.builder()
                    .id("chk_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                    .documentId(savedDoc.getId())
                    .chunkIndex(chunkIdx++)
                    .content(trimmed)
                    .sectionTitle(title)
                    .tokenCount(trimmed.split("\\s+").length)
                    .createdAt(Instant.now())
                    .build();
            chunkList.add(chunk);
        }

        chunkRepository.saveAll(chunkList);
        log.info("Indexed {} chunks for knowledge document '{}' (ID={})", chunkList.size(), title, docId);

        return savedDoc;
    }
}
