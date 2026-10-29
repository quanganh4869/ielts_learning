package com.ielts.platform.db.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.LearningPlanEntity;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlanEntity, String> {
    List<LearningPlanEntity> findAllByOrderByCreatedAtDesc();
}
