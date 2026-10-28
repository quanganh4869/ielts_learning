package com.ielts.platform.chatbot.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "chat_tool_calls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatToolCall {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "message_id", nullable = false, length = 64)
    private String messageId;

    @Column(name = "tool_name", nullable = false, length = 128)
    private String toolName;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "input_arguments", columnDefinition = "jsonb")
    private String inputArguments;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "output_result", columnDefinition = "jsonb")
    private String outputResult;

    @Column(nullable = false, length = 32)
    private String status; // 'SUCCESS', 'FAILED', 'DENIED'

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = "SUCCESS";
    }
}
