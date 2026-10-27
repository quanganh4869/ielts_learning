package com.ielts.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class IeltsAdminApplication {

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(IeltsAdminApplication.class, args);
    }

    private static void loadDotenv() {
        Path[] candidatePaths = new Path[]{
                Path.of(".env"),
                Path.of("backend/.env"),
                Path.of("../backend/.env"),
                Path.of("../.env")
        };

        for (Path path : candidatePaths) {
            if (Files.isRegularFile(path)) {
                try (BufferedReader reader = Files.newBufferedReader(path)) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String val = line.substring(eqIdx + 1).trim();
                            if ((val.startsWith("\"") && val.endsWith("\"")) ||
                                (val.startsWith("'") && val.endsWith("'"))) {
                                val = val.substring(1, val.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                } catch (IOException ignored) {}
                break;
            }
        }
    }
}

