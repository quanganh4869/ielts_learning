package com.ielts.platform.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class R2StorageConfig {

    private final R2StorageProperties properties;

    @Bean
    public S3Client s3Client() {
        String accessKey = properties.getAccessKeyId() != null ? properties.getAccessKeyId() : "mock-access-key";
        String secretKey = properties.getSecretAccessKey() != null ? properties.getSecretAccessKey() : "mock-secret-key";
        String endpoint = properties.getEffectiveEndpoint();

        log.info("Configuring Cloudflare R2 S3Client with endpoint: {}", endpoint);

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of("auto"))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        String accessKey = properties.getAccessKeyId() != null ? properties.getAccessKeyId() : "mock-access-key";
        String secretKey = properties.getSecretAccessKey() != null ? properties.getSecretAccessKey() : "mock-secret-key";
        String endpoint = properties.getEffectiveEndpoint();

        return S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of("auto"))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .build();
    }
}
