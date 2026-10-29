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
import com.ielts.platform.schemas.system.ServicePlanDtos;
import com.ielts.platform.services.ServicePlanService;

@RestController
@RequestMapping("/admin/service-plans")
@RequiredArgsConstructor
@Tag(name = "Service Plans & Subscriptions", description = "CRUD operations for user subscription tiers")
public class ServicePlanController {

    private final ServicePlanService service;

    @GetMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.SYSTEM_SETTINGS_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "List all subscription tiers")
    public ApiResponse<List<ServicePlanDtos.Response>> getAllPlans() {
        return ApiResponse.ok(service.getAllPlans());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.SYSTEM_SETTINGS_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get tier details by ID")
    public ApiResponse<ServicePlanDtos.Response> getPlanById(@PathVariable String id) {
        return ApiResponse.ok(service.getPlanById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.SYSTEM_SETTINGS_MANAGE + "')")
    @Operation(summary = "Create subscription tier")
    public ApiResponse<ServicePlanDtos.Response> createPlan(
            @Valid @RequestBody ServicePlanDtos.UpsertRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Service plan created", service.createPlan(request, adminId, adminName));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.SYSTEM_SETTINGS_MANAGE + "')")
    @Operation(summary = "Update subscription tier")
    public ApiResponse<ServicePlanDtos.Response> updatePlan(
            @PathVariable String id,
            @Valid @RequestBody ServicePlanDtos.UpsertRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Service plan updated", service.updatePlan(id, request, adminId, adminName));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.SYSTEM_SETTINGS_MANAGE + "')")
    @Operation(summary = "Delete subscription tier")
    public ApiResponse<Void> deletePlan(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        service.deletePlan(id, adminId, adminName);
        return ApiResponse.ok("Service plan deleted", null);
    }
}
