package com.ielts.platform.db.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.ServicePlanEntity;

@Repository
public interface ServicePlanRepository extends JpaRepository<ServicePlanEntity, String> {
    List<ServicePlanEntity> findAllByOrderByMonthlyPriceAsc();
}
