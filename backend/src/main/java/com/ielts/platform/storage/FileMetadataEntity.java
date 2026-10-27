package com.ielts.platform.storage;

import com.ielts.platform.admin.users.model.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "file_metadata", indexes = {
        @Index(name = "idx_file_metadata_owner", columnList = "owner_id"),
        @Index(name = "idx_file_metadata_resource_type", columnList = "resource_type"),
        @Index(name = "idx_file_metadata_status", columnList = "upload_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileMetadataEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "object_key", length = 512, nullable = false, unique = true)
    private String objectKey;

    @Column(name = "bucket_name", length = 128, nullable = false)
    private String bucketName;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", length = 32, nullable = false)
    private ResourceType resourceType;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    @Column(name = "content_type", length = 128, nullable = false)
    private String contentType;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private UserEntity owner;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level", length = 32, nullable = false)
    @Builder.Default
    private AccessLevel accessLevel = AccessLevel.PRIVATE;

    @Enumerated(EnumType.STRING)
    @Column(name = "upload_status", length = 32, nullable = false)
    @Builder.Default
    private UploadStatus uploadStatus = UploadStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Column(name = "expires_at")
    private Instant expiresAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
