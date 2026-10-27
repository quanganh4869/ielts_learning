package com.ielts.platform.storage;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadataEntity, String> {

    Optional<FileMetadataEntity> findByObjectKey(String objectKey);

    Page<FileMetadataEntity> findByOwnerId(String ownerId, Pageable pageable);

    Page<FileMetadataEntity> findByResourceType(ResourceType resourceType, Pageable pageable);
}
