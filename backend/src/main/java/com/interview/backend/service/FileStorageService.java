package com.interview.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
public class FileStorageService {

    private final String UPLOAD_DIR = "uploads/resumes/";

    public FileStorageService() {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
            log.info("Upload directory initialized: {}", UPLOAD_DIR);
        } catch (IOException e) {
            log.error("Failed to create upload directory: {}", UPLOAD_DIR, e);
        }
    }

    public String saveFile(MultipartFile file) throws IOException {
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(UPLOAD_DIR + filename);
        Files.write(filePath, file.getBytes());
        log.info("File saved successfully at: {}", filePath);
        return filePath.toString();
    }
}

