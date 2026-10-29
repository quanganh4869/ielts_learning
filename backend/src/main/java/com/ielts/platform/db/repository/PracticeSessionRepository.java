package com.ielts.platform.db.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.PracticeSessionEntity;

@Repository
public interface PracticeSessionRepository extends JpaRepository<PracticeSessionEntity, String> {

    Page<PracticeSessionEntity> findByUserIdOrderByStartedAtDesc(String userId, Pageable pageable);

    java.util.List<PracticeSessionEntity> findByUserIdOrderByStartedAtDesc(String userId);

    long countByUserIdAndStatus(String userId, String status);

    Optional<PracticeSessionEntity> findByIdAndUserId(String id, String userId);
}
