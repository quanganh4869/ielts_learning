package com.ielts.platform.admin.users.repository;

import com.ielts.platform.admin.users.model.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, String> {
    Optional<RoleEntity> findByName(String name);
    Optional<RoleEntity> findByNameIgnoreCase(String name);
}
