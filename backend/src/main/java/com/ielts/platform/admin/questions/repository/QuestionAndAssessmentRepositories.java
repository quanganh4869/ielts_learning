package com.ielts.platform.admin.questions.repository;

import com.ielts.platform.admin.questions.model.AssessmentAttemptEntity;
import com.ielts.platform.admin.questions.model.AssessmentEntity;
import com.ielts.platform.admin.questions.model.LearningPlanEntity;
import com.ielts.platform.admin.questions.model.QuestionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface QuestionAndAssessmentRepositories {

    @Repository
    interface QuestionRepository extends JpaRepository<QuestionEntity, String> {
        @Query("SELECT q FROM QuestionEntity q WHERE " +
               "(:query IS NULL OR LOWER(q.prompt) LIKE LOWER(CONCAT('%', :query, '%'))) " +
               "AND (:skill IS NULL OR q.skill = :skill) " +
               "AND (:type IS NULL OR q.type = :type)")
        Page<QuestionEntity> searchQuestions(
                @Param("query") String query,
                @Param("skill") String skill,
                @Param("type") String type,
                Pageable pageable
        );
    }

    @Repository
    interface AssessmentRepository extends JpaRepository<AssessmentEntity, String> {
        Page<AssessmentEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
    }

    @Repository
    interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttemptEntity, String> {
        long count();
        @Query("SELECT AVG(a.bandScore) FROM AssessmentAttemptEntity a WHERE a.bandScore IS NOT NULL")
        Double findAverageBandScore();
        List<AssessmentAttemptEntity> findTop10ByOrderByStartedAtDesc();
    }

    @Repository
    interface LearningPlanRepository extends JpaRepository<LearningPlanEntity, String> {
        List<LearningPlanEntity> findAllByOrderByCreatedAtDesc();
    }
}
