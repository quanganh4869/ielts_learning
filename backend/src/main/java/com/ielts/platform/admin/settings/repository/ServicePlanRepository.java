package com.ielts.platform.admin.settings.repository;

import com.ielts.platform.admin.settings.model.ServicePlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServicePlanRepository extends JpaRepository<ServicePlanEntity, String> {
    List<ServicePlanEntity> findAllByOrderByMonthlyPriceAsc();
}
