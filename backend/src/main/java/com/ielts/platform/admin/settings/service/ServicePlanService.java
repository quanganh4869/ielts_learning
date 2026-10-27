package com.ielts.platform.admin.settings.service;

import com.ielts.platform.admin.audit.service.AuditLogService;
import com.ielts.platform.admin.settings.dto.ServicePlanDtos;
import com.ielts.platform.admin.settings.model.ServicePlanEntity;
import com.ielts.platform.admin.settings.repository.ServicePlanRepository;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServicePlanService {

    private final ServicePlanRepository repository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<ServicePlanDtos.Response> getAllPlans() {
        return repository.findAllByOrderByMonthlyPriceAsc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServicePlanDtos.Response getPlanById(String id) {
        ServicePlanEntity entity = repository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Service plan not found: " + id));
        return mapToDto(entity);
    }

    @Transactional
    public ServicePlanDtos.Response createPlan(ServicePlanDtos.UpsertRequest request, String adminId, String adminName) {
        ServicePlanEntity plan = ServicePlanEntity.builder()
                .id("sp_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10))
                .name(request.getName())
                .monthlyPrice(request.getMonthlyPrice() != null ? request.getMonthlyPrice() : BigDecimal.ZERO)
                .yearlyPrice(request.getYearlyPrice() != null ? request.getYearlyPrice() : BigDecimal.ZERO)
                .featuresJson(request.getFeaturesJson())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        ServicePlanEntity saved = repository.save(plan);
        auditLogService.record(adminId, adminName, "CREATE_SERVICE_PLAN", "SERVICE_PLAN", saved.getId(), "Created tier: " + saved.getName(), null);
        return mapToDto(saved);
    }

    @Transactional
    public ServicePlanDtos.Response updatePlan(String id, ServicePlanDtos.UpsertRequest request, String adminId, String adminName) {
        ServicePlanEntity plan = repository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Service plan not found: " + id));

        if (request.getName() != null) plan.setName(request.getName());
        if (request.getMonthlyPrice() != null) plan.setMonthlyPrice(request.getMonthlyPrice());
        if (request.getYearlyPrice() != null) plan.setYearlyPrice(request.getYearlyPrice());
        if (request.getFeaturesJson() != null) plan.setFeaturesJson(request.getFeaturesJson());
        if (request.getIsActive() != null) plan.setActive(request.getIsActive());

        ServicePlanEntity saved = repository.save(plan);
        auditLogService.record(adminId, adminName, "UPDATE_SERVICE_PLAN", "SERVICE_PLAN", saved.getId(), "Updated tier: " + saved.getName(), null);
        return mapToDto(saved);
    }

    @Transactional
    public void deletePlan(String id, String adminId, String adminName) {
        ServicePlanEntity plan = repository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Service plan not found: " + id));
        repository.delete(plan);
        auditLogService.record(adminId, adminName, "DELETE_SERVICE_PLAN", "SERVICE_PLAN", id, "Deleted tier: " + plan.getName(), null);
    }

    private ServicePlanDtos.Response mapToDto(ServicePlanEntity p) {
        return ServicePlanDtos.Response.builder()
                .id(p.getId())
                .name(p.getName())
                .monthlyPrice(p.getMonthlyPrice())
                .yearlyPrice(p.getYearlyPrice())
                .featuresJson(p.getFeaturesJson())
                .isActive(p.isActive())
                .activeSubscribers(0)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
