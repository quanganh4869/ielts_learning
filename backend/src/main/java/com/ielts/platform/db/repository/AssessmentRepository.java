package com.ielts.platform.db.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.AssessmentEntity;

@Repository
public interface AssessmentRepository extends JpaRepository<AssessmentEntity, String> {
    Page<AssessmentEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
    java.util.List<AssessmentEntity> findByStatusOrderByCreatedAtDesc(String status);
}
