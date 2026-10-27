package com.ielts.platform.admin.dashboard.repository;

import com.ielts.platform.admin.dashboard.model.AiTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiTaskRepository extends JpaRepository<AiTaskEntity, String> {
    long countByStatus(String status);
    List<AiTaskEntity> findTop10ByOrderByCreatedAtDesc();
    org.springframework.data.domain.Page<AiTaskEntity> findAllByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<AiTaskEntity> findByStatusOrderByCreatedAtDesc(String status, org.springframework.data.domain.Pageable pageable);
}
