package com.ielts.platform.chatbot.api;

import com.ielts.platform.chatbot.application.KnowledgeService;
import com.ielts.platform.chatbot.domain.KnowledgeChunk;
import com.ielts.platform.chatbot.domain.KnowledgeDocument;
import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.common.PageResponse;
import com.ielts.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/knowledge")
@Tag(name = "Admin Knowledge Base", description = "Quản lý cơ sở tri thức IELTS được phê duyệt cho RAG Chatbot")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class KnowledgeAdminController {

    private final KnowledgeService knowledgeService;

    @Data
    public static class IngestTextRequest {
        @NotBlank(message = "Tiêu đề không được để trống")
        private String title;
        private String category;
        private String sourceFilename;
        @NotBlank(message = "Nội dung không được để trống")
        private String content;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách các tài liệu tri thức trong Knowledge Base")
    public ResponseEntity<ApiResponse<PageResponse<KnowledgeDocument>>> listDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<KnowledgeDocument> paged = knowledgeService.listDocuments(PageRequest.of(page, size));
        PageResponse<KnowledgeDocument> pageResp = PageResponse.<KnowledgeDocument>builder()
                .items(paged.getContent())
                .pageNumber(paged.getNumber())
                .pageSize(paged.getSize())
                .totalElements(paged.getTotalElements())
                .totalPages(paged.getTotalPages())
                .isFirst(paged.isFirst())
                .isLast(paged.isLast())
                .build();
        return ResponseEntity.ok(ApiResponse.ok(pageResp));
    }

    @GetMapping("/{documentId}")
    @Operation(summary = "Xem chi tiết một tài liệu tri thức")
    public ResponseEntity<ApiResponse<KnowledgeDocument>> getDocument(@PathVariable String documentId) {
        return ResponseEntity.ok(ApiResponse.ok(knowledgeService.getDocument(documentId)));
    }

    @GetMapping("/{documentId}/chunks")
    @Operation(summary = "Xem danh sách các chunk đã phân tách của tài liệu")
    public ResponseEntity<ApiResponse<List<KnowledgeChunk>>> getDocumentChunks(@PathVariable String documentId) {
        return ResponseEntity.ok(ApiResponse.ok(knowledgeService.getDocumentChunks(documentId)));
    }

    @PostMapping("/ingest")
    @Operation(summary = "Thêm và phân đoạn một tài liệu mới vào Knowledge Base")
    public ResponseEntity<ApiResponse<KnowledgeDocument>> ingestDocument(
            @RequestBody IngestTextRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system_admin";
        KnowledgeDocument doc = knowledgeService.createAndIndexTextDocument(
                request.getTitle(),
                request.getCategory(),
                request.getSourceFilename(),
                request.getContent(),
                adminId
        );
        return ResponseEntity.ok(ApiResponse.ok(doc));
    }

    @PostMapping("/{documentId}/approve")
    @Operation(summary = "Phê duyệt tài liệu cho phép RAG Chatbot truy xuất")
    public ResponseEntity<ApiResponse<KnowledgeDocument>> approveDocument(
            @PathVariable String documentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system_admin";
        return ResponseEntity.ok(ApiResponse.ok(knowledgeService.approveDocument(documentId, adminId)));
    }

    @PostMapping("/{documentId}/reject")
    @Operation(summary = "Từ chối/hủy phê duyệt tài liệu")
    public ResponseEntity<ApiResponse<KnowledgeDocument>> rejectDocument(
            @PathVariable String documentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system_admin";
        return ResponseEntity.ok(ApiResponse.ok(knowledgeService.rejectDocument(documentId, adminId)));
    }
}
