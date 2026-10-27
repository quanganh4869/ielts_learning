package com.ielts.platform.storage;

import com.ielts.platform.security.UserPrincipal;
import com.ielts.platform.storage.dto.FileMetadataDto;
import com.ielts.platform.storage.dto.UploadSessionRequest;
import com.ielts.platform.storage.dto.UploadSessionResponse;

public interface StorageService {

    UploadSessionResponse initiateUploadSession(UploadSessionRequest request, UserPrincipal currentUser);

    FileMetadataDto completeUpload(String fileId, UserPrincipal currentUser);

    String generateDownloadUrl(String fileId, UserPrincipal currentUser);

    FileMetadataDto getMetadata(String fileId, UserPrincipal currentUser);

    void deleteFile(String fileId, UserPrincipal currentUser);
}
