package com.ielts.platform.services;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.ielts.platform.db.model.AuditLogEntity;
import com.ielts.platform.db.repository.AuditLogRepository;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void record(String userId, String userName, String action, String resource, String resourceId, String details, String ipAddress) {
        AuditLogEntity log = AuditLogEntity.builder()
                .id("log_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12))
                .userId(userId)
                .userName(userName != null ? userName : "System")
                .action(action)
                .resource(resource)
                .resourceId(resourceId)
                .details(details)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogEntity> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
