package com.ielts.platform.db.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.UserVocabularyEntity;

@Repository
public interface UserVocabularyRepository extends JpaRepository<UserVocabularyEntity, String> {

    Page<UserVocabularyEntity> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    Optional<UserVocabularyEntity> findByIdAndUserId(String id, String userId);

    boolean existsByUserIdAndWordIgnoreCase(String userId, String word);

    long countByUserId(String userId);

    void deleteByIdAndUserId(String id, String userId);
}
