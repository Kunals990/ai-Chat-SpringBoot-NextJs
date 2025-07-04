package com.kunals990.aichat.repository;

import com.kunals990.aichat.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, Long> {
    Session getSessionById(UUID id);
}