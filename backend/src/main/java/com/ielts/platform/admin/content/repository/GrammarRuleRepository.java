package com.ielts.platform.admin.content.repository;

import com.ielts.platform.admin.content.model.GrammarRuleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarRuleRepository extends JpaRepository<GrammarRuleEntity, String> {
    Page<GrammarRuleEntity> findAllByOrderBySortOrderAsc(Pageable pageable);
    List<GrammarRuleEntity> findByLevel(String level);
}
