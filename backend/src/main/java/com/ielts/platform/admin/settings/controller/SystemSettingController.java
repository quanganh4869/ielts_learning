package com.ielts.platform.admin.settings.controller;

import com.ielts.platform.admin.settings.dto.UpdateSettingRequest;
import com.ielts.platform.admin.settings.model.SystemSettingEntity;
import com.ielts.platform.admin.settings.service.SystemSettingService;
import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.security.PermissionConstants;
import com.ielts.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/settings")
@RequiredArgsConstructor
@Tag(name = "System Settings", description = "Platform global configuration and feature flags")
public class SystemSettingController {

    private final SystemSettingService service;

    @GetMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.SYSTEM_SETTINGS_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "List all platform configuration key-values")
    public ApiResponse<List<SystemSettingEntity>> getAllSettings() {
        return ApiResponse.ok(service.getAllSettings());
    }

    @PatchMapping("/{key}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.SYSTEM_SETTINGS_MANAGE + "')")
    @Operation(summary = "Update an individual configuration key")
    public ApiResponse<SystemSettingEntity> updateSetting(
            @PathVariable String key,
            @Valid @RequestBody UpdateSettingRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Setting updated", service.updateSetting(key, request.getValue(), adminId, adminName));
    }
}
