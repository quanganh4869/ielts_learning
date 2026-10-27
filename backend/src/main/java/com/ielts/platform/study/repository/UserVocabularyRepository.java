package com.ielts.platform.study.repository;

import com.ielts.platform.study.model.UserVocabularyEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserVocabularyRepository extends JpaRepository<UserVocabularyEntity, String> {

    Page<UserVocabularyEntity> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    Optional<UserVocabularyEntity> findByIdAndUserId(String id, String userId);

    boolean existsByUserIdAndWordIgnoreCase(String userId, String word);

    void deleteByIdAndUserId(String id, String userId);
}
