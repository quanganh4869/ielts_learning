package com.ielts.platform.admin.users.repository;

import com.ielts.platform.admin.users.model.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByStatus(UserEntity.UserStatus status);

    @Query("SELECT u FROM UserEntity u WHERE " +
           "(:query IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR u.status = :status)")
    Page<UserEntity> searchUsers(
            @Param("query") String query,
            @Param("status") UserEntity.UserStatus status,
            Pageable pageable
    );
}
