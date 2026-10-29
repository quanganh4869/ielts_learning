package com.ielts.platform.api.question;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import com.ielts.platform.core.common.ApiResponse;
import com.ielts.platform.core.common.PageResponse;
import com.ielts.platform.core.security.PermissionConstants;
import com.ielts.platform.core.security.UserPrincipal;
import com.ielts.platform.schemas.question.QuestionAndAssessmentDtos;
import com.ielts.platform.services.QuestionAndAssessmentService;

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

    @GetMapping("/questions/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.QUESTION_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get question by ID")
    public ApiResponse<QuestionAndAssessmentDtos.QuestionDto> getQuestionById(@PathVariable String id) {
        return ApiResponse.ok(service.getQuestionById(id));
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

    @GetMapping("/assessments/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.TEST_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get assessment by ID")
    public ApiResponse<QuestionAndAssessmentDtos.AssessmentDto> getAssessmentById(@PathVariable String id) {
        return ApiResponse.ok(service.getAssessmentById(id));
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

    @PutMapping("/assessments/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.TEST_MANAGE + "')")
    @Operation(summary = "Update an assessment")
    public ApiResponse<QuestionAndAssessmentDtos.AssessmentDto> updateAssessment(
            @PathVariable String id,
            @Valid @RequestBody QuestionAndAssessmentDtos.AssessmentDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Assessment updated", service.updateAssessment(id, dto, adminId, adminName));
    }

    @DeleteMapping("/assessments/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.TEST_MANAGE + "')")
    @Operation(summary = "Delete an assessment")
    public ApiResponse<Void> deleteAssessment(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        service.deleteAssessment(id, adminId, adminName);
        return ApiResponse.ok("Assessment deleted", null);
    }

    // --- Attempts ---
    @GetMapping("/assessments/attempts")
    @PreAuthorize("hasAuthority('" + PermissionConstants.TEST_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "List learner assessment submissions and scores")
    public ApiResponse<PageResponse<QuestionAndAssessmentDtos.AssessmentAttemptDto>> getAttempts(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(PageResponse.of(service.getAttempts(pageable)));
    }

    @GetMapping("/assessments/attempts/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.TEST_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get detailed assessment attempt by ID")
    public ApiResponse<QuestionAndAssessmentDtos.AssessmentAttemptDto> getAttemptById(@PathVariable String id) {
        return ApiResponse.ok(service.getAttemptById(id));
    }

    // --- Learning Plans ---
    @GetMapping("/learning-plans")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "List all structured learning plans")
    public ApiResponse<List<QuestionAndAssessmentDtos.LearningPlanDto>> getLearningPlans() {
        return ApiResponse.ok(service.getLearningPlans());
    }

    @GetMapping("/learning-plans/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get learning plan by ID")
    public ApiResponse<QuestionAndAssessmentDtos.LearningPlanDto> getLearningPlanById(@PathVariable String id) {
        return ApiResponse.ok(service.getLearningPlanById(id));
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

    @PutMapping("/learning-plans/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "')")
    @Operation(summary = "Update a learning plan")
    public ApiResponse<QuestionAndAssessmentDtos.LearningPlanDto> updateLearningPlan(
            @PathVariable String id,
            @Valid @RequestBody QuestionAndAssessmentDtos.LearningPlanDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Learning plan updated", service.updateLearningPlan(id, dto, adminId, adminName));
    }

    @DeleteMapping("/learning-plans/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "')")
    @Operation(summary = "Delete a learning plan")
    public ApiResponse<Void> deleteLearningPlan(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        service.deleteLearningPlan(id, adminId, adminName);
        return ApiResponse.ok("Learning plan deleted", null);
    }
}
