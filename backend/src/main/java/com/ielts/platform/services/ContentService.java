package com.ielts.platform.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.ielts.platform.core.common.BusinessException;
import com.ielts.platform.core.common.ErrorCode;
import com.ielts.platform.db.model.GrammarRuleEntity;
import com.ielts.platform.db.model.LessonEntity;
import com.ielts.platform.db.model.MediaAssetEntity;
import com.ielts.platform.db.model.ModuleEntity;
import com.ielts.platform.db.repository.GrammarRuleRepository;
import com.ielts.platform.db.repository.LessonRepository;
import com.ielts.platform.db.repository.MediaAssetRepository;
import com.ielts.platform.db.repository.ModuleRepository;
import com.ielts.platform.schemas.content.ContentDtos;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final GrammarRuleRepository grammarRuleRepository;
    private final MediaAssetRepository mediaAssetRepository;
    private final AuditLogService auditLogService;

    // --- Modules ---
    @Transactional(readOnly = true)
    public List<ContentDtos.ModuleDto> getAllModules() {
        return moduleRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::mapModuleToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContentDtos.ModuleDto createModule(ContentDtos.ModuleDto dto, String adminId, String adminName) {
        ModuleEntity entity = ModuleEntity.builder()
                .id("mod_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10))
                .title(dto.getTitle())
                .skill(dto.getSkill().toUpperCase())
                .level(dto.getLevel())
                .lessonsCount(0)
                .sortOrder(dto.getSortOrder())
                .status(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "DRAFT")
                .build();
        ModuleEntity saved = moduleRepository.save(entity);
        auditLogService.record(adminId, adminName, "CREATE_MODULE", "MODULE", saved.getId(), "Created module: " + saved.getTitle(), null);
        return mapModuleToDto(saved);
    }

    @Transactional
    public ContentDtos.ModuleDto updateModule(String id, ContentDtos.ModuleDto dto, String adminId, String adminName) {
        ModuleEntity entity = moduleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Module not found: " + id));
        entity.setTitle(dto.getTitle());
        entity.setSkill(dto.getSkill().toUpperCase());
        entity.setLevel(dto.getLevel());
        entity.setSortOrder(dto.getSortOrder());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus().toUpperCase());
        ModuleEntity saved = moduleRepository.save(entity);
        auditLogService.record(adminId, adminName, "UPDATE_MODULE", "MODULE", saved.getId(), "Updated module: " + saved.getTitle(), null);
        return mapModuleToDto(saved);
    }

    @Transactional
    public void deleteModule(String id, String adminId, String adminName) {
        ModuleEntity entity = moduleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Module not found: " + id));
        moduleRepository.delete(entity);
        auditLogService.record(adminId, adminName, "DELETE_MODULE", "MODULE", id, "Deleted module: " + entity.getTitle(), null);
    }

    // --- Lessons ---
    @Transactional(readOnly = true)
    public List<ContentDtos.LessonDto> getAllLessons() {
        return lessonRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::mapLessonToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContentDtos.LessonDto getLessonById(String id) {
        LessonEntity lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Lesson not found: " + id));
        return mapLessonToDto(lesson);
    }

    @Transactional(readOnly = true)
    public List<ContentDtos.LessonDto> getLessonsByModule(String moduleId) {
        return lessonRepository.findByModuleIdOrderBySortOrderAsc(moduleId).stream()
                .map(this::mapLessonToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContentDtos.LessonDto createLesson(ContentDtos.LessonDto dto, String adminId, String adminName) {
        ModuleEntity module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Module not found: " + dto.getModuleId()));

        LessonEntity entity = LessonEntity.builder()
                .id("les_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10))
                .module(module)
                .title(dto.getTitle())
                .durationMinutes(dto.getDurationMinutes() > 0 ? dto.getDurationMinutes() : 15)
                .type(dto.getType() != null ? dto.getType().toUpperCase() : "ARTICLE")
                .sortOrder(dto.getSortOrder())
                .status(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "DRAFT")
                .content(dto.getContent())
                .build();

        LessonEntity saved = lessonRepository.save(entity);
        module.setLessonsCount(module.getLessonsCount() + 1);
        moduleRepository.save(module);

        auditLogService.record(adminId, adminName, "CREATE_LESSON", "LESSON", saved.getId(), "Created lesson: " + saved.getTitle(), null);
        return mapLessonToDto(saved);
    }

    @Transactional
    public ContentDtos.LessonDto updateLesson(String id, ContentDtos.LessonDto dto, String adminId, String adminName) {
        LessonEntity entity = lessonRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Lesson not found: " + id));

        entity.setTitle(dto.getTitle());
        entity.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getType() != null) entity.setType(dto.getType().toUpperCase());
        entity.setSortOrder(dto.getSortOrder());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus().toUpperCase());
        if (dto.getContent() != null) entity.setContent(dto.getContent());

        LessonEntity saved = lessonRepository.save(entity);
        auditLogService.record(adminId, adminName, "UPDATE_LESSON", "LESSON", saved.getId(), "Updated lesson: " + saved.getTitle(), null);
        return mapLessonToDto(saved);
    }

    @Transactional
    public void deleteLesson(String id, String adminId, String adminName) {
        LessonEntity entity = lessonRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Lesson not found: " + id));

        ModuleEntity module = entity.getModule();
        lessonRepository.delete(entity);
        if (module != null && module.getLessonsCount() > 0) {
            module.setLessonsCount(module.getLessonsCount() - 1);
            moduleRepository.save(module);
        }

        auditLogService.record(adminId, adminName, "DELETE_LESSON", "LESSON", id, "Deleted lesson: " + entity.getTitle(), null);
    }

    // --- Grammar Rules ---
    @Transactional(readOnly = true)
    public Page<ContentDtos.GrammarRuleDto> getGrammarRules(Pageable pageable) {
        return grammarRuleRepository.findAllByOrderBySortOrderAsc(pageable).map(this::mapGrammarToDto);
    }

    @Transactional
    public ContentDtos.GrammarRuleDto createGrammarRule(ContentDtos.GrammarRuleDto dto, String adminId, String adminName) {
        GrammarRuleEntity entity = GrammarRuleEntity.builder()
                .id("gram_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10))
                .title(dto.getTitle())
                .level(dto.getLevel().toUpperCase())
                .category(dto.getCategory())
                .summary(dto.getSummary())
                .formula(dto.getFormula())
                .examples(dto.getExamples())
                .sortOrder(dto.getSortOrder())
                .status(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "PUBLISHED")
                .build();
        GrammarRuleEntity saved = grammarRuleRepository.save(entity);
        auditLogService.record(adminId, adminName, "CREATE_GRAMMAR", "GRAMMAR", saved.getId(), "Created grammar rule: " + saved.getTitle(), null);
        return mapGrammarToDto(saved);
    }

    @Transactional
    public ContentDtos.GrammarRuleDto updateGrammarRule(String id, ContentDtos.GrammarRuleDto dto, String adminId, String adminName) {
        GrammarRuleEntity entity = grammarRuleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Grammar rule not found: " + id));
        entity.setTitle(dto.getTitle());
        entity.setLevel(dto.getLevel().toUpperCase());
        entity.setCategory(dto.getCategory());
        entity.setSummary(dto.getSummary());
        entity.setFormula(dto.getFormula());
        entity.setExamples(dto.getExamples());
        entity.setSortOrder(dto.getSortOrder());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus().toUpperCase());
        GrammarRuleEntity saved = grammarRuleRepository.save(entity);
        auditLogService.record(adminId, adminName, "UPDATE_GRAMMAR", "GRAMMAR", saved.getId(), "Updated grammar rule: " + saved.getTitle(), null);
        return mapGrammarToDto(saved);
    }

    @Transactional
    public void deleteGrammarRule(String id, String adminId, String adminName) {
        GrammarRuleEntity entity = grammarRuleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Grammar rule not found: " + id));
        grammarRuleRepository.delete(entity);
        auditLogService.record(adminId, adminName, "DELETE_GRAMMAR", "GRAMMAR", id, "Deleted grammar rule: " + entity.getTitle(), null);
    }

    // --- Media Assets ---
    @Transactional(readOnly = true)
    public Page<ContentDtos.MediaAssetDto> getMediaAssets(Pageable pageable) {
        return mediaAssetRepository.findAllByOrderBySortOrderAsc(pageable).map(this::mapMediaToDto);
    }

    @Transactional
    public ContentDtos.MediaAssetDto createMediaAsset(ContentDtos.MediaAssetDto dto, String adminId, String adminName) {
        MediaAssetEntity entity = MediaAssetEntity.builder()
                .id("med_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10))
                .title(dto.getTitle())
                .fileType(dto.getFileType().toUpperCase())
                .fileSizeBytes(dto.getFileSizeBytes())
                .url(dto.getUrl())
                .durationSeconds(dto.getDurationSeconds())
                .skill(dto.getSkill() != null ? dto.getSkill().toUpperCase() : null)
                .sortOrder(dto.getSortOrder())
                .build();
        MediaAssetEntity saved = mediaAssetRepository.save(entity);
        auditLogService.record(adminId, adminName, "CREATE_MEDIA", "MEDIA", saved.getId(), "Uploaded media: " + saved.getTitle(), null);
        return mapMediaToDto(saved);
    }

    @Transactional
    public void deleteMediaAsset(String id, String adminId, String adminName) {
        MediaAssetEntity entity = mediaAssetRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Media asset not found: " + id));
        mediaAssetRepository.delete(entity);
        auditLogService.record(adminId, adminName, "DELETE_MEDIA", "MEDIA", id, "Deleted media: " + entity.getTitle(), null);
    }

    private ContentDtos.ModuleDto mapModuleToDto(ModuleEntity e) {
        return ContentDtos.ModuleDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .skill(e.getSkill())
                .level(e.getLevel())
                .lessonsCount(e.getLessonsCount())
                .sortOrder(e.getSortOrder())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private ContentDtos.LessonDto mapLessonToDto(LessonEntity e) {
        return ContentDtos.LessonDto.builder()
                .id(e.getId())
                .moduleId(e.getModule() != null ? e.getModule().getId() : null)
                .title(e.getTitle())
                .durationMinutes(e.getDurationMinutes())
                .type(e.getType())
                .sortOrder(e.getSortOrder())
                .status(e.getStatus())
                .content(e.getContent())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private ContentDtos.GrammarRuleDto mapGrammarToDto(GrammarRuleEntity e) {
        return ContentDtos.GrammarRuleDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .level(e.getLevel())
                .category(e.getCategory())
                .summary(e.getSummary())
                .formula(e.getFormula())
                .examples(e.getExamples())
                .sortOrder(e.getSortOrder())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private ContentDtos.MediaAssetDto mapMediaToDto(MediaAssetEntity e) {
        return ContentDtos.MediaAssetDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .fileType(e.getFileType())
                .fileSizeBytes(e.getFileSizeBytes())
                .url(e.getUrl())
                .durationSeconds(e.getDurationSeconds())
                .skill(e.getSkill())
                .sortOrder(e.getSortOrder())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
