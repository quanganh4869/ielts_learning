package com.ielts.platform.admin.content.model;

import com.ielts.platform.common.BaseAuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "media_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaAssetEntity extends BaseAuditEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(name = "file_type", nullable = false, length = 32)
    private String fileType; // AUDIO, VIDEO, IMAGE, DOCUMENT

    @Column(name = "file_size_bytes", nullable = false)
    @Builder.Default
    private long fileSizeBytes = 0;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(length = 32)
    private String skill;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;
}
