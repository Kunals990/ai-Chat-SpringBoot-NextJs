package com.kunals990.aichat.service;

import com.kunals990.aichat.DTOs.ChatResponse;
import com.kunals990.aichat.DTOs.SessionChatsResponse;
import com.kunals990.aichat.entity.Chat;
import com.kunals990.aichat.entity.Session;
import com.kunals990.aichat.repository.ChatRepository;
import com.kunals990.aichat.repository.SessionRepository;
import com.kunals990.aichat.service.llm.LLM;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

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

        Session session = sessionRepository.getSessionById(sessionId);
        if (session == null) {
            log.error("Session not found with ID: {}", sessionId);
            return ResponseEntity.badRequest().body("Session not found");
        }

        log.info("Using LLM: {}", llmKey);
        String response = selectedLlm.getResponse(chatRequest.getMessage());

        boolean isFirstChat = !chatRepository.existsBySessionId(sessionId);
        if (isFirstChat) {
            String titlePrompt = "Generate a short, clear title (2 to 4 words) for this chat:\n\n\" User: "+chatRequest.getMessage()+"\n\n\" Assistant:"+response+"\n\n Only return the title, no punctuation or quotation marks.";
            String generatedTitle = selectedLlm.getResponse(titlePrompt);
            session.setSessionName(generatedTitle);
            sessionRepository.save(session);
        }

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


        return ResponseEntity.ok(chatResponse);
    }

    public ResponseEntity<?> getAllChats(String sessionIdStr) {
        sessionIdStr = sessionIdStr.trim();
        UUID sessionId = UUID.fromString(sessionIdStr);
        Session session = sessionRepository.getSessionById(sessionId);

        if (session == null) {
            log.error("Session not found with ID: {}", sessionId);
            return ResponseEntity.badRequest().body("Session not found");
        }
        List<Chat> chats = session.getChats();

        List<SessionChatsResponse> chatDTOs = chats.stream()
                .map(chat -> new SessionChatsResponse(
                        chat.getMessage(),
                        chat.getRole(),
                        chat.getLLM(),
                        chat.getTimestamp()
                )).toList();

        return ResponseEntity.ok(chatDTOs);
    }
}
