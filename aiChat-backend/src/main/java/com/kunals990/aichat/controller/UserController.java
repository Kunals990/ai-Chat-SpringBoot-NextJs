package com.kunals990.aichat.controller;

import com.kunals990.aichat.DTOs.UserDetailResponse;
import com.kunals990.aichat.entity.User;
import com.kunals990.aichat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        System.out.println(user.getProfile_photo());
        return ResponseEntity.ok(new UserDetailResponse(
                user.getEmail(),
                user.getName(),
                user.getProfile_photo()
        ));
    }
}
