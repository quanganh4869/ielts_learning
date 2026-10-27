package com.ielts.platform.admin.settings.service;

import com.ielts.platform.admin.audit.service.AuditLogService;
import com.ielts.platform.admin.settings.model.SystemSettingEntity;
import com.ielts.platform.admin.settings.repository.SystemSettingRepository;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

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
