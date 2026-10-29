package com.ielts.platform.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionEntity extends BaseAuditEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 32)
    private String skill; // LISTENING, READING, WRITING, SPEAKING

    @Column(nullable = false, length = 64)
    private String type; // MULTIPLE_CHOICE, FILL_IN_BLANKS, MATCHING, ESSAY, SPEAKING_PROMPT

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String difficulty = "MEDIUM"; // EASY, MEDIUM, HARD

    @Column(name = "passage_text", columnDefinition = "TEXT")
    private String passageText;

    @Column(name = "audio_asset_id", length = 64)
    private String audioAssetId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String prompt;

    @Column(name = "options_json", columnDefinition = "TEXT")
    private String optionsJson;

    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "ACTIVE";
}
