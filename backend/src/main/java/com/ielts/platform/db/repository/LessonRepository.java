package com.ielts.platform.db.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.LessonEntity;

@Repository
public interface LessonRepository extends JpaRepository<LessonEntity, String> {
    List<LessonEntity> findByModuleIdOrderBySortOrderAsc(String moduleId);
    List<LessonEntity> findAllByOrderBySortOrderAsc();
}
