package com.ielts.platform.chatbot.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "knowledge_chunks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeChunk {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "document_id", nullable = false, length = 64)
    private String documentId;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "section_title")
    private String sectionTitle;

    @Column(name = "token_count")
    private Integer tokenCount;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (chunkIndex == null) chunkIndex = 0;
    }
}
