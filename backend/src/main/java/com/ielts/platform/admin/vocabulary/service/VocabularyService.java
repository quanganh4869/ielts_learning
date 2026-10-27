package com.ielts.platform.admin.vocabulary.service;

import com.ielts.platform.admin.audit.service.AuditLogService;
import com.ielts.platform.admin.vocabulary.dto.VocabularyDtos;
import com.ielts.platform.admin.vocabulary.model.VocabularyEntity;
import com.ielts.platform.admin.vocabulary.repository.VocabularyRepository;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VocabularyService {

    private final VocabularyRepository vocabularyRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<VocabularyDtos.Response> search(String query, String cefr, String status, Pageable pageable) {
        return vocabularyRepository.searchVocabulary(query, cefr, status, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public VocabularyDtos.Response getById(String id) {
        VocabularyEntity entity = vocabularyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Vocabulary not found with id: " + id));
        return mapToDto(entity);
    }

    @Transactional
    public VocabularyDtos.Response create(VocabularyDtos.UpsertRequest request, String adminId, String adminName) {
        if (vocabularyRepository.existsByWordIgnoreCase(request.getWord())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Word already exists: " + request.getWord());
        }

        VocabularyEntity entity = VocabularyEntity.builder()
                .id("voc_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10))
                .word(request.getWord().trim().toLowerCase())
                .partOfSpeech(request.getPartOfSpeech())
                .cefr(request.getCefr().toUpperCase())
                .bandScore(request.getBandScore())
                .definition(request.getDefinition())
                .example(request.getExample())
                .vietnameseMeaning(request.getVietnameseMeaning())
                .pronunciation(request.getPronunciation())
                .audioUrl(request.getAudioUrl())
                .tags(request.getTags())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "PUBLISHED")
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        VocabularyEntity saved = vocabularyRepository.save(entity);

        auditLogService.record(adminId, adminName, "CREATE_VOCABULARY", "VOCABULARY", saved.getId(),
                "Created vocabulary word: " + saved.getWord(), null);

        return mapToDto(saved);
    }

    @Transactional
    public VocabularyDtos.Response update(String id, VocabularyDtos.UpsertRequest request, String adminId, String adminName) {
        VocabularyEntity entity = vocabularyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Vocabulary not found with id: " + id));

        // If changing word name, verify duplicate
        if (!entity.getWord().equalsIgnoreCase(request.getWord()) && vocabularyRepository.existsByWordIgnoreCase(request.getWord())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Word already exists: " + request.getWord());
        }

        entity.setWord(request.getWord().trim().toLowerCase());
        entity.setPartOfSpeech(request.getPartOfSpeech());
        entity.setCefr(request.getCefr().toUpperCase());
        entity.setBandScore(request.getBandScore());
        entity.setDefinition(request.getDefinition());
        entity.setExample(request.getExample());
        entity.setVietnameseMeaning(request.getVietnameseMeaning());
        entity.setPronunciation(request.getPronunciation());
        entity.setAudioUrl(request.getAudioUrl());
        entity.setTags(request.getTags());
        if (request.getStatus() != null) entity.setStatus(request.getStatus().toUpperCase());
        if (request.getSortOrder() != null) entity.setSortOrder(request.getSortOrder());

        VocabularyEntity updated = vocabularyRepository.save(entity);

        auditLogService.record(adminId, adminName, "UPDATE_VOCABULARY", "VOCABULARY", updated.getId(),
                "Updated vocabulary word: " + updated.getWord(), null);

        return mapToDto(updated);
    }

    @Transactional
    public void delete(String id, String adminId, String adminName) {
        VocabularyEntity entity = vocabularyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Vocabulary not found with id: " + id));

        vocabularyRepository.delete(entity);

        auditLogService.record(adminId, adminName, "DELETE_VOCABULARY", "VOCABULARY", id,
                "Deleted vocabulary word: " + entity.getWord(), null);
    }

    public VocabularyDtos.Response mapToDto(VocabularyEntity entity) {
        return VocabularyDtos.Response.builder()
                .id(entity.getId())
                .word(entity.getWord())
                .partOfSpeech(entity.getPartOfSpeech())
                .cefr(entity.getCefr())
                .bandScore(entity.getBandScore())
                .definition(entity.getDefinition())
                .example(entity.getExample())
                .vietnameseMeaning(entity.getVietnameseMeaning())
                .pronunciation(entity.getPronunciation())
                .audioUrl(entity.getAudioUrl())
                .tags(entity.getTags())
                .status(entity.getStatus())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
