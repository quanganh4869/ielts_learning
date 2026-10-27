package com.ielts.platform.admin.content.repository;

import com.ielts.platform.admin.content.model.GrammarRuleEntity;
import com.ielts.platform.admin.content.model.LessonEntity;
import com.ielts.platform.admin.content.model.MediaAssetEntity;
import com.ielts.platform.admin.content.model.ModuleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface ContentRepositories {

    @Repository
    interface ModuleRepository extends JpaRepository<ModuleEntity, String> {
        List<ModuleEntity> findAllByOrderBySortOrderAsc();
        Page<ModuleEntity> findBySkill(String skill, Pageable pageable);
    }

    @Repository
    interface LessonRepository extends JpaRepository<LessonEntity, String> {
        List<LessonEntity> findByModuleIdOrderBySortOrderAsc(String moduleId);
    }

    @Repository
    interface GrammarRuleRepository extends JpaRepository<GrammarRuleEntity, String> {
        Page<GrammarRuleEntity> findAllByOrderBySortOrderAsc(Pageable pageable);
        List<GrammarRuleEntity> findByLevel(String level);
    }

    @Repository
    interface MediaAssetRepository extends JpaRepository<MediaAssetEntity, String> {
        Page<MediaAssetEntity> findAllByOrderBySortOrderAsc(Pageable pageable);
        List<MediaAssetEntity> findByFileType(String fileType);
    }
}
