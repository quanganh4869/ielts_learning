package com.ielts.platform.schemas.storage;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadSessionResponse {

    private String fileId;
    private String uploadUrl;
    private String objectKey;
    private Instant expiresAt;
    private long maxFileSizeBytes;
    private String contentType;
}
