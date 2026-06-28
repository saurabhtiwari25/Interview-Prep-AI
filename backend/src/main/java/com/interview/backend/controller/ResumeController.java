package com.interview.backend.controller;

import com.interview.backend.exception.BadRequestException;
import com.interview.backend.exception.ResourceNotFoundException;
import com.interview.backend.model.Resume;
import com.interview.backend.model.User;
import com.interview.backend.repository.UserRepository;
import com.interview.backend.service.ResumeService;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.interview.backend.dto.ResumeChatRequest;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/resume")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return user.getId();
    }

    @PostMapping("/upload")
    public ResponseEntity<Resume> uploadResume(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        Long userId = getCurrentUserId();
        log.info("Received request to upload resume for secure userId: {}", userId);

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Resume file is empty.");
        }

        Resume savedResume = resumeService.uploadAndParseResume(file, userId);
        log.info("Successfully uploaded and parsed resume with id: {}", savedResume.getId());

        return ResponseEntity.ok(savedResume);
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chatWithResume(@RequestBody ResumeChatRequest request) {
        log.info("Received request to chat with resume");
        String query = request.query();
        Long userId = getCurrentUserId();
        
        if (query == null || query.trim().isEmpty()) {
            throw new BadRequestException("Query cannot be empty.");
        }

        String response = resumeService.chatWithResume(query, userId);
        log.info("Successfully generated chat response for secure userId: {}", userId);
        return ResponseEntity.ok(Map.of("response", response));
    }
}
