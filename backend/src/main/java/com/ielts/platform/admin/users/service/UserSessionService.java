package com.ielts.platform.admin.users.service;

import com.ielts.platform.admin.audit.service.AuditLogService;
import com.ielts.platform.admin.users.dto.UserSessionDtos;
import com.ielts.platform.admin.users.model.UserEntity;
import com.ielts.platform.admin.users.model.UserSessionEntity;
import com.ielts.platform.admin.users.repository.UserRepository;
import com.ielts.platform.admin.users.repository.UserSessionRepository;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserSessionService {

    private final UserSessionRepository userSessionRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<UserSessionDtos.Response> getSessions(Boolean activeOnly, Pageable pageable, String currentAdminId) {
        Page<UserSessionEntity> page;
        if (Boolean.TRUE.equals(activeOnly)) {
            page = userSessionRepository.findByIsActiveOrderByLastActiveDesc(true, pageable);
        } else {
            page = userSessionRepository.findAllByOrderByLastActiveDesc(pageable);
        }

        Set<String> userIds = page.getContent().stream().map(UserSessionEntity::getUserId).collect(Collectors.toSet());
        Map<String, UserEntity> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(UserEntity::getId, u -> u));

        return page.map(s -> mapToDto(s, userMap.get(s.getUserId()), currentAdminId));
    }

    @Transactional(readOnly = true)
    public UserSessionDtos.Response getSessionById(String id, String currentAdminId) {
        UserSessionEntity session = userSessionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Session not found with id: " + id));
        UserEntity user = userRepository.findById(session.getUserId()).orElse(null);
        return mapToDto(session, user, currentAdminId);
    }

    @Transactional
    public UserSessionDtos.Response revokeSession(String sessionId, String reason, String adminId, String adminName) {
        UserSessionEntity session = userSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Session not found with id: " + sessionId));

        session.setActive(false);
        UserSessionEntity saved = userSessionRepository.save(session);

        auditLogService.record(adminId, adminName, "REVOKE_SESSION", "USER_SESSION", sessionId,
                "Revoked session for user " + session.getUserId() + ". Reason: " + reason, null);

        UserEntity user = userRepository.findById(session.getUserId()).orElse(null);
        UserSessionDtos.Response dto = mapToDto(saved, user, adminId);
        dto.setRevokedAt(Instant.now());
        dto.setRevokedBy(adminName);
        return dto;
    }

    @Transactional
    public int revokeAllUserSessions(String userId, String reason, String adminId, String adminName) {
        List<UserSessionEntity> activeSessions = userSessionRepository.findByUserIdAndIsActiveTrue(userId);
        for (UserSessionEntity session : activeSessions) {
            session.setActive(false);
        }
        userSessionRepository.saveAll(activeSessions);

        auditLogService.record(adminId, adminName, "REVOKE_ALL_SESSIONS", "USER_SESSION", userId,
                "Revoked " + activeSessions.size() + " active sessions for user " + userId + ". Reason: " + reason, null);

        return activeSessions.size();
    }

    private UserSessionDtos.Response mapToDto(UserSessionEntity s, UserEntity user, String currentAdminId) {
        String userName = user != null ? user.getName() : "Unknown User";
        String userEmail = user != null ? user.getEmail() : "unknown@example.com";
        String status = s.isActive() ? "active" : "revoked";
        if (s.getExpiresAt() != null && s.getExpiresAt().isBefore(Instant.now()) && s.isActive()) {
            status = "expired";
        }

        String rawDevice = s.getDevice() != null ? s.getDevice() : "Desktop";
        String deviceType = rawDevice.toLowerCase().contains("mobile") || rawDevice.toLowerCase().contains("iphone") || rawDevice.toLowerCase().contains("android")
                ? "mobile" : (rawDevice.toLowerCase().contains("ipad") || rawDevice.toLowerCase().contains("tablet") ? "tablet" : "desktop");

        String os = "Unknown OS";
        if (rawDevice.contains("Windows")) os = "Windows 11";
        else if (rawDevice.contains("Macintosh") || rawDevice.contains("Mac OS")) os = "macOS";
        else if (rawDevice.contains("iPhone") || rawDevice.contains("iOS")) os = "iOS";
        else if (rawDevice.contains("Android")) os = "Android";
        else if (rawDevice.contains("Linux")) os = "Linux";

        String browser = "Browser";
        if (rawDevice.contains("Chrome")) browser = "Chrome";
        else if (rawDevice.contains("Safari")) browser = "Safari";
        else if (rawDevice.contains("Edge")) browser = "Edge";
        else if (rawDevice.contains("Firefox")) browser = "Firefox";

        boolean isCurrent = s.getUserId() != null && s.getUserId().equals(currentAdminId);

        return UserSessionDtos.Response.builder()
                .id(s.getId())
                .userId(s.getUserId())
                .userName(userName)
                .userEmail(userEmail)
                .maskedToken("tok_live_••••••" + (s.getId().length() >= 4 ? s.getId().substring(s.getId().length() - 4) : "xxxx"))
                .ipAddress(s.getIpAddress())
                .userAgent(s.getDevice())
                .deviceType(deviceType)
                .os(os)
                .browser(browser)
                .locationEstimate(s.getLocation() != null ? s.getLocation() : "Hà Nội, Việt Nam (ước tính)")
                .authMethod("jwt")
                .status(status)
                .createdAt(s.getCreatedAt())
                .lastActiveAt(s.getLastActive())
                .expiresAt(s.getExpiresAt() != null ? s.getExpiresAt() : s.getCreatedAt().plusSeconds(86400 * 3))
                .isCurrentAdminSession(isCurrent)
                .build();
    }
}
