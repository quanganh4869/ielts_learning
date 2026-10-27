package com.ielts.platform.admin.users.repository;

import com.ielts.platform.admin.users.model.LoginEventEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginEventRepository extends JpaRepository<LoginEventEntity, String> {
    Page<LoginEventEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
