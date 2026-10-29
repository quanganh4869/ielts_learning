package com.ielts.platform.db.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.GrammarRuleEntity;

@Repository
public interface GrammarRuleRepository extends JpaRepository<GrammarRuleEntity, String> {
    Page<GrammarRuleEntity> findAllByOrderBySortOrderAsc(Pageable pageable);
    List<GrammarRuleEntity> findByLevel(String level);
}
