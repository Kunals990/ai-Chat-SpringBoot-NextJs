package com.kunals990.aichat.controller;

import com.kunals990.aichat.entity.Chat;
import com.kunals990.aichat.service.ChatService;
import com.kunals990.aichat.service.SessionService;
import com.kunals990.aichat.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SessionService sessionService;



    @PostMapping("/llm")
    ResponseEntity<?> chatController(@RequestBody Chat chat) {
        return chatService.getChat(chat);
    }

    @PostMapping("/all-chats")
    ResponseEntity<?> getAllChats(@RequestBody Map<String, String> request) {
        String sessionId = request.get("sessionId");
        return chatService.getAllChats(sessionId);
    }

    @PostMapping("/session")
    ResponseEntity<?> createSession(@CookieValue(value = "access_token", required = false) String accessToken) {

        String email = jwtUtil.extractEmail(accessToken);
        System.out.println(email);
        return sessionService.createSession(email);
    }

    @PostMapping("/llm/debug")
    public ResponseEntity<?> debugChat(@RequestBody String rawJson) {
        System.out.println("🚨 Raw JSON received: " + rawJson);
        return ResponseEntity.ok("Received");
    }

    @PostMapping("/getSession")
    ResponseEntity<?> getSession(@CookieValue(value = "access_token", required = false) String accessToken) {
        if (accessToken == null || accessToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No access token provided.");
        }
        String email = jwtUtil.extractEmail(accessToken);
        return sessionService.getSessions(email);
    }

    @PostMapping("/session-name")
    ResponseEntity<?> getSessionName(@CookieValue(value = "access_token", required = false) String accessToken,
                                     @RequestBody String sessionIdStr) {
        return sessionService.getSessionName(sessionIdStr);
    }
}

