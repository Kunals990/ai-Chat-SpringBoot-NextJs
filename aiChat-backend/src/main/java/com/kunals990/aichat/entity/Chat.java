package com.kunals990.aichat.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private Role role;

    @JsonProperty("LLM")
    private String LLM;

    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private Session session;

    public enum Role {
        ASSISTANT, USER
    }
}