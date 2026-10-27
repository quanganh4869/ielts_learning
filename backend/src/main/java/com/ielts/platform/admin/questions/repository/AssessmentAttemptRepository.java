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

    @Query("SELECT asm.skill, AVG(att.bandScore) " +
           "FROM AssessmentAttemptEntity att, AssessmentEntity asm " +
           "WHERE att.assessmentId = asm.id AND att.bandScore IS NOT NULL " +
           "GROUP BY asm.skill")
    List<Object[]> findAverageBandScoreBySkill();

    @Query("SELECT att FROM AssessmentAttemptEntity att WHERE att.startedAt >= :since")
    List<AssessmentAttemptEntity> findAttemptsSince(@org.springframework.data.repository.query.Param("since") java.time.Instant since);

    List<AssessmentAttemptEntity> findTop10ByOrderByStartedAtDesc();
    Page<AssessmentAttemptEntity> findByUserIdOrderByStartedAtDesc(String userId, Pageable pageable);
    Optional<AssessmentAttemptEntity> findByIdAndUserId(String id, String userId);
}
