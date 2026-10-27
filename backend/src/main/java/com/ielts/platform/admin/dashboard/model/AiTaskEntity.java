package com.ielts.platform.admin.dashboard.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "ai_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiTaskEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "task_type", nullable = false, length = 64)
    private String taskType;

    @Column(name = "model_version", nullable = false, length = 64)
    private String modelVersion;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "PENDING"; // PENDING, PROCESSING, SUCCESS, FAILED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    @Column(name = "input_payload", columnDefinition = "TEXT")
    private String inputPayload;

    @Column(name = "output_payload", columnDefinition = "TEXT")
    private String outputPayload;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;
}
