package com.kunals990.aichat.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SessionResponse {
    private UUID id;
    private String sessionName;
    private LocalDateTime timestamp;


}
