package com.ielts.platform.admin.dashboard.controller;

import com.ielts.platform.admin.dashboard.dto.DashboardSummaryDto;
import com.ielts.platform.admin.dashboard.service.DashboardService;
import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.security.PermissionConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "High-level summary metrics, activity charts, and attention alerts")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get aggregated admin KPIs, 7-day activity metrics, and attention items")
    public ApiResponse<DashboardSummaryDto> getSummary() {
        return ApiResponse.ok(dashboardService.getDashboardSummary());
    }
}
