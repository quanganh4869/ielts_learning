package com.ielts.platform.services;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import com.ielts.platform.config.properties.R2StorageProperties;
import com.ielts.platform.core.common.BusinessException;
import com.ielts.platform.core.common.ErrorCode;
import com.ielts.platform.core.security.UserPrincipal;
import com.ielts.platform.db.model.AccessLevel;
import com.ielts.platform.db.model.FileMetadataEntity;
import com.ielts.platform.db.model.ResourceType;
import com.ielts.platform.db.model.UploadStatus;
import com.ielts.platform.db.model.UserEntity;
import com.ielts.platform.db.repository.FileMetadataRepository;
import com.ielts.platform.db.repository.UserRepository;
import com.ielts.platform.schemas.storage.FileMetadataDto;
import com.ielts.platform.schemas.storage.UploadSessionRequest;
import com.ielts.platform.schemas.storage.UploadSessionResponse;

@Slf4j
@Service
@RequiredArgsConstructor
public class R2StorageService implements StorageService {

    private final R2StorageProperties properties;
    private final FileMetadataRepository fileMetadataRepository;
    private final UserRepository userRepository;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Override
    @Transactional
    public UploadSessionResponse initiateUploadSession(UploadSessionRequest request, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Authentication required to request upload session");
        }

        ResourceType resourceType = request.getResourceType();

        // 1. Role-based upload permission validation
        if (resourceType == ResourceType.LISTENING_AUDIO || resourceType == ResourceType.LESSON_MATERIAL) {
            boolean isAdmin = currentUser.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ROLE_SUPER_ADMIN".equals(a.getAuthority()));
            if (!isAdmin) {
                throw new AccessDeniedException("Administrative privileges required to upload learning course content");
            }
        }

        // 2. MIME type validation against whitelist
        if (!resourceType.isMimeTypeAllowed(request.getContentType())) {
            throw new IllegalArgumentException(
                    String.format("Content type '%s' is not allowed for resource type %s. Allowed: %s",
                            request.getContentType(), resourceType, resourceType.getAllowedMimeTypes())
            );
        }

        // 3. File size limit validation
        if (request.getFileSizeBytes() > resourceType.getMaxSizeBytes()) {
            throw new IllegalArgumentException(
                    String.format("File size (%d bytes) exceeds maximum allowed size (%d bytes) for %s",
                            request.getFileSizeBytes(), resourceType.getMaxSizeBytes(), resourceType)
            );
        }

        // 4. Collision-free, non-tamperable object key generation
        String safeExtension = resolveSafeExtension(request.getOriginalFilename(), request.getContentType());
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String safeFileName = UUID.randomUUID() + safeExtension;
        String objectKey = String.format("%s/%s/%s/%s", resourceType.getFolder(), currentUser.getId(), datePath, safeFileName);

        String fileId = "file_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        UserEntity owner = userRepository.findById(currentUser.getId()).orElse(null);

        // 5. Persist PENDING file metadata
        FileMetadataEntity entity = FileMetadataEntity.builder()
                .id(fileId)
                .objectKey(objectKey)
                .bucketName(properties.getBucketName())
                .resourceType(resourceType)
                .originalFilename(sanitizeFilename(request.getOriginalFilename()))
                .contentType(request.getContentType())
                .fileSizeBytes(request.getFileSizeBytes())
                .owner(owner)
                .accessLevel(resourceType.getDefaultAccessLevel())
                .uploadStatus(UploadStatus.PENDING)
                .expiresAt(Instant.now().plusSeconds(properties.getUploadTtlSeconds()))
                .build();

        fileMetadataRepository.save(entity);

