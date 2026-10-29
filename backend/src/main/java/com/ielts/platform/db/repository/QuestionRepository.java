package com.ielts.platform.db.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.QuestionEntity;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionEntity, String> {
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
