package com.ielts.platform.admin.questions.repository;

import com.ielts.platform.admin.questions.model.AssessmentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentRepository extends JpaRepository<AssessmentEntity, String> {
    Page<AssessmentEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
    java.util.List<AssessmentEntity> findByStatusOrderByCreatedAtDesc(String status);
}
