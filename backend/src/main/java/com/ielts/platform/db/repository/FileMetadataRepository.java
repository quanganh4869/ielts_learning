package com.ielts.platform.db.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.FileMetadataEntity;
import com.ielts.platform.db.model.ResourceType;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadataEntity, String> {

    Optional<FileMetadataEntity> findByObjectKey(String objectKey);

    Page<FileMetadataEntity> findByOwnerId(String ownerId, Pageable pageable);

    Page<FileMetadataEntity> findByResourceType(ResourceType resourceType, Pageable pageable);
}
