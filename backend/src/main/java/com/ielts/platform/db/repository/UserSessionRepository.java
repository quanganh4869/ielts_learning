package com.ielts.platform.db.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.UserSessionEntity;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSessionEntity, String> {
    List<UserSessionEntity> findByUserId(String userId);
    List<UserSessionEntity> findByUserIdAndIsActiveTrue(String userId);
    long countByIsActiveTrue();
    Page<UserSessionEntity> findAllByOrderByLastActiveDesc(Pageable pageable);
    Page<UserSessionEntity> findByIsActiveOrderByLastActiveDesc(boolean isActive, Pageable pageable);
}
