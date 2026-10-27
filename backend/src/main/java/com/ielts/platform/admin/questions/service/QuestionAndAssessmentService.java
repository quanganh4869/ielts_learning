package com.ielts.platform.admin.questions.service;

import com.ielts.platform.admin.audit.service.AuditLogService;
import com.ielts.platform.admin.questions.dto.QuestionAndAssessmentDtos;
import com.ielts.platform.admin.questions.model.AssessmentEntity;
import com.ielts.platform.admin.questions.model.LearningPlanEntity;
import com.ielts.platform.admin.questions.model.QuestionEntity;
import com.ielts.platform.admin.questions.repository.QuestionAndAssessmentRepositories;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionAndAssessmentService {

    private final QuestionAndAssessmentRepositories.QuestionRepository questionRepository;
    private final QuestionAndAssessmentRepositories.AssessmentRepository assessmentRepository;
    private final QuestionAndAssessmentRepositories.LearningPlanRepository learningPlanRepository;
    private final AuditLogService auditLogService;

    // --- Questions ---
    @Transactional(readOnly = true)
    public Page<QuestionAndAssessmentDtos.QuestionDto> searchQuestions(String q, String skill, String type, Pageable pageable) {
        return questionRepository.searchQuestions(q, skill, type, pageable).map(this::mapQuestionToDto);
    }

    @Transactional
    public QuestionAndAssessmentDtos.QuestionDto createQuestion(QuestionAndAssessmentDtos.QuestionDto dto, String adminId, String adminName) {
        QuestionEntity entity = QuestionEntity.builder()
                .id("q_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10))
                .skill(dto.getSkill().toUpperCase())
                .type(dto.getType().toUpperCase())
                .difficulty(dto.getDifficulty() != null ? dto.getDifficulty().toUpperCase() : "MEDIUM")
                .passageText(dto.getPassageText())
                .audioAssetId(dto.getAudioAssetId())
                .prompt(dto.getPrompt())
                .optionsJson(dto.getOptionsJson())
                .correctAnswer(dto.getCorrectAnswer())
                .explanation(dto.getExplanation())
                .sortOrder(dto.getSortOrder())
                .status(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "ACTIVE")
                .build();

        QuestionEntity saved = questionRepository.save(entity);
        auditLogService.record(adminId, adminName, "CREATE_QUESTION", "QUESTION", saved.getId(), "Added question for skill " + saved.getSkill(), null);
        return mapQuestionToDto(saved);
    }

    @Transactional
    public QuestionAndAssessmentDtos.QuestionDto updateQuestion(String id, QuestionAndAssessmentDtos.QuestionDto dto, String adminId, String adminName) {
        QuestionEntity entity = questionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Question not found: " + id));

        entity.setSkill(dto.getSkill().toUpperCase());
        entity.setType(dto.getType().toUpperCase());
        if (dto.getDifficulty() != null) entity.setDifficulty(dto.getDifficulty().toUpperCase());
        entity.setPassageText(dto.getPassageText());
        entity.setAudioAssetId(dto.getAudioAssetId());
        entity.setPrompt(dto.getPrompt());
        entity.setOptionsJson(dto.getOptionsJson());
        entity.setCorrectAnswer(dto.getCorrectAnswer());
        entity.setExplanation(dto.getExplanation());
        entity.setSortOrder(dto.getSortOrder());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus().toUpperCase());

        QuestionEntity saved = questionRepository.save(entity);
        auditLogService.record(adminId, adminName, "UPDATE_QUESTION", "QUESTION", saved.getId(), "Updated question: " + saved.getId(), null);
        return mapQuestionToDto(saved);
    }

    @Transactional
    public void deleteQuestion(String id, String adminId, String adminName) {
        QuestionEntity entity = questionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Question not found: " + id));
        questionRepository.delete(entity);
        auditLogService.record(adminId, adminName, "DELETE_QUESTION", "QUESTION", id, "Deleted question: " + id, null);
    }

    // --- Assessments ---
    @Transactional(readOnly = true)
    public Page<QuestionAndAssessmentDtos.AssessmentDto> getAssessments(Pageable pageable) {
        return assessmentRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapAssessmentToDto);
    }

    @Transactional
    public QuestionAndAssessmentDtos.AssessmentDto createAssessment(QuestionAndAssessmentDtos.AssessmentDto dto, String adminId, String adminName) {
        AssessmentEntity entity = AssessmentEntity.builder()
                .id("ass_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10))
                .title(dto.getTitle())
                .skill(dto.getSkill().toUpperCase())
                .type(dto.getType() != null ? dto.getType().toUpperCase() : "MOCK_FULL")
                .timeLimitMinutes(dto.getTimeLimitMinutes() > 0 ? dto.getTimeLimitMinutes() : 60)
                .totalQuestions(dto.getTotalQuestions() > 0 ? dto.getTotalQuestions() : 40)
                .passingScore(dto.getPassingScore())
                .status(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "DRAFT")
                .build();

        AssessmentEntity saved = assessmentRepository.save(entity);
        auditLogService.record(adminId, adminName, "CREATE_ASSESSMENT", "ASSESSMENT", saved.getId(), "Created mock test: " + saved.getTitle(), null);
        return mapAssessmentToDto(saved);
    }

    // --- Learning Plans ---
    @Transactional(readOnly = true)
    public List<QuestionAndAssessmentDtos.LearningPlanDto> getLearningPlans() {
        return learningPlanRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapLearningPlanToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuestionAndAssessmentDtos.LearningPlanDto createLearningPlan(QuestionAndAssessmentDtos.LearningPlanDto dto, String adminId, String adminName) {
        LearningPlanEntity entity = LearningPlanEntity.builder()
                .id("plan_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10))
                .title(dto.getTitle())
                .targetBand(dto.getTargetBand() != null ? dto.getTargetBand() : BigDecimal.valueOf(7.0))
                .targetScoreLabel(dto.getTargetScoreLabel() != null ? dto.getTargetScoreLabel() : "Band " + dto.getTargetBand())
                .level(dto.getLevel() != null ? dto.getLevel() : "Intermediate")
                .durationWeeks(dto.getDurationWeeks() > 0 ? dto.getDurationWeeks() : 8)
                .enrolledCount(0)
                .status(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "PUBLISHED")
                .description(dto.getDescription())
                .build();

        LearningPlanEntity saved = learningPlanRepository.save(entity);
        auditLogService.record(adminId, adminName, "CREATE_LEARNING_PLAN", "LEARNING_PLAN", saved.getId(), "Created plan: " + saved.getTitle(), null);
        return mapLearningPlanToDto(saved);
    }

    private QuestionAndAssessmentDtos.QuestionDto mapQuestionToDto(QuestionEntity e) {
        return QuestionAndAssessmentDtos.QuestionDto.builder()
                .id(e.getId())
                .skill(e.getSkill())
                .type(e.getType())
                .difficulty(e.getDifficulty())
                .passageText(e.getPassageText())
                .audioAssetId(e.getAudioAssetId())
                .prompt(e.getPrompt())
                .optionsJson(e.getOptionsJson())
                .correctAnswer(e.getCorrectAnswer())
                .explanation(e.getExplanation())
                .sortOrder(e.getSortOrder())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private QuestionAndAssessmentDtos.AssessmentDto mapAssessmentToDto(AssessmentEntity e) {
        return QuestionAndAssessmentDtos.AssessmentDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .skill(e.getSkill())
                .type(e.getType())
                .timeLimitMinutes(e.getTimeLimitMinutes())
                .totalQuestions(e.getTotalQuestions())
                .passingScore(e.getPassingScore())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private QuestionAndAssessmentDtos.LearningPlanDto mapLearningPlanToDto(LearningPlanEntity e) {
        return QuestionAndAssessmentDtos.LearningPlanDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .targetBand(e.getTargetBand())
                .targetScoreLabel(e.getTargetScoreLabel())
                .level(e.getLevel())
                .durationWeeks(e.getDurationWeeks())
                .enrolledCount(e.getEnrolledCount())
                .status(e.getStatus())
                .description(e.getDescription())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
