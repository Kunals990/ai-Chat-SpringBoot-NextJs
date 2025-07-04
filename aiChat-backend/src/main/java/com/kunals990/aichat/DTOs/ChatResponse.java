package com.kunals990.aichat.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponse {
    private String message;
    private String timestamp;
    private Role role;

    public enum Role {
        ASSISTANT, USER
    }
}