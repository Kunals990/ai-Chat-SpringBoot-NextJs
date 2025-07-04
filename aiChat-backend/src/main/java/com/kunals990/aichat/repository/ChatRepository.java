package com.kunals990.aichat.repository;

import com.kunals990.aichat.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChatRepository extends JpaRepository<Chat, Long> {
//    int countBySessionId(UUID sessionId);
    boolean existsBySessionId(UUID sessionId);
}