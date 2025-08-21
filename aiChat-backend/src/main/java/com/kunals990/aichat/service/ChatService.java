package com.kunals990.aichat.service;

import com.kunals990.aichat.DTOs.ChatRequest;
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
import java.util.stream.Collectors;

@Service
@Slf4j
public class ChatService {

    private final Map<String, LLM> llmMap = new HashMap<>();
    private final SessionRepository sessionRepository;
    private final ChatRepository chatRepository;

    @Autowired
    private RateLimiterService rateLimiterService;

    @Autowired
    public ChatService(List<LLM> llmList, SessionRepository sessionRepository, ChatRepository chatRepository) {
        for (LLM llm : llmList) {
            String key = llm.getClass().getSimpleName().toLowerCase();
            llmMap.put(key, llm);
        }
        this.sessionRepository = sessionRepository;
        this.chatRepository = chatRepository;
    }

    public ResponseEntity<?> getChat(ChatRequest chatRequest) {
        String llmKey = chatRequest.getLLM() != null ?chatRequest.getLLM().toLowerCase() : "openai";

        LLM selectedLlm = llmMap.getOrDefault(llmKey, llmMap.get("openai"));
        System.out.println("llm key is "+llmKey);
        System.out.println("selected llm is "+selectedLlm);
        UUID sessionId = chatRequest.getSession().getId();

        Session session = sessionRepository.getSessionById(sessionId);
        if (session == null) {
            log.error("Session not found with ID: {}", sessionId);
            return ResponseEntity.badRequest().body("Session not found");
        }

        String userId= session.getUser().getEmail();
        boolean allowed = rateLimiterService.isAllowed(userId);
        int remaining = rateLimiterService.getRemaining(userId);

        if (!allowed) {
            return ResponseEntity.status(429).body("Rate limit exceeded. Try again tomorrow.");
        }

        List<ChatRequest.MessageDTO> messages = chatRequest.getMessages();
        ChatRequest.MessageDTO lastUserMessage = messages.get(messages.size() - 1);
        String prompt = buildPrompt(messages);
        String response = selectedLlm.getResponse(prompt);

        boolean isFirstChat = !chatRepository.existsBySessionId(sessionId);
        if (isFirstChat) {
            String titlePrompt =
                    "Generate a short, clear title (2 to 4 words) for this chat:\n\n" +
                            "User: " + lastUserMessage.getParts().get(0).getText() + "\n\n" +
                            "Assistant: " + response +
                            "\n\nOnly return the title, no punctuation or quotation marks.";

            String generatedTitle = selectedLlm.getResponse(titlePrompt);
            session.setSessionName(generatedTitle);
            sessionRepository.save(session);
        }

        Chat userChat = new Chat();
        userChat.setLLM(selectedLlm.toString());
        userChat.setRole(Chat.Role.USER);
        userChat.setMessage(lastUserMessage.getParts().get(0).getText());
        userChat.setTimestamp(LocalDateTime.now());
        userChat.setSession(session);
        chatRepository.save(userChat);

        Chat assistantChat = new Chat();
        assistantChat.setRole(Chat.Role.ASSISTANT);
        assistantChat.setMessage(response);
        assistantChat.setLLM(llmKey);
        assistantChat.setTimestamp(LocalDateTime.now());
        assistantChat.setSession(session);
        chatRepository.save(assistantChat);

        ChatResponse chatResponse = new ChatResponse();
        chatResponse.setMessage(response);
        chatResponse.setRole(ChatResponse.Role.ASSISTANT);
        chatResponse.setTimestamp(LocalDateTime.now().toString());


        return ResponseEntity.ok(Map.of(
                "chat", chatResponse,
                "remaining", remaining
        ));
    }

    private String buildPrompt(List<ChatRequest.MessageDTO> messages) {
        StringBuilder sb = new StringBuilder();
        for (ChatRequest.MessageDTO msg : messages) {
            String role = msg.getRole().equalsIgnoreCase("user") ? "User" : "Assistant";
            String content = msg.getParts().stream()
                    .map(ChatRequest.PartDTO::getText)
                    .collect(Collectors.joining(" "));

            sb.append(role).append(": ").append(content).append("\n");
        }
        return sb.toString();
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
