package com.ielts.platform.db.model;

import java.math.BigDecimal;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentEntity extends BaseAuditEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 32)
    private String skill;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String type = "MOCK_FULL";

    @Column(name = "time_limit_minutes", nullable = false)
    @Builder.Default
    private int timeLimitMinutes = 60;

    @Column(name = "total_questions", nullable = false)
    @Builder.Default
    private int totalQuestions = 40;

    @Column(name = "passing_score", precision = 3, scale = 1)
    private BigDecimal passingScore;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "DRAFT";
}
