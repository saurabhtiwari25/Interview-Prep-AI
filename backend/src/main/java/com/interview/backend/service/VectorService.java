package com.interview.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class VectorService {

    private final VectorStore vectorStore;

    public void ingestDocuments(List<Document> documents) {

        log.info("Ingesting {} documents into vector store", documents.size());

        TokenTextSplitter splitter = new TokenTextSplitter();

        List<Document> splitDocuments = splitter.apply(documents);

        log.info("Split into {} chunks", splitDocuments.size());

        vectorStore.add(splitDocuments);
    }

    public List<Document> search(
            String query,
            int topK,
            String filterKey,
            Object filterValue
    ) {

        log.info("Searching vector store with query: '{}', topK: {}", query, topK);

        SearchRequest.Builder requestBuilder = SearchRequest.builder()
                .query(query)
                .topK(topK);

        if (filterKey != null && filterValue != null) {
            // Spring AI supports native metadata filtering expression
            String expression = filterKey + " == " + (filterValue instanceof String ? "'" + filterValue + "'" : filterValue);
            requestBuilder.filterExpression(expression);
        }

        List<Document> results = vectorStore.similaritySearch(requestBuilder.build());

        if (results == null) {
            return List.of();
        }

        log.info("Vector search returned {} results", results.size());

        return results;
    }
}