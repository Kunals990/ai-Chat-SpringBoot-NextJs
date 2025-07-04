package com.kunals990.aichat.service;

import com.kunals990.aichat.DTOs.SessionListResponse;
import com.kunals990.aichat.DTOs.SessionResponse;
import com.kunals990.aichat.entity.Session;
import com.kunals990.aichat.entity.User;
import com.kunals990.aichat.repository.SessionRepository;
import com.kunals990.aichat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    public ResponseEntity<?> createSession(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        Session session = new Session();
        session.setUser(user.get());
        session.setTimestamp(LocalDateTime.now());
        session.setSessionName("New Chat");

        Session savedSession = sessionRepository.save(session);

        SessionResponse response = new SessionResponse(
                savedSession.getId(),
                savedSession.getSessionName(),
                savedSession.getTimestamp()
        );

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> getSession(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        // Convert to DTO
        List<Session> sessions = optionalUser.get().getSessions();

        List<SessionListResponse> sessionDTOs = sessions.stream()
                .map(session -> new SessionListResponse(
                        session.getId(),
                        session.getSessionName(),
                        session.getTimestamp()
                ))
                .toList();

        return ResponseEntity.ok(sessionDTOs);
    }

    public ResponseEntity<?> getSessionName(String sessionIdStr) {
        try {
            UUID sessionId = UUID.fromString(sessionIdStr);  // 🔄 Convert string to UUID
            Session session = sessionRepository.getSessionById(sessionId);

            return ResponseEntity.ok(session.getSessionName());

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid session ID");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

}
