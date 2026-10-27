package com.ielts.platform.admin.questions.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "assessment_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentAttemptEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "assessment_id", nullable = false, length = 64)
    private String assessmentId;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(precision = 3, scale = 1)
    private BigDecimal score;

    @Column(name = "band_score", precision = 3, scale = 1)
    private BigDecimal bandScore;

    @Column(name = "time_spent_seconds", nullable = false)
    @Builder.Default
    private int timeSpentSeconds = 0;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "COMPLETED";

    @Column(name = "started_at", nullable = false)
    @Builder.Default
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;
}
