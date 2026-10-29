package com.ielts.platform.db.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.ModuleEntity;

@Repository
public interface ModuleRepository extends JpaRepository<ModuleEntity, String> {
    List<ModuleEntity> findAllByOrderBySortOrderAsc();
    Page<ModuleEntity> findBySkill(String skill, Pageable pageable);
}
