package com.ielts.platform.admin.users.repository;

import com.ielts.platform.admin.users.model.LoginEventEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginEventRepository extends JpaRepository<LoginEventEntity, String> {
    Page<LoginEventEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT e FROM LoginEventEntity e WHERE " +
           "(:status IS NULL OR UPPER(e.status) = UPPER(:status)) AND " +
           "(:query IS NULL OR LOWER(e.userEmail) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.ipAddress) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY e.createdAt DESC")
    Page<LoginEventEntity> searchEvents(@Param("status") String status, @Param("query") String query, Pageable pageable);

    @Query("SELECT e FROM LoginEventEntity e WHERE e.createdAt >= :since")
    java.util.List<LoginEventEntity> findEventsSince(@Param("since") java.time.Instant since);
}
