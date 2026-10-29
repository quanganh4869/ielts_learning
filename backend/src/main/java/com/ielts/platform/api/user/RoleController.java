package com.ielts.platform.api.user;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import com.ielts.platform.core.common.ApiResponse;
import com.ielts.platform.core.security.UserPrincipal;
import com.ielts.platform.schemas.user.RoleDtos;
import com.ielts.platform.services.RoleService;

@RestController
@RequestMapping("/admin/roles")
@RequiredArgsConstructor
@Tag(name = "Roles & Permissions", description = "RBAC role management and permission assignments")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "List all platform roles and permission sets")
    public ApiResponse<List<RoleDtos.Response>> getAllRoles() {
        return ApiResponse.ok(roleService.getAllRoles());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get role details and permissions")
    public ApiResponse<RoleDtos.Response> getRoleById(@PathVariable String id) {
        return ApiResponse.ok(roleService.getRoleById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create custom RBAC role")
    public ApiResponse<RoleDtos.Response> createRole(
            @Valid @RequestBody RoleDtos.UpsertRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Role created", roleService.createRole(request, adminId, adminName));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update role permissions")
    public ApiResponse<RoleDtos.Response> updateRole(
            @PathVariable String id,
            @Valid @RequestBody RoleDtos.UpsertRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Role updated", roleService.updateRole(id, request, adminId, adminName));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete custom role")
    public ApiResponse<Void> deleteRole(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        roleService.deleteRole(id, adminId, adminName);
        return ApiResponse.ok("Role deleted", null);
    }
}
