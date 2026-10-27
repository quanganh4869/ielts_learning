package com.ielts.platform.admin.users.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "login_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginEventEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(nullable = false, length = 100)
    private String device;

    @Column(nullable = false, length = 32)
    private String status; // SUCCESS, FAILED

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
