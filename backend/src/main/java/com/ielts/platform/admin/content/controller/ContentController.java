package com.ielts.platform.admin.content.controller;

import com.ielts.platform.admin.content.dto.ContentDtos;
import com.ielts.platform.admin.content.service.ContentService;
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
@RequestMapping("/admin/content")
@RequiredArgsConstructor
@Tag(name = "Content Curriculum", description = "Endpoints for Modules, Lessons, Grammar Rules, and Media Assets")
public class ContentController {

    private final ContentService contentService;

    // --- Modules ---
    @GetMapping("/modules")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get all modules ordered by sequence")
    public ApiResponse<List<ContentDtos.ModuleDto>> getAllModules() {
        return ApiResponse.ok(contentService.getAllModules());
    }

    @PostMapping("/modules")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "')")
    @Operation(summary = "Create a new module")
    public ApiResponse<ContentDtos.ModuleDto> createModule(
            @Valid @RequestBody ContentDtos.ModuleDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Module created", contentService.createModule(dto, adminId, adminName));
    }

    @PutMapping("/modules/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "')")
    @Operation(summary = "Update module details")
    public ApiResponse<ContentDtos.ModuleDto> updateModule(
            @PathVariable String id,
            @Valid @RequestBody ContentDtos.ModuleDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Module updated", contentService.updateModule(id, dto, adminId, adminName));
    }

    @DeleteMapping("/modules/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "')")
    @Operation(summary = "Delete module and cascaded lessons")
    public ApiResponse<Void> deleteModule(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        contentService.deleteModule(id, adminId, adminName);
        return ApiResponse.ok("Module deleted", null);
    }

    // --- Lessons ---
    @GetMapping("/lessons")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get all lessons across all modules")
    public ApiResponse<List<ContentDtos.LessonDto>> getAllLessons() {
        return ApiResponse.ok(contentService.getAllLessons());
    }

    @GetMapping("/lessons/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get lesson details by ID")
    public ApiResponse<ContentDtos.LessonDto> getLessonById(@PathVariable String id) {
        return ApiResponse.ok(contentService.getLessonById(id));
    }

    @GetMapping("/modules/{moduleId}/lessons")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get lessons within a module")
    public ApiResponse<List<ContentDtos.LessonDto>> getLessonsByModule(@PathVariable String moduleId) {
        return ApiResponse.ok(contentService.getLessonsByModule(moduleId));
    }

    @PostMapping("/lessons")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "')")
    @Operation(summary = "Create a lesson")
    public ApiResponse<ContentDtos.LessonDto> createLesson(
            @Valid @RequestBody ContentDtos.LessonDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Lesson created", contentService.createLesson(dto, adminId, adminName));
    }

    @PutMapping("/lessons/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "')")
    @Operation(summary = "Update lesson details")
    public ApiResponse<ContentDtos.LessonDto> updateLesson(
            @PathVariable String id,
            @Valid @RequestBody ContentDtos.LessonDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Lesson updated", contentService.updateLesson(id, dto, adminId, adminName));
    }

    @DeleteMapping("/lessons/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "')")
    @Operation(summary = "Delete a lesson")
    public ApiResponse<Void> deleteLesson(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        contentService.deleteLesson(id, adminId, adminName);
        return ApiResponse.ok("Lesson deleted", null);
    }

    // --- Grammar Rules ---
    @GetMapping("/grammar")
    @PreAuthorize("hasAuthority('" + PermissionConstants.VOCABULARY_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get paginated grammar rules")
    public ApiResponse<PageResponse<ContentDtos.GrammarRuleDto>> getGrammarRules(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(PageResponse.of(contentService.getGrammarRules(pageable)));
    }

    @PostMapping("/grammar")
    @PreAuthorize("hasAuthority('" + PermissionConstants.VOCABULARY_MANAGE + "')")
    @Operation(summary = "Create a grammar rule")
    public ApiResponse<ContentDtos.GrammarRuleDto> createGrammarRule(
            @Valid @RequestBody ContentDtos.GrammarRuleDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Grammar rule created", contentService.createGrammarRule(dto, adminId, adminName));
    }

    @PutMapping("/grammar/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.VOCABULARY_MANAGE + "')")
    @Operation(summary = "Update grammar rule")
    public ApiResponse<ContentDtos.GrammarRuleDto> updateGrammarRule(
            @PathVariable String id,
            @Valid @RequestBody ContentDtos.GrammarRuleDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Grammar rule updated", contentService.updateGrammarRule(id, dto, adminId, adminName));
    }

    @DeleteMapping("/grammar/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.VOCABULARY_MANAGE + "')")
    @Operation(summary = "Delete grammar rule")
    public ApiResponse<Void> deleteGrammarRule(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        contentService.deleteGrammarRule(id, adminId, adminName);
        return ApiResponse.ok("Grammar rule deleted", null);
    }

    // --- Media Assets ---
    @GetMapping("/media")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get paginated media assets")
    public ApiResponse<PageResponse<ContentDtos.MediaAssetDto>> getMediaAssets(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(PageResponse.of(contentService.getMediaAssets(pageable)));
    }

    @PostMapping("/media")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "')")
    @Operation(summary = "Register a new media asset")
    public ApiResponse<ContentDtos.MediaAssetDto> createMediaAsset(
            @Valid @RequestBody ContentDtos.MediaAssetDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("Media asset created", contentService.createMediaAsset(dto, adminId, adminName));
    }

    @DeleteMapping("/media/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CONTENT_MANAGE + "')")
    @Operation(summary = "Delete media asset")
    public ApiResponse<Void> deleteMediaAsset(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        contentService.deleteMediaAsset(id, adminId, adminName);
        return ApiResponse.ok("Media asset deleted", null);
    }
}
