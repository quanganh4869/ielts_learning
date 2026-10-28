package com.ielts.platform.chatbot.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "conversation_id", nullable = false, length = 64)
    private String conversationId;

    @Column(nullable = false, length = 32)
    private String role; // 'user', 'assistant', 'system', 'tool'

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(nullable = false, length = 32)
    private String status; // 'PENDING', 'COMPLETED', 'FAILED', 'FILTERED'

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String citations; // JSON string of citations

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata; // JSON string

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = "COMPLETED";
    }
}
