package com.interview.backend.service;

import com.interview.backend.model.Resume;
import com.interview.backend.model.User;
import com.interview.backend.repository.ResumeRepository;
import com.interview.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;

@Service
@Slf4j
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ResumeParserService resumeParserService;
    private final VectorService vectorService;
    private final ChatClient chatClient;

    public Resume uploadAndParseResume(
            MultipartFile file,
            Long userId
    ) throws IOException {

        log.info("Starting resume upload and parse for userId: {}", userId);

        // Validate file
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume file is empty");
        }

        // Save file
        String filePath = fileStorageService.saveFile(file);
        log.info("File saved to: {}", filePath);

        File savedFile = new File(filePath);
        String extractedText = resumeParserService.extractTextFromPdf(savedFile);

        if (extractedText == null || extractedText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not extract readable text from resume");
        }

        ingestToVectorStore(extractedText, userId);

        return extractAndSaveResumeData(filePath, extractedText, userId);
    }

    private void ingestToVectorStore(String extractedText, Long userId) {
        if (userId == null) {
            return;
        }

        log.info("Ingesting document into vector store for userId: {}", userId);

        Document document = new Document(extractedText, java.util.Map.of("userId", userId));

        vectorService.ingestDocuments(java.util.List.of(document));
        log.info("Successfully ingested document");
    }

    private Resume extractAndSaveResumeData(String filePath, String extractedText, Long userId) {
        String jsonResponse = resumeParserService.extractJsonData(extractedText);

        if (jsonResponse == null || jsonResponse.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "AI failed to extract resume data");
        }

        Resume resume = new Resume();
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            userOpt.ifPresent(resume::setUser);
        }

        resume.setFileUrl(filePath);
        resume.setExtractedText(jsonResponse);

        Resume savedResume = resumeRepository.save(resume);
        log.info("Resume saved to database with id: {}", savedResume.getId());

        return savedResume;
    }

    public String chatWithResume(String query, Long userId) {
        log.info("Processing resume chat for userId: {} with query: {}", userId, query);
        List<Document> similarDocuments = vectorService.search(query, 3, "userId", userId);
        log.debug("Found {} similar documents for query", similarDocuments.size());

        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n"));

        String response = chatClient.prompt()
                .system(s -> s.text("You are an AI assistant helping a user with their resume. " +
                                "Use the following resume context to answer the user's question.\n\nContext:\n{context}")
                        .param("context", context))
                .user(query)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, String.valueOf(userId)))
                .call()
                .content();
        log.info("Resume chat response generated for userId: {}", userId);
        return response;
    }
}