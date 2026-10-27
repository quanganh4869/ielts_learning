package com.ielts.platform.admin.questions.controller;

import com.ielts.platform.admin.questions.dto.QuestionAndAssessmentDtos;
import com.ielts.platform.admin.questions.service.QuestionAndAssessmentService;
import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.common.PageResponse;
import com.ielts.platform.security.PermissionConstants;
import com.ielts.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Question Bank & Assessments", description = "Endpoints for managing question bank, mock tests, and learning plans")
public class QuestionAndAssessmentController {

    private final QuestionAndAssessmentService service;

    // --- Questions ---
    @GetMapping("/questions")
    @PreAuthorize("hasAuthority('" + PermissionConstants.QUESTION_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Search question bank by prompt, skill, or question type")
    public ApiResponse<PageResponse<QuestionAndAssessmentDtos.QuestionDto>> searchQuestions(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String type,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.ok(PageResponse.of(service.searchQuestions(q, skill, type, pageable)));
    }

    @PostMapping("/questions")
    @PreAuthorize("hasAuthority('" + PermissionConstants.QUESTION_MANAGE + "')")
    @Operation(summary = "Add a question to the item bank")
    public ApiResponse<QuestionAndAssessmentDtos.QuestionDto> createQuestion(
            @Valid @RequestBody QuestionAndAssessmentDtos.QuestionDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Question created", service.createQuestion(dto, adminId, adminName));
    }

    @PutMapping("/questions/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.QUESTION_MANAGE + "')")
    @Operation(summary = "Update an existing question")
    public ApiResponse<QuestionAndAssessmentDtos.QuestionDto> updateQuestion(
            @PathVariable String id,
            @Valid @RequestBody QuestionAndAssessmentDtos.QuestionDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Question updated", service.updateQuestion(id, dto, adminId, adminName));
    }

    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.QUESTION_MANAGE + "')")
    @Operation(summary = "Delete question")
    public ApiResponse<Void> deleteQuestion(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        service.deleteQuestion(id, adminId, adminName);
        return ApiResponse.ok("Question deleted", null);
    }

    // --- Assessments ---
    @GetMapping("/assessments")
    @PreAuthorize("hasAuthority('" + PermissionConstants.TEST_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "List all assessments and mock tests")
    public ApiResponse<PageResponse<QuestionAndAssessmentDtos.AssessmentDto>> getAssessments(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(PageResponse.of(service.getAssessments(pageable)));
    }

    @PostMapping("/assessments")
    @PreAuthorize("hasAuthority('" + PermissionConstants.TEST_MANAGE + "')")
    @Operation(summary = "Create a new mock test / assessment")
    public ApiResponse<QuestionAndAssessmentDtos.AssessmentDto> createAssessment(
            @Valid @RequestBody QuestionAndAssessmentDtos.AssessmentDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Assessment created", service.createAssessment(dto, adminId, adminName));
    }

    // --- Learning Plans ---
    @GetMapping("/learning-plans")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "List all structured learning plans")
    public ApiResponse<List<QuestionAndAssessmentDtos.LearningPlanDto>> getLearningPlans() {
        return ApiResponse.ok(service.getLearningPlans());
    }

    @PostMapping("/learning-plans")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "')")
    @Operation(summary = "Create a structured learning plan")
    public ApiResponse<QuestionAndAssessmentDtos.LearningPlanDto> createLearningPlan(
            @Valid @RequestBody QuestionAndAssessmentDtos.LearningPlanDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Learning plan created", service.createLearningPlan(dto, adminId, adminName));
    }
}
