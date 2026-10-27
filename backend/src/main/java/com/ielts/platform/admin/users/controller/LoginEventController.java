package com.ielts.platform.admin.users.controller;

import com.ielts.platform.admin.users.dto.LoginEventDtos;
import com.ielts.platform.admin.users.model.LoginEventEntity;
import com.ielts.platform.admin.users.repository.LoginEventRepository;
import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.common.PageResponse;
import com.ielts.platform.security.PermissionConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/login-events")
@RequiredArgsConstructor
@Tag(name = "Login History & Events", description = "Query immutable authentication and session lifecycle events")
public class LoginEventController {

    private final LoginEventRepository loginEventRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Search and filter immutable login audit events")
    public ApiResponse<PageResponse<LoginEventDtos.Response>> getLoginEvents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        String filterStatus = (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) ? status : null;
        String filterQuery = (q != null && !q.isBlank()) ? q.trim() : null;

        Page<LoginEventEntity> page = loginEventRepository.searchEvents(filterStatus, filterQuery, pageable);
        return ApiResponse.ok(PageResponse.of(page.map(this::mapToDto)));
    }

    private LoginEventDtos.Response mapToDto(LoginEventEntity entity) {
        String eventType = "login_" + entity.getStatus().toLowerCase();
        if ("User Logout".equalsIgnoreCase(entity.getReason())) {
            eventType = "logout";
        }

        String rawDevice = entity.getDevice() != null ? entity.getDevice() : "Web Browser";
        String deviceInfo = rawDevice;
        if (rawDevice.contains("Windows")) deviceInfo = "Desktop (Windows 11 / Chrome)";
        else if (rawDevice.contains("iPhone")) deviceInfo = "Mobile (iOS / Safari)";
        else if (rawDevice.contains("Android")) deviceInfo = "Mobile (Android / Chrome)";
        else if (rawDevice.contains("Macintosh")) deviceInfo = "Desktop (macOS / Safari)";

        return LoginEventDtos.Response.builder()
                .id(entity.getId())
                .timestamp(entity.getCreatedAt())
                .userId(entity.getUserId())
                .userEmail(entity.getUserEmail())
                .eventType(eventType)
                .status(entity.getStatus().toLowerCase())
                .failureReason(entity.getStatus().equalsIgnoreCase("FAILED") ? entity.getReason() : null)
                .authMethod("jwt")
                .ipAddress(entity.getIpAddress())
                .userAgent(entity.getDevice())
                .deviceInfo(deviceInfo)
                .correlationId("req_auth_" + (entity.getId().length() >= 8 ? entity.getId().substring(entity.getId().length() - 8) : entity.getId()))
                .build();
    }
}
