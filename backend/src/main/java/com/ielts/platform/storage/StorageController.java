package com.ielts.platform.storage;

import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.security.UserPrincipal;
import com.ielts.platform.storage.dto.FileMetadataDto;
import com.ielts.platform.storage.dto.UploadSessionRequest;
import com.ielts.platform.storage.dto.UploadSessionResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
@Tag(name = "Cloudflare R2 Storage", description = "Presigned upload URLs, download access and binary file metadata")
public class StorageController {

    private final StorageService storageService;

    @PostMapping("/upload-session")
    @Operation(summary = "Request a presigned PUT URL for direct-to-R2 file upload")
    public ApiResponse<UploadSessionResponse> initiateUploadSession(
            @Valid @RequestBody UploadSessionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ApiResponse.ok(storageService.initiateUploadSession(request, currentUser));
    }

    @PostMapping("/complete-upload/{fileId}")
    @Operation(summary = "Confirm that file upload to R2 completed and finalize metadata")
    public ApiResponse<FileMetadataDto> completeUpload(
            @PathVariable String fileId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ApiResponse.ok(storageService.completeUpload(fileId, currentUser));
    }

    @GetMapping("/{fileId}/download-url")
    @Operation(summary = "Get a secure presigned GET URL or CDN URL for reading/listening to a file")
    public ApiResponse<Map<String, String>> getDownloadUrl(
            @PathVariable String fileId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String downloadUrl = storageService.generateDownloadUrl(fileId, currentUser);
        return ApiResponse.ok(Map.of("fileId", fileId, "downloadUrl", downloadUrl));
    }

    @GetMapping("/{fileId}")
    @Operation(summary = "Get file metadata and authorized download link")
    public ApiResponse<FileMetadataDto> getMetadata(
            @PathVariable String fileId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ApiResponse.ok(storageService.getMetadata(fileId, currentUser));
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "Delete an uploaded file from R2 and mark as deleted")
    public ApiResponse<Void> deleteFile(
            @PathVariable String fileId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        storageService.deleteFile(fileId, currentUser);
        return ApiResponse.ok(null);
    }
}
