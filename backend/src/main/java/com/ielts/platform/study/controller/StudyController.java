package com.ielts.platform.study.controller;

import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.common.PageResponse;
import com.ielts.platform.security.UserPrincipal;
import com.ielts.platform.study.dto.StudyDtos.*;
import com.ielts.platform.study.service.StudyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/study")
@RequiredArgsConstructor
@Tag(name = "Learner Study & Ownership", description = "Endpoints for practice sessions, personal vocabulary, and mock test attempts protected by user resource ownership")
public class StudyController {

    private final StudyService studyService;

    // --- Practice Sessions ---

    @GetMapping("/practice-sessions")
    @Operation(summary = "Get current learner's practice sessions")
    public ApiResponse<PageResponse<PracticeSessionDto>> getMyPracticeSessions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20, sort = "startedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.ok(studyService.getMyPracticeSessions(principal, pageable));
    }

    @PostMapping("/practice-sessions")
    @Operation(summary = "Start a new practice session for current learner")
    public ApiResponse<PracticeSessionDto> startPracticeSession(
            @Valid @RequestBody CreatePracticeSessionRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(studyService.startPracticeSession(request, principal));
    }

    @GetMapping("/practice-sessions/{id}")
    @Operation(summary = "Get practice session details (owner or admin)")
    public ApiResponse<PracticeSessionDto> getPracticeSession(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(studyService.getPracticeSession(id, principal));
    }

    @PatchMapping("/practice-sessions/{id}/complete")
    @Operation(summary = "Complete a practice session (owner or admin)")
    public ApiResponse<PracticeSessionDto> completePracticeSession(
            @PathVariable String id,
            @Valid @RequestBody CompletePracticeSessionRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(studyService.completePracticeSession(id, request, principal));
    }

    // --- Personal Vocabulary Notebook ---

    @GetMapping("/user-vocabulary")
    @Operation(summary = "Get current learner's personal vocabulary notebook")
    public ApiResponse<PageResponse<UserVocabularyDto>> getMyVocabulary(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.ok(studyService.getMyVocabulary(principal, pageable));
    }

    @PostMapping("/user-vocabulary")
    @Operation(summary = "Add a word to current learner's personal vocabulary notebook")
    public ApiResponse<UserVocabularyDto> addVocabulary(
            @Valid @RequestBody CreateUserVocabularyRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(studyService.addVocabulary(request, principal));
    }

    @DeleteMapping("/user-vocabulary/{id}")
    @Operation(summary = "Delete a word from personal vocabulary notebook (owner or admin)")
    public ApiResponse<Void> deleteVocabulary(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        studyService.deleteVocabulary(id, principal);
        return ApiResponse.ok("Vocabulary word deleted successfully", null);
    }

    // --- Test Attempts ---

    @GetMapping("/test-attempts")
    @Operation(summary = "Get current learner's mock test attempts")
    public ApiResponse<PageResponse<TestAttemptDto>> getMyTestAttempts(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20, sort = "startedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.ok(studyService.getMyTestAttempts(principal, pageable));
    }

    @PostMapping("/test-attempts")
    @Operation(summary = "Start a new mock test attempt for current learner")
    public ApiResponse<TestAttemptDto> startTestAttempt(
            @Valid @RequestBody StartTestAttemptRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(studyService.startTestAttempt(request.getAssessmentId(), principal));
    }

    @GetMapping("/test-attempts/{id}")
    @Operation(summary = "Get test attempt details (owner or admin)")
    public ApiResponse<TestAttemptDto> getTestAttempt(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(studyService.getTestAttempt(id, principal));
    }

    @PatchMapping("/test-attempts/{id}/submit")
    @Operation(summary = "Submit answers for test attempt with server-side grading (owner or admin)")
    public ApiResponse<TestAttemptDto> submitTestAttempt(
            @PathVariable String id,
            @Valid @RequestBody SubmitAttemptRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(studyService.submitTestAttempt(id, request, principal));
    }
}
