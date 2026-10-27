package com.ielts.platform.admin.content.repository;

import com.ielts.platform.admin.content.model.ModuleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<ModuleEntity, String> {
    List<ModuleEntity> findAllByOrderBySortOrderAsc();
    Page<ModuleEntity> findBySkill(String skill, Pageable pageable);
}
