package com.ielts.platform.services;

import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.ielts.platform.core.common.BusinessException;
import com.ielts.platform.core.common.ErrorCode;
import com.ielts.platform.db.model.SystemSettingEntity;
import com.ielts.platform.db.repository.SystemSettingRepository;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository repository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<SystemSettingEntity> getAllSettings() {
        return repository.findAll();
    }

    @Transactional
    public SystemSettingEntity updateSetting(String key, String value, String adminId, String adminName) {
        SystemSettingEntity setting = repository.findById(key)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Setting not found: " + key));

        setting.setValue(value);
        setting.setUpdatedBy(adminId);
        setting.setUpdatedAt(Instant.now());

        SystemSettingEntity saved = repository.save(setting);
        auditLogService.record(adminId, adminName, "UPDATE_SETTING", "SYSTEM_SETTING", key, "Updated setting value to: " + value, null);
        return saved;
    }
}
