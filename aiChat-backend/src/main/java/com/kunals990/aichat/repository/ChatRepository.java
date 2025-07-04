package com.kunals990.aichat.repository;

import com.kunals990.aichat.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRepository extends JpaRepository<Chat, Long> {}