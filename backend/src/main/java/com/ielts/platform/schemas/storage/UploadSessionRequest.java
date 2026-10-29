package com.ielts.platform.schemas.storage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ielts.platform.db.model.ResourceType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadSessionRequest {

    @NotNull(message = "Resource type is required")
    private ResourceType resourceType;

    @NotBlank(message = "Content type (MIME type) is required")
    private String contentType;

    @Positive(message = "File size must be positive")
    private long fileSizeBytes;

    private String originalFilename;
}
