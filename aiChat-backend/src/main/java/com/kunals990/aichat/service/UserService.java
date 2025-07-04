package com.kunals990.aichat.service;

import com.kunals990.aichat.entity.User;
import com.kunals990.aichat.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    };

    public void saveNewUser(User user) {
        userRepository.save(user);
    }
}
