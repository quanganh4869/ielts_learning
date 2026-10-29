package com.ielts.platform.schemas.storage;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ielts.platform.db.model.AccessLevel;
import com.ielts.platform.db.model.ResourceType;
import com.ielts.platform.db.model.UploadStatus;

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
