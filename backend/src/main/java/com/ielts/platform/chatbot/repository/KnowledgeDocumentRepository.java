package com.ielts.platform.chatbot.repository;

import com.ielts.platform.chatbot.domain.KnowledgeDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, String> {

    List<KnowledgeDocument> findByStatus(String status);

    Page<KnowledgeDocument> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Optional<KnowledgeDocument> findByFileHash(String fileHash);
}
