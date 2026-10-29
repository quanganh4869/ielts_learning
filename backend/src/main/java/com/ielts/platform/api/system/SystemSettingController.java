package com.ielts.platform.api.system;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import com.ielts.platform.core.common.ApiResponse;
import com.ielts.platform.core.security.PermissionConstants;
import com.ielts.platform.core.security.UserPrincipal;
import com.ielts.platform.db.model.SystemSettingEntity;
import com.ielts.platform.schemas.system.UpdateSettingRequest;
import com.ielts.platform.services.SystemSettingService;

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
