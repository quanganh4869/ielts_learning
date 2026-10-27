package com.ielts.platform.admin.questions.repository;

import com.ielts.platform.admin.questions.model.LearningPlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlanEntity, String> {
    List<LearningPlanEntity> findAllByOrderByCreatedAtDesc();
}