        // 6. Generate presigned PUT URL with short TTL
        String uploadUrl;
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(properties.getBucketName())
                    .key(objectKey)
                    .contentType(request.getContentType())
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(properties.getUploadTtlSeconds()))
                    .putObjectRequest(putObjectRequest)
                    .build();

            PresignedPutObjectRequest presignedPut = s3Presigner.presignPutObject(presignRequest);
            uploadUrl = presignedPut.url().toString();
        } catch (Exception ex) {
            log.error("Failed to generate S3 presigned PUT URL for key={}", objectKey, ex);
            uploadUrl = String.format("%s/%s/%s", properties.getEffectiveEndpoint(), properties.getBucketName(), objectKey);
        }

        return UploadSessionResponse.builder()
                .fileId(fileId)
                .uploadUrl(uploadUrl)
                .objectKey(objectKey)
                .expiresAt(entity.getExpiresAt())
                .maxFileSizeBytes(resourceType.getMaxSizeBytes())
                .contentType(request.getContentType())
                .build();
    }

    @Override
    @Transactional
    public FileMetadataDto completeUpload(String fileId, UserPrincipal currentUser) {
        FileMetadataEntity entity = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "File metadata not found: " + fileId));

        validateOwnershipOrAdmin(entity, currentUser);

        // Verify object existence in Cloudflare R2 if configured
        if (properties.isConfigured()) {
            try {
                HeadObjectResponse head = s3Client.headObject(HeadObjectRequest.builder()
                        .bucket(entity.getBucketName())
                        .key(entity.getObjectKey())
                        .build());
                if (head.contentLength() != null && head.contentLength() > 0) {
                    entity.setFileSizeBytes(head.contentLength());
                }
            } catch (NoSuchKeyException e) {
                entity.setUploadStatus(UploadStatus.FAILED);
                fileMetadataRepository.save(entity);
                throw new IllegalStateException("Uploaded object was not found in storage bucket");
            } catch (Exception ex) {
                log.warn("Could not verify object in R2 (skipping headObject in non-prod): {}", ex.getMessage());
            }
        }

        entity.setUploadStatus(UploadStatus.COMPLETED);
        FileMetadataEntity saved = fileMetadataRepository.save(entity);
        log.info("File upload marked COMPLETED: ID={}, Key={}", saved.getId(), saved.getObjectKey());

        return toDto(saved, null);
    }

    @Override
    @Transactional(readOnly = true)
    public String generateDownloadUrl(String fileId, UserPrincipal currentUser) {
        FileMetadataEntity entity = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "File metadata not found: " + fileId));

        if (entity.getAccessLevel() == AccessLevel.PRIVATE) {
            validateOwnershipOrAdmin(entity, currentUser);
        }

        // Return public CDN URL if public and configured
        if (entity.getAccessLevel() == AccessLevel.PUBLIC && StringUtils.hasText(properties.getPublicUrlPrefix())) {
            String prefix = properties.getPublicUrlPrefix().replaceAll("/+$", "");
            return prefix + "/" + entity.getObjectKey();
        }

        // Generate short-lived presigned GET URL
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(entity.getBucketName())
                    .key(entity.getObjectKey())
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(properties.getDownloadTtlSeconds()))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedGet = s3Presigner.presignGetObject(presignRequest);
            return presignedGet.url().toString();
        } catch (Exception ex) {
            log.error("Failed to generate presigned GET URL for key={}", entity.getObjectKey(), ex);
            return String.format("%s/%s/%s", properties.getEffectiveEndpoint(), entity.getBucketName(), entity.getObjectKey());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public FileMetadataDto getMetadata(String fileId, UserPrincipal currentUser) {
        FileMetadataEntity entity = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "File metadata not found: " + fileId));

        if (entity.getAccessLevel() == AccessLevel.PRIVATE) {
            validateOwnershipOrAdmin(entity, currentUser);
        }

        String downloadUrl = generateDownloadUrl(fileId, currentUser);
        return toDto(entity, downloadUrl);
    }

    @Override
    @Transactional
    public void deleteFile(String fileId, UserPrincipal currentUser) {
        FileMetadataEntity entity = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "File metadata not found: " + fileId));

        validateOwnershipOrAdmin(entity, currentUser);

        if (properties.isConfigured()) {
            try {
                s3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(entity.getBucketName())
                        .key(entity.getObjectKey())
                        .build());
            } catch (Exception ex) {
                log.warn("Failed to delete object from R2 bucket: {}", ex.getMessage());
            }
        }

        entity.setUploadStatus(UploadStatus.DELETED);
        fileMetadataRepository.save(entity);
        log.info("File marked DELETED: ID={}", fileId);
    }

    private void validateOwnershipOrAdmin(FileMetadataEntity entity, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Authentication required");
        }
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ROLE_SUPER_ADMIN".equals(a.getAuthority()));
        if (isAdmin) {
            return;
        }
        if (entity.getOwner() == null || !entity.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this resource");
        }
    }

    private String resolveSafeExtension(String originalFilename, String contentType) {
        if (StringUtils.hasText(originalFilename) && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
            if (ext.matches("^\\.[a-z0-9]{2,5}$")) {
                return ext;
            }
        }
        // Fallback by content type
        return switch (contentType != null ? contentType.toLowerCase() : "") {
            case "audio/webm" -> ".webm";
            case "audio/mp3", "audio/mpeg" -> ".mp3";
            case "audio/wav", "audio/x-wav" -> ".wav";
            case "audio/ogg" -> ".ogg";
            case "audio/m4a", "audio/x-m4a" -> ".m4a";
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/webp" -> ".webp";
            case "application/pdf" -> ".pdf";
            default -> ".bin";
        };
    }

    private String sanitizeFilename(String filename) {
        if (!StringUtils.hasText(filename)) return null;
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private FileMetadataDto toDto(FileMetadataEntity entity, String downloadUrl) {
        return FileMetadataDto.builder()
                .id(entity.getId())
                .objectKey(entity.getObjectKey())
                .bucketName(entity.getBucketName())
                .resourceType(entity.getResourceType())
                .originalFilename(entity.getOriginalFilename())
                .contentType(entity.getContentType())
                .fileSizeBytes(entity.getFileSizeBytes())
                .ownerId(entity.getOwner() != null ? entity.getOwner().getId() : null)
                .accessLevel(entity.getAccessLevel())
                .uploadStatus(entity.getUploadStatus())
                .downloadUrl(downloadUrl)
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
