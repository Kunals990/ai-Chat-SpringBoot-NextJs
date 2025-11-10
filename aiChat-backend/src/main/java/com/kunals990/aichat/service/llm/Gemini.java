package com.kunals990.aichat.service.llm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

@Service
public class Gemini implements LLM{

    public final String apiKey;
    private final Client client;

    @Autowired
    private RestTemplate restTemplate;

    public Gemini(@Value("${gemini.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.client = Client.builder().apiKey(apiKey).build();
    }

    @Override
    public String getResponse(String chat) {
        GenerateContentResponse response =
                client.models.generateContent("gemini-2.5-flash", chat, null);
        return response.text();
    }

}