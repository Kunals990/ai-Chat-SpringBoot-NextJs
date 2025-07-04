package com.kunals990.aichat.controller;

import com.kunals990.aichat.entity.Chat;
import com.kunals990.aichat.entity.Session;
import com.kunals990.aichat.service.ChatService;
import com.kunals990.aichat.service.SessionService;
import com.kunals990.aichat.service.UserService;
import com.kunals990.aichat.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

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

    @PostMapping("/session")
    ResponseEntity<?> sessionController(@CookieValue(value = "access_token", required = false) String accessToken) {

        String email = jwtUtil.extractEmail(accessToken);
        System.out.println(email);
//        ResponseEntity<?> session =  ;
//        System.out.println(session);
        return sessionService.createSession(email);
    }

    @PostMapping("/llm/debug")
    public ResponseEntity<?> debugChat(@RequestBody String rawJson) {
        System.out.println("🚨 Raw JSON received: " + rawJson);
        return ResponseEntity.ok("Received");
    }
}

