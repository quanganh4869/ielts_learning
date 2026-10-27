package com.ielts.platform.chatbot.repository;

import com.ielts.platform.chatbot.domain.KnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, String> {

    List<KnowledgeChunk> findByDocumentIdOrderByChunkIndexAsc(String documentId);

    void deleteByDocumentId(String documentId);

    /**
     * Retrieves approved chunks matching keyword patterns without full vector extension dependency.
     */
    @Query(value = """
        SELECT c.* FROM knowledge_chunks c
        JOIN knowledge_documents d ON c.document_id = d.id
        WHERE d.status IN ('APPROVED', 'INDEXED')
          AND (LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(COALESCE(c.section_title, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
        LIMIT :limit
        """, nativeQuery = true)
    List<KnowledgeChunk> searchApprovedChunks(@Param("keyword") String keyword, @Param("limit") int limit);
}
