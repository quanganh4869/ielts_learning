package com.ielts.platform.admin.users.repository;

import com.ielts.platform.admin.users.model.UserSessionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSessionEntity, String> {
    List<UserSessionEntity> findByUserId(String userId);
    long countByIsActiveTrue();
    Page<UserSessionEntity> findAllByOrderByLastActiveDesc(Pageable pageable);
}
