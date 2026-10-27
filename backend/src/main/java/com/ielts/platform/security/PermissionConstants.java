package com.ielts.platform.security;

public final class PermissionConstants {
    private PermissionConstants() {}

    // Administration & User Management
    public static final String ADMIN_READ = "ADMIN_READ";
    public static final String USER_MANAGE = "USER_MANAGE";
    public static final String USER_READ = "USER_READ";
    public static final String USER_UPDATE_STATUS = "USER_UPDATE_STATUS";
    public static final String USER_ROLE_MANAGE = "USER_ROLE_MANAGE";

    // Content Management
    public static final String CONTENT_MANAGE = "CONTENT_MANAGE";
    public static final String CONTENT_READ = "CONTENT_READ";
    public static final String CONTENT_CREATE = "CONTENT_CREATE";
    public static final String CONTENT_UPDATE = "CONTENT_UPDATE";
    public static final String CONTENT_DELETE = "CONTENT_DELETE";

    // Assessments & Questions
    public static final String QUESTION_MANAGE = "QUESTION_MANAGE";
    public static final String TEST_MANAGE = "TEST_MANAGE";

    // Vocabulary
    public static final String VOCABULARY_MANAGE = "VOCABULARY_MANAGE";

    // Analytics, Audit & System Settings
    public static final String ANALYTICS_READ = "ANALYTICS_READ";
    public static final String AUDIT_LOG_READ = "AUDIT_LOG_READ";
    public static final String SYSTEM_SETTINGS_MANAGE = "SYSTEM_SETTINGS_MANAGE";

    // Learner & Study Permissions
    public static final String STUDY_READ = "STUDY_READ";
    public static final String STUDY_SUBMIT = "STUDY_SUBMIT";
    public static final String VOCABULARY_PERSONAL = "VOCABULARY_PERSONAL";
    public static final String PROFILE_MANAGE = "PROFILE_MANAGE";

    // File Storage Permissions
    public static final String STORAGE_UPLOAD_OWN = "STORAGE_UPLOAD_OWN";
    public static final String STORAGE_READ_OWN = "STORAGE_READ_OWN";
    public static final String STORAGE_MANAGE_ALL = "STORAGE_MANAGE_ALL";
}
