package com.kunals990.aichat.service;

import com.kunals990.aichat.DTOs.ChatResponse;
import com.kunals990.aichat.entity.Chat;
import com.kunals990.aichat.entity.Session;
import com.kunals990.aichat.repository.ChatRepository;
import com.kunals990.aichat.repository.SessionRepository;
import com.kunals990.aichat.service.llm.Gemini;
import com.kunals990.aichat.service.llm.LLM;
import com.kunals990.aichat.service.llm.OpenAi;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class ChatService {

    private final Map<String, LLM> llmMap = new HashMap<>();
    private final SessionRepository sessionRepository;
    private final ChatRepository chatRepository;

    @Autowired
    public ChatService(List<LLM> llmList, SessionRepository sessionRepository, ChatRepository chatRepository) {
        for (LLM llm : llmList) {
            String key = llm.getClass().getSimpleName().toLowerCase();
            llmMap.put(key, llm);
        }
        this.sessionRepository = sessionRepository;
        this.chatRepository = chatRepository;
    }

    public ResponseEntity<?> getChat(Chat chatRequest) {
        String llmKey = chatRequest.getLLM() != null ?chatRequest.getLLM().toLowerCase() : "openai";

        LLM selectedLlm = llmMap.getOrDefault(llmKey, llmMap.get("openai"));

        UUID sessionId = chatRequest.getSession().getId();

        log.info("Using LLM: {}", llmKey);
        String response = selectedLlm.getResponse(chatRequest.getMessage());

        //get session
        Session session = sessionRepository.getSessionById(sessionId);

        //save user chat
        chatRequest.setTimestamp(LocalDateTime.now());
        chatRequest.setSession(session);
        chatRepository.save(chatRequest);

        Chat chat = new Chat();
        chat.setLLM(selectedLlm.toString());
        chat.setRole(Chat.Role.ASSISTANT);
        chat.setMessage(response);
        chat.setTimestamp(LocalDateTime.now());
        chat.setSession(session);
        chatRepository.save(chat);

        ChatResponse chatResponse = new ChatResponse();
        chatResponse.setMessage(response);
        chatResponse.setRole(ChatResponse.Role.ASSISTANT);
        chatResponse.setTimestamp(LocalDateTime.now().toString());

//        System.out.println("Chat Response: " + chatResponse);
//        System.out.println("Hello");


        return ResponseEntity.ok(chatResponse);
    }
}
