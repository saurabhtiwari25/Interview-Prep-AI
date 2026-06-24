package com.interview.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.apache.pdfbox.Loader;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@Slf4j
@RequiredArgsConstructor
public class ResumeParserService {

    private final ChatClient chatClient;

    public String extractTextFromPdf(File pdfFile) throws IOException {

        log.info("Extracting text from PDF: {}", pdfFile.getName());

        try (PDDocument document = Loader.loadPDF(pdfFile)) {

            PDFTextStripper stripper = new PDFTextStripper();

            String text = stripper.getText(document);

            if (text == null || text.isBlank()) {

                log.warn(
                        "No readable text extracted from PDF: {}",
                        pdfFile.getName()
                );

                return "";
            }

            log.info(
                    "Extracted {} characters from PDF",
                    text.length()
            );

            return text;
        }
    }

    public String extractJsonData(String extractedText) {

        if (extractedText == null || extractedText.isBlank()) {
            throw new IllegalArgumentException(
                    "Resume text is empty"
            );
        }

        log.info(
                "Extracting structured JSON data from resume text ({} chars)",
                extractedText.length()
        );

        Map<String, Object> result = chatClient.prompt()
                .user(u -> u.text("Extract the skills and projects from this resume text and return them in a JSON format with a 'skills' array and 'projects' array.\nHere is the resume: {resume}")
                        .param("resume", extractedText))
                .advisors(a -> a.param("chat_memory_conversation_id", java.util.UUID.randomUUID().toString()))
                .call()
                .entity(new ParameterizedTypeReference<Map<String, Object>>() {});

        try {
            String jsonStr = new ObjectMapper().writeValueAsString(result);
            log.info("JSON extraction complete");
            return jsonStr;
        } catch (Exception e) {
            log.error("Failed to serialize extracted map to JSON", e);
            throw new RuntimeException("JSON serialization failed", e);
        }
    }
}

