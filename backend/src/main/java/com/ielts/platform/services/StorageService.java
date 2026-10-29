package com.ielts.platform.services;

import com.ielts.platform.core.security.UserPrincipal;
import com.ielts.platform.schemas.storage.FileMetadataDto;
import com.ielts.platform.schemas.storage.UploadSessionRequest;
import com.ielts.platform.schemas.storage.UploadSessionResponse;

public interface StorageService {

    UploadSessionResponse initiateUploadSession(UploadSessionRequest request, UserPrincipal currentUser);

    FileMetadataDto completeUpload(String fileId, UserPrincipal currentUser);

    String generateDownloadUrl(String fileId, UserPrincipal currentUser);

    FileMetadataDto getMetadata(String fileId, UserPrincipal currentUser);

    void deleteFile(String fileId, UserPrincipal currentUser);
}
