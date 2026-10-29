package com.ielts.platform.db.model;

import java.util.Set;
import lombok.Getter;

@Getter
public enum ResourceType {
    SPEAKING_AUDIO(
            "speaking",
            AccessLevel.PRIVATE,
            26_214_400L, // 25 MB max
            Set.of("audio/webm", "audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg", "audio/m4a", "audio/mp4", "audio/x-m4a")
    ),
    LISTENING_AUDIO(
            "listening",
            AccessLevel.PUBLIC,
            62_914_560L, // 60 MB max
            Set.of("audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg")
    ),
    LESSON_MATERIAL(
            "materials",
            AccessLevel.PUBLIC,
            31_457_280L, // 30 MB max
            Set.of("application/pdf", "image/jpeg", "image/png", "image/webp")
    ),
    USER_AVATAR(
            "avatars",
            AccessLevel.PUBLIC,
            5_242_880L, // 5 MB max
            Set.of("image/jpeg", "image/png", "image/webp")
    );

    private final String folder;
    private final AccessLevel defaultAccessLevel;
    private final long maxSizeBytes;
    private final Set<String> allowedMimeTypes;

    ResourceType(String folder, AccessLevel defaultAccessLevel, long maxSizeBytes, Set<String> allowedMimeTypes) {
        this.folder = folder;
        this.defaultAccessLevel = defaultAccessLevel;
        this.maxSizeBytes = maxSizeBytes;
        this.allowedMimeTypes = allowedMimeTypes;
    }

    public boolean isMimeTypeAllowed(String contentType) {
        if (contentType == null) return false;
        String cleanType = contentType.split(";")[0].trim().toLowerCase();
        return allowedMimeTypes.contains(cleanType);
    }
}
