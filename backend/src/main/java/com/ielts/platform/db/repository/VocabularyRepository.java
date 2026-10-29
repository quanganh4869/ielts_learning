package com.ielts.platform.db.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.VocabularyEntity;

@Repository
public interface VocabularyRepository extends JpaRepository<VocabularyEntity, String> {

    Optional<VocabularyEntity> findByWordIgnoreCase(String word);

    boolean existsByWordIgnoreCase(String word);

    @Query("SELECT v FROM VocabularyEntity v WHERE " +
           "(:query IS NULL OR LOWER(v.word) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(v.vietnameseMeaning) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:cefr IS NULL OR v.cefr = :cefr) " +
           "AND (:status IS NULL OR v.status = :status)")
    Page<VocabularyEntity> searchVocabulary(
            @Param("query") String query,
            @Param("cefr") String cefr,
            @Param("status") String status,
            Pageable pageable
    );
}
