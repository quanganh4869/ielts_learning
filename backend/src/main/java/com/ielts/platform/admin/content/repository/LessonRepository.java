package com.ielts.platform.admin.content.repository;

import com.ielts.platform.admin.content.model.LessonEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<LessonEntity, String> {
    List<LessonEntity> findByModuleIdOrderBySortOrderAsc(String moduleId);
}
