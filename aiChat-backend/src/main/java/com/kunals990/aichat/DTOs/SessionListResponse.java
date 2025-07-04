package com.kunals990.aichat.DTOs;


import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SessionListResponse {
    private UUID id;
    private String sessionName;
    private LocalDateTime timestamp;
}