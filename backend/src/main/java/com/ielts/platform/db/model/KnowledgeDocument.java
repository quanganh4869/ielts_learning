package com.ielts.platform.db.model;

import java.time.Instant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "knowledge_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeDocument {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 64)
    private String category; // 'PLATFORM_GUIDE', 'IELTS_ACADEMIC', 'GRAMMAR', 'VOCABULARY', 'EXAM_STRATEGY'

    @Column(name = "source_filename", nullable = false)
    private String sourceFilename;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_hash", nullable = false, length = 128)
    private String fileHash;

    @Column(name = "r2_key", length = 512)
    private String r2Key;

    @Column(nullable = false, length = 32)
    private String status; // 'UPLOADED', 'PROCESSING', 'APPROVED', 'REJECTED', 'INDEXED', 'ARCHIVED'

    @Column(nullable = false)
    private Integer version;

    @Column(name = "uploaded_by", nullable = false, length = 64)
    private String uploadedBy;

    @Column(name = "approved_by", length = 64)
    private String approvedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
        if (version == null) version = 1;
        if (status == null) status = "UPLOADED";
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
