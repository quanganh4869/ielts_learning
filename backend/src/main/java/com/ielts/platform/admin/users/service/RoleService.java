package com.ielts.platform.admin.users.service;

import com.ielts.platform.admin.audit.service.AuditLogService;
import com.ielts.platform.admin.users.dto.RoleDtos;
import com.ielts.platform.admin.users.model.PermissionEntity;
import com.ielts.platform.admin.users.model.RoleEntity;
import com.ielts.platform.admin.users.repository.PermissionRepository;
import com.ielts.platform.admin.users.repository.RoleRepository;
import com.ielts.platform.admin.users.repository.UserRepository;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<RoleDtos.Response> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleDtos.Response getRoleById(String id) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Role not found: " + id));
        return mapToDto(role);
    }

    @Transactional
    public RoleDtos.Response createRole(RoleDtos.UpsertRequest request, String adminId, String adminName) {
        if (roleRepository.findByNameIgnoreCase(request.getName()).isPresent()) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Role with name already exists: " + request.getName());
        }

        Set<PermissionEntity> permissions = new HashSet<>();
        if (request.getPermissionCodes() != null) {
            for (String code : request.getPermissionCodes()) {
                permissionRepository.findByCode(code).ifPresent(permissions::add);
            }
        }

        RoleEntity role = RoleEntity.builder()
                .id("role_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10))
                .name(request.getName())
                .description(request.getDescription())
                .isSystem(false)
                .permissions(permissions)
                .build();

        RoleEntity saved = roleRepository.save(role);
        auditLogService.record(adminId, adminName, "CREATE_ROLE", "ROLE", saved.getId(), "Created role: " + saved.getName(), null);
        return mapToDto(saved);
    }

    @Transactional
    public RoleDtos.Response updateRole(String id, RoleDtos.UpsertRequest request, String adminId, String adminName) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Role not found: " + id));

        if (!role.isSystem() && request.getName() != null && !request.getName().isBlank()) {
            role.setName(request.getName());
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        if (request.getPermissionCodes() != null) {
            Set<PermissionEntity> permissions = new HashSet<>();
            for (String code : request.getPermissionCodes()) {
                permissionRepository.findByCode(code).ifPresent(permissions::add);
            }
            role.setPermissions(permissions);
        }

        RoleEntity saved = roleRepository.save(role);
        auditLogService.record(adminId, adminName, "UPDATE_ROLE", "ROLE", saved.getId(), "Updated permissions for role: " + saved.getName(), null);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteRole(String id, String adminId, String adminName) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Role not found: " + id));

        if (role.isSystem()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "System built-in roles cannot be deleted");
        }

        roleRepository.delete(role);
        auditLogService.record(adminId, adminName, "DELETE_ROLE", "ROLE", id, "Deleted custom role: " + role.getName(), null);
    }

    private RoleDtos.Response mapToDto(RoleEntity r) {
        List<String> permCodes = r.getPermissions().stream().map(PermissionEntity::getCode).collect(Collectors.toList());
        return RoleDtos.Response.builder()
                .id(r.getId())
                .name(r.getName())
                .displayName(r.getName())
                .description(r.getDescription())
                .userCount(0)
                .isSystem(r.isSystem())
                .permissions(permCodes)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
