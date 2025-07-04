package com.kunals990.aichat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String name;
    private String provider;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Session> sessions;
}