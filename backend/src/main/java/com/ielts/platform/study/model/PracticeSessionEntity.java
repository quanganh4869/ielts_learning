package com.ielts.platform.study.model;

import com.ielts.platform.admin.users.model.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "practice_sessions", indexes = {
        @Index(name = "idx_practice_sessions_user", columnList = "user_id"),
        @Index(name = "idx_practice_sessions_skill", columnList = "user_id, skill")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeSessionEntity {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false, length = 32)
    private String skill;

    @Column(length = 128)
    private String topic;

    @Column(name = "total_questions", nullable = false)
    @Builder.Default
    private int totalQuestions = 0;

    @Column(name = "correct_answers", nullable = false)
    @Builder.Default
    private int correctAnswers = 0;

    @Column(name = "band_score", precision = 3, scale = 1)
    private BigDecimal bandScore;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "IN_PROGRESS";

    @Column(name = "started_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;
}
