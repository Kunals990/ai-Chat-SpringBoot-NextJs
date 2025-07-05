package com.kunals990.aichat.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kunals990.aichat.entity.Chat;
import com.kunals990.aichat.entity.Session;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SessionChatsResponse {

    private String message;

    private Chat.Role role;

    private String LLM;

    private LocalDateTime timestamp;

}
