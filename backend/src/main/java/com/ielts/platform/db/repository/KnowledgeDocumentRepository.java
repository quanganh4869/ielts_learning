package com.ielts.platform.db.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.KnowledgeDocument;

@Repository
public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, String> {

    List<KnowledgeDocument> findByStatus(String status);

    Page<KnowledgeDocument> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Optional<KnowledgeDocument> findByFileHash(String fileHash);
}
