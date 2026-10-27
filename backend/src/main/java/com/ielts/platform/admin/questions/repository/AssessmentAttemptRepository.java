package com.ielts.platform.admin.questions.repository;

import com.ielts.platform.admin.questions.model.AssessmentAttemptEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttemptEntity, String> {
    long count();
    @Query("SELECT AVG(a.bandScore) FROM AssessmentAttemptEntity a WHERE a.bandScore IS NOT NULL")
    Double findAverageBandScore();
    List<AssessmentAttemptEntity> findTop10ByOrderByStartedAtDesc();
    Page<AssessmentAttemptEntity> findByUserIdOrderByStartedAtDesc(String userId, Pageable pageable);
    Optional<AssessmentAttemptEntity> findByIdAndUserId(String id, String userId);
}
