package com.ielts.platform.admin.content.model;

import com.ielts.platform.common.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleEntity extends BaseAuditEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 32)
    private String skill; // LISTENING, READING, WRITING, SPEAKING, GENERAL

    @Column(nullable = false, length = 50)
    private String level;

    @Column(name = "lessons_count", nullable = false)
    @Builder.Default
    private int lessonsCount = 0;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "DRAFT";

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LessonEntity> lessons = new ArrayList<>();
}
