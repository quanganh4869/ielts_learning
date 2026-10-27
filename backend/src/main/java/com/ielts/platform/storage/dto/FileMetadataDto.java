package com.ielts.platform.storage.dto;

import com.ielts.platform.storage.AccessLevel;
import com.ielts.platform.storage.ResourceType;
import com.ielts.platform.storage.UploadStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileMetadataDto {

    private String id;
    private String objectKey;
    private String bucketName;
    private ResourceType resourceType;
    private String originalFilename;
    private String contentType;
    private Long fileSizeBytes;
    private String ownerId;
    private AccessLevel accessLevel;
    private UploadStatus uploadStatus;
    private String downloadUrl;
    private Instant createdAt;
}
