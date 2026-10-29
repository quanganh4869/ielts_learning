package com.ielts.platform.api.dashboard;

import java.util.HashMap;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import com.ielts.platform.core.common.ApiResponse;
import com.ielts.platform.db.model.UserEntity;
import com.ielts.platform.db.repository.AssessmentAttemptRepository;
import com.ielts.platform.db.repository.UserRepository;

@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Analytics", description = "Aggregated intelligence on platform growth, test scores, and retention")
public class ReportsController {

    private final UserRepository userRepository;
    private final AssessmentAttemptRepository attemptRepository;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get aggregated analytics metrics for reporting")
    public ApiResponse<Map<String, Object>> getReportSummary(@RequestParam(defaultValue = "30d") String range) {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserEntity.UserStatus.ACTIVE);
        long totalAttempts = attemptRepository.count();
        Double avgBand = attemptRepository.findAverageBandScore();

        Map<String, Object> summary = new HashMap<>();
        summary.put("range", range);
        summary.put("totalUsers", totalUsers);
        summary.put("activeUsers", activeUsers);
        summary.put("totalAttempts", totalAttempts);
        summary.put("averageBandScore", avgBand != null ? Math.round(avgBand * 10.0) / 10.0 : 0.0);
        summary.put("generatedAt", java.time.Instant.now());

        return ApiResponse.ok(summary);
    }
}
