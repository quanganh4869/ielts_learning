package com.ielts.platform.study.repository;

import com.ielts.platform.study.model.PracticeSessionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PracticeSessionRepository extends JpaRepository<PracticeSessionEntity, String> {

    Page<PracticeSessionEntity> findByUserIdOrderByStartedAtDesc(String userId, Pageable pageable);

    Optional<PracticeSessionEntity> findByIdAndUserId(String id, String userId);
}
