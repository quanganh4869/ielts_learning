package com.ielts.platform.admin.settings.repository;

import com.ielts.platform.admin.settings.model.SystemSettingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSettingEntity, String> {
    List<SystemSettingEntity> findByCategory(String category);
}
