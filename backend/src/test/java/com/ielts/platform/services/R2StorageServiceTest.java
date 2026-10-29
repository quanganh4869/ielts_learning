package com.ielts.platform.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import java.net.URL;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import com.ielts.platform.config.properties.R2StorageProperties;
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

@ExtendWith(MockitoExtension.class)
class R2StorageServiceTest {

    @Mock
    private FileMetadataRepository fileMetadataRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private S3Client s3Client;

    @Mock
    private S3Presigner s3Presigner;

    private R2StorageProperties properties;
    private R2StorageService storageService;

    private UserPrincipal studentUser;
    private UserPrincipal otherStudentUser;
    private UserPrincipal adminUser;

    @BeforeEach
    void setUp() throws Exception {
        properties = new R2StorageProperties();
        properties.setBucketName("test-bucket");
        properties.setAccountId("test-account");
        properties.setAccessKeyId("test-key");
        properties.setSecretAccessKey("test-secret");
        properties.setUploadTtlSeconds(600);
        properties.setDownloadTtlSeconds(900);

        storageService = new R2StorageService(
                properties,
                fileMetadataRepository,
                userRepository,
                s3Client,
                s3Presigner
        );

        studentUser = UserPrincipal.builder()
                .id("u_student_1")
                .email("student1@example.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
                .build();

        otherStudentUser = UserPrincipal.builder()
                .id("u_student_2")
                .email("student2@example.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
                .build();

        adminUser = UserPrincipal.builder()
                .id("u_admin_1")
                .email("admin@example.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();

        PresignedPutObjectRequest mockPresignedPut = mock(PresignedPutObjectRequest.class);
        lenient().when(mockPresignedPut.url()).thenReturn(new URL("https://test-account.r2.cloudflarestorage.com/test-bucket/upload"));
        lenient().when(s3Presigner.presignPutObject(any(software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest.class)))
                .thenReturn(mockPresignedPut);

        PresignedGetObjectRequest mockPresignedGet = mock(PresignedGetObjectRequest.class);
        lenient().when(mockPresignedGet.url()).thenReturn(new URL("https://test-account.r2.cloudflarestorage.com/test-bucket/download"));
        lenient().when(s3Presigner.presignGetObject(any(software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest.class)))
                .thenReturn(mockPresignedGet);
    }

    @Test
    @DisplayName("1. Student can request presigned upload URL for Speaking audio recording")
    void studentCanUploadSpeakingAudio() {
        UploadSessionRequest request = UploadSessionRequest.builder()
                .resourceType(ResourceType.SPEAKING_AUDIO)
                .contentType("audio/webm")
                .fileSizeBytes(1_048_576L) // 1 MB
                .originalFilename("part2_answer.webm")
                .build();

        when(userRepository.findById("u_student_1")).thenReturn(Optional.of(UserEntity.builder().id("u_student_1").build()));
        when(fileMetadataRepository.save(any(FileMetadataEntity.class))).thenAnswer(i -> i.getArgument(0));

        UploadSessionResponse response = storageService.initiateUploadSession(request, studentUser);

        assertThat(response).isNotNull();
        assertThat(response.getFileId()).startsWith("file_");
        assertThat(response.getObjectKey()).startsWith("speaking/u_student_1/");
        assertThat(response.getObjectKey()).endsWith(".webm");
        assertThat(response.getUploadUrl()).contains("r2.cloudflarestorage.com");
    }

    @Test
    @DisplayName("2. Non-admin student cannot upload listening audio course material")
    void nonAdminCannotUploadListeningCourseMaterial() {
        UploadSessionRequest request = UploadSessionRequest.builder()
                .resourceType(ResourceType.LISTENING_AUDIO)
                .contentType("audio/mp3")
                .fileSizeBytes(10_000_000L)
                .originalFilename("section1.mp3")
                .build();

        assertThatThrownBy(() -> storageService.initiateUploadSession(request, studentUser))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Administrative privileges required");
    }

    @Test
    @DisplayName("3. Admin user can upload listening course material")
    void adminCanUploadListeningCourseMaterial() {
        UploadSessionRequest request = UploadSessionRequest.builder()
                .resourceType(ResourceType.LISTENING_AUDIO)
                .contentType("audio/mp3")
                .fileSizeBytes(10_000_000L)
                .originalFilename("section1.mp3")
                .build();

        when(userRepository.findById("u_admin_1")).thenReturn(Optional.of(UserEntity.builder().id("u_admin_1").build()));
        when(fileMetadataRepository.save(any(FileMetadataEntity.class))).thenAnswer(i -> i.getArgument(0));

        UploadSessionResponse response = storageService.initiateUploadSession(request, adminUser);

        assertThat(response).isNotNull();
        assertThat(response.getObjectKey()).startsWith("listening/u_admin_1/");
    }

    @Test
    @DisplayName("4. Request with disallowed MIME type is rejected")
    void disallowedMimeTypeIsRejected() {
        UploadSessionRequest request = UploadSessionRequest.builder()
                .resourceType(ResourceType.SPEAKING_AUDIO)
                .contentType("application/x-executable")
                .fileSizeBytes(500_000L)
                .originalFilename("malicious.exe")
                .build();

        assertThatThrownBy(() -> storageService.initiateUploadSession(request, studentUser))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Content type 'application/x-executable' is not allowed");
    }

    @Test
    @DisplayName("5. File exceeding size limit is rejected")
    void oversizedFileIsRejected() {
        UploadSessionRequest request = UploadSessionRequest.builder()
                .resourceType(ResourceType.SPEAKING_AUDIO)
                .contentType("audio/webm")
                .fileSizeBytes(30_000_000L) // 30 MB > 25 MB limit
                .originalFilename("huge_recording.webm")
                .build();

        assertThatThrownBy(() -> storageService.initiateUploadSession(request, studentUser))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("exceeds maximum allowed size");
    }

    @Test
    @DisplayName("6. Private file can only be accessed by owner or admin; blocked for other students")
    void privateFileAccessControl() {
        UserEntity ownerEntity = UserEntity.builder().id("u_student_1").build();
        FileMetadataEntity privateFile = FileMetadataEntity.builder()
                .id("file_speaking_001")
                .objectKey("speaking/u_student_1/2026/10/recording.webm")
                .bucketName("test-bucket")
                .resourceType(ResourceType.SPEAKING_AUDIO)
                .contentType("audio/webm")
                .fileSizeBytes(1_000_000L)
                .owner(ownerEntity)
                .accessLevel(AccessLevel.PRIVATE)
                .uploadStatus(UploadStatus.COMPLETED)
                .build();

        when(fileMetadataRepository.findById("file_speaking_001")).thenReturn(Optional.of(privateFile));

        // Owner can access
        String ownerUrl = storageService.generateDownloadUrl("file_speaking_001", studentUser);
        assertThat(ownerUrl).isNotEmpty();

        // Admin can access
        String adminUrl = storageService.generateDownloadUrl("file_speaking_001", adminUser);
        assertThat(adminUrl).isNotEmpty();

        // Other student is forbidden (403)
        assertThatThrownBy(() -> storageService.generateDownloadUrl("file_speaking_001", otherStudentUser))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You do not own this resource");
    }

    @Test
    @DisplayName("7. Complete upload marks file status as COMPLETED")
    void completeUploadUpdatesStatus() {
        UserEntity ownerEntity = UserEntity.builder().id("u_student_1").build();
        FileMetadataEntity pendingFile = FileMetadataEntity.builder()
                .id("file_pending_001")
                .objectKey("speaking/u_student_1/2026/10/rec.webm")
                .bucketName("test-bucket")
                .resourceType(ResourceType.SPEAKING_AUDIO)
                .contentType("audio/webm")
                .fileSizeBytes(1_000_000L)
                .owner(ownerEntity)
                .accessLevel(AccessLevel.PRIVATE)
                .uploadStatus(UploadStatus.PENDING)
                .build();

        when(fileMetadataRepository.findById("file_pending_001")).thenReturn(Optional.of(pendingFile));
        when(fileMetadataRepository.save(any(FileMetadataEntity.class))).thenAnswer(i -> i.getArgument(0));

        FileMetadataDto result = storageService.completeUpload("file_pending_001", studentUser);

        assertThat(result.getUploadStatus()).isEqualTo(UploadStatus.COMPLETED);
    }
}
