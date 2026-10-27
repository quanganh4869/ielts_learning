package com.ielts.platform.admin.vocabulary.model;

import com.ielts.platform.common.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "vocabulary_words")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyEntity extends BaseAuditEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, unique = true, length = 150)
    private String word;

    @Column(name = "part_of_speech", nullable = false, length = 32)
    private String partOfSpeech;

    @Column(nullable = false, length = 16)
    private String cefr;

    @Column(name = "band_score", nullable = false, precision = 3, scale = 1)
    private BigDecimal bandScore;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String definition;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String example;

    @Column(name = "vietnamese_meaning", columnDefinition = "TEXT")
    private String vietnameseMeaning;

    @Column(length = 100)
    private String pronunciation;

    @Column(name = "audio_url", columnDefinition = "TEXT")
    private String audioUrl;

    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "PUBLISHED";

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;
}
