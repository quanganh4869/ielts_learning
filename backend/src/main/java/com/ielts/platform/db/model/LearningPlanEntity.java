package com.ielts.platform.db.model;

import java.math.BigDecimal;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "learning_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningPlanEntity extends BaseAuditEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "target_band", nullable = false, precision = 3, scale = 1)
    private BigDecimal targetBand;

    @Column(name = "target_score_label", length = 50)
    private String targetScoreLabel;

    @Column(nullable = false, length = 50)
    private String level;

    @Column(name = "duration_weeks", nullable = false)
    @Builder.Default
    private int durationWeeks = 4;

    @Column(name = "enrolled_count", nullable = false)
    @Builder.Default
    private int enrolledCount = 0;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "DRAFT";

    @Column(columnDefinition = "TEXT")
    private String description;
}
