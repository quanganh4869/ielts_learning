package com.ielts.platform.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import com.ielts.platform.core.common.BusinessException;
import com.ielts.platform.core.common.ErrorCode;
import com.ielts.platform.db.model.VocabularyEntity;
import com.ielts.platform.db.repository.VocabularyRepository;
import com.ielts.platform.schemas.content.VocabularyDtos;

@ExtendWith(MockitoExtension.class)
class VocabularyServiceTest {

    @Mock
    private VocabularyRepository vocabularyRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private VocabularyService vocabularyService;

    private VocabularyEntity sampleVocab;

    @BeforeEach
    void setUp() {
        sampleVocab = VocabularyEntity.builder()
                .id("voc_test123")
                .word("mitigate")
                .partOfSpeech("verb")
                .cefr("C1")
                .bandScore(BigDecimal.valueOf(7.5))
                .definition("To make something less harmful")
                .example("We need to mitigate the risks.")
                .vietnameseMeaning("Làm giảm nhẹ")
                .status("PUBLISHED")
                .sortOrder(1)
                .build();
    }

    @Test
    @DisplayName("Should search vocabulary words successfully")
    void testSearchVocabulary() {
        Page<VocabularyEntity> page = new PageImpl<>(List.of(sampleVocab));
        when(vocabularyRepository.searchVocabulary("mitigate", "C1", "PUBLISHED", PageRequest.of(0, 10)))
                .thenReturn(page);

        Page<VocabularyDtos.Response> result = vocabularyService.search("mitigate", "C1", "PUBLISHED", PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getWord()).isEqualTo("mitigate");
        verify(vocabularyRepository, times(1)).searchVocabulary("mitigate", "C1", "PUBLISHED", PageRequest.of(0, 10));
    }

    @Test
    @DisplayName("Should throw BusinessException when creating word that already exists")
    void testCreateDuplicateWordThrows() {
        when(vocabularyRepository.existsByWordIgnoreCase("mitigate")).thenReturn(true);

        VocabularyDtos.UpsertRequest request = VocabularyDtos.UpsertRequest.builder()
                .word("mitigate")
                .partOfSpeech("verb")
                .cefr("C1")
                .bandScore(BigDecimal.valueOf(7.5))
                .definition("def")
                .example("ex")
                .build();

        assertThatThrownBy(() -> vocabularyService.create(request, "admin_1", "Admin"))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_RESOURCE);

        verify(vocabularyRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should create vocabulary and log audit record")
    void testCreateVocabularySuccess() {
        when(vocabularyRepository.existsByWordIgnoreCase("ubiquitous")).thenReturn(false);
        when(vocabularyRepository.save(any(VocabularyEntity.class))).thenAnswer(i -> i.getArgument(0));

        VocabularyDtos.UpsertRequest request = VocabularyDtos.UpsertRequest.builder()
                .word("ubiquitous")
                .partOfSpeech("adjective")
                .cefr("C2")
                .bandScore(BigDecimal.valueOf(8.5))
                .definition("Present everywhere")
                .example("Smartphones are ubiquitous.")
                .build();

        VocabularyDtos.Response created = vocabularyService.create(request, "admin_1", "Admin");

        assertThat(created).isNotNull();
        assertThat(created.getWord()).isEqualTo("ubiquitous");
        verify(auditLogService, times(1)).record(eq("admin_1"), eq("Admin"), eq("CREATE_VOCABULARY"), eq("VOCABULARY"), any(), any(), isNull());
    }

    @Test
    @DisplayName("Should delete vocabulary and log audit record")
    void testDeleteVocabulary() {
        when(vocabularyRepository.findById("voc_test123")).thenReturn(Optional.of(sampleVocab));

        vocabularyService.delete("voc_test123", "admin_1", "Admin");

        verify(vocabularyRepository, times(1)).delete(sampleVocab);
        verify(auditLogService, times(1)).record(eq("admin_1"), eq("Admin"), eq("DELETE_VOCABULARY"), eq("VOCABULARY"), eq("voc_test123"), any(), isNull());
    }
}
