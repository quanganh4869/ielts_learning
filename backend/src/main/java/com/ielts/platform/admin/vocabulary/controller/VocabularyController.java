package com.ielts.platform.admin.vocabulary.controller;

import com.ielts.platform.admin.vocabulary.dto.VocabularyDtos;
import com.ielts.platform.admin.vocabulary.service.VocabularyService;
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

@RestController
@RequestMapping("/admin/vocabulary")
@RequiredArgsConstructor
@Tag(name = "Vocabulary Bank", description = "CRUD operations and search for IELTS vocabulary dictionary")
public class VocabularyController {

    private final VocabularyService vocabularyService;

    @GetMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.VOCABULARY_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Search vocabulary bank by word, CEFR, or status")
    public ApiResponse<PageResponse<VocabularyDtos.Response>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String cefr,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.ok(PageResponse.of(vocabularyService.search(q, cefr, status, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.VOCABULARY_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get vocabulary word details by ID")
    public ApiResponse<VocabularyDtos.Response> getById(@PathVariable String id) {
        return ApiResponse.ok(vocabularyService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.VOCABULARY_MANAGE + "')")
    @Operation(summary = "Add a new vocabulary word to the database")
    public ApiResponse<VocabularyDtos.Response> create(
            @Valid @RequestBody VocabularyDtos.UpsertRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Vocabulary word created", vocabularyService.create(request, adminId, adminName));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.VOCABULARY_MANAGE + "')")
    @Operation(summary = "Update an existing vocabulary word")
    public ApiResponse<VocabularyDtos.Response> update(
            @PathVariable String id,
            @Valid @RequestBody VocabularyDtos.UpsertRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Vocabulary word updated", vocabularyService.update(id, request, adminId, adminName));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.VOCABULARY_MANAGE + "')")
    @Operation(summary = "Delete a vocabulary word")
    public ApiResponse<Void> delete(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        vocabularyService.delete(id, adminId, adminName);
        return ApiResponse.ok("Vocabulary word deleted successfully", null);
    }
}
