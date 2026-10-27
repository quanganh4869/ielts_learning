package com.ielts.platform.admin.content.model;

import com.ielts.platform.common.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonEntity extends BaseAuditEntity {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private ModuleEntity module;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "duration_minutes", nullable = false)
    @Builder.Default
    private int durationMinutes = 15;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String type = "ARTICLE"; // VIDEO, ARTICLE, QUIZ, PRACTICE

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "DRAFT";

    @Column(columnDefinition = "TEXT")
    private String content;
}
