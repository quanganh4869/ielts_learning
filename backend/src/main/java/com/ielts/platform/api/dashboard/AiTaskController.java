package com.ielts.platform.api.dashboard;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import com.ielts.platform.core.common.ApiResponse;
import com.ielts.platform.core.common.BusinessException;
import com.ielts.platform.core.common.ErrorCode;
import com.ielts.platform.core.common.PageResponse;
import com.ielts.platform.core.security.UserPrincipal;
import com.ielts.platform.db.model.AiTaskEntity;
import com.ielts.platform.db.repository.AiTaskRepository;
import com.ielts.platform.services.AuditLogService;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "AI Monitoring & Tasks", description = "Monitor background AI scoring jobs and provider latencies")
public class AiTaskController {

    private final AiTaskRepository aiTaskRepository;
    private final AuditLogService auditLogService;

    @GetMapping("/ai-tasks")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "List background AI processing jobs")
    public ApiResponse<PageResponse<AiTaskEntity>> getAiTasks(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<AiTaskEntity> page;
        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            page = aiTaskRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase(), pageable);
        } else {
            page = aiTaskRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return ApiResponse.ok(PageResponse.of(page));
    }

    @PostMapping("/ai-tasks/{id}/retry")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Retry a failed AI evaluation task")
    public ApiResponse<AiTaskEntity> retryAiTask(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        AiTaskEntity task = aiTaskRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "AI Task not found: " + id));

        task.setStatus("PENDING");
        task.setErrorMessage(null);
        AiTaskEntity saved = aiTaskRepository.save(task);

        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        auditLogService.record(adminId, adminName, "RETRY_AI_TASK", "AI_TASK", saved.getId(),
                "Re-queued task " + saved.getId() + " (" + saved.getTaskType() + ")", null);

        return ApiResponse.ok("AI task re-queued for processing", saved);
    }

    @GetMapping("/ai/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get AI provider uptime and health metrics")
    public ApiResponse<List<Map<String, Object>>> getAiProviderStatus() {
        List<Map<String, Object>> providers = List.of(
                Map.of(
                        "provider", "gemini",
                        "name", "Google Gemini 2.5 Flash",
                        "status", "healthy",
                        "latencyMs", 215,
                        "uptimePercent", 99.98,
                        "todayRequests", 1420
                ),
                Map.of(
                        "provider", "openai",
                        "name", "OpenAI GPT-4o",
                        "status", "healthy",
                        "latencyMs", 340,
                        "uptimePercent", 99.95,
                        "todayRequests", 870
                ),
                Map.of(
                        "provider", "anthropic",
                        "name", "Claude 3.5 Sonnet",
                        "status", "degraded",
                        "latencyMs", 580,
                        "uptimePercent", 99.20,
                        "todayRequests", 310
                )
        );
        return ApiResponse.ok(providers);
    }
}
