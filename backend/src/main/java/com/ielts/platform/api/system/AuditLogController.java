package com.ielts.platform.api.system;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import com.ielts.platform.core.common.ApiResponse;
import com.ielts.platform.core.common.PageResponse;
import com.ielts.platform.core.security.PermissionConstants;
import com.ielts.platform.db.model.AuditLogEntity;
import com.ielts.platform.services.AuditLogService;

@RestController
@RequestMapping("/admin/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Query immutable system and administrative audit logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get paginated audit trail logs")
    public ApiResponse<PageResponse<AuditLogEntity>> getAuditLogs(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.ok(PageResponse.of(auditLogService.getAuditLogs(pageable)));
    }
}
