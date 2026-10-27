package com.ielts.platform.admin.content.repository;

import com.ielts.platform.admin.content.model.MediaAssetEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaAssetRepository extends JpaRepository<MediaAssetEntity, String> {
    Page<MediaAssetEntity> findAllByOrderBySortOrderAsc(Pageable pageable);
    List<MediaAssetEntity> findByFileType(String fileType);
}
