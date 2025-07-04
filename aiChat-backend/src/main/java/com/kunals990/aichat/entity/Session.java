package com.kunals990.aichat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Session {
    @Id
    @GeneratedValue
    private UUID id;

    private String sessionName;

    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    private List<Chat> chats;
}
