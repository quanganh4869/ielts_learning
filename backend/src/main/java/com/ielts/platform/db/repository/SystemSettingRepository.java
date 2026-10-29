package com.ielts.platform.db.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.SystemSettingEntity;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSettingEntity, String> {
    List<SystemSettingEntity> findByCategory(String category);
}
