package com.ielts.platform.admin.audit.repository;

import com.ielts.platform.admin.audit.model.AuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, String> {
    Page<AuditLogEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<AuditLogEntity> findTop10ByOrderByCreatedAtDesc();
}
