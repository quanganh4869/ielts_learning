package com.ielts.platform.db.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.MediaAssetEntity;

@Repository
public interface MediaAssetRepository extends JpaRepository<MediaAssetEntity, String> {
    Page<MediaAssetEntity> findAllByOrderBySortOrderAsc(Pageable pageable);
    List<MediaAssetEntity> findByFileType(String fileType);
}
