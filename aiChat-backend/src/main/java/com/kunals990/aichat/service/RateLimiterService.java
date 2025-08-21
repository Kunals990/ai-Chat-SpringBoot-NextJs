package com.kunals990.aichat.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;

@Service
public class RateLimiterService {
    private final StringRedisTemplate redisTemplate;
    private static final int DAILY_LIMIT = 10;

    public RateLimiterService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isAllowed(String userId) {
        String today = LocalDate.now().toString(); // e.g., 2025-08-21
        String key = "user:" + userId + ":messages:" + today;

        Long count = redisTemplate.opsForValue().increment(key);

        if (count != null && count == 1) {
            redisTemplate.expire(key, Duration.ofDays(1));
        }

        return count != null && count <= DAILY_LIMIT;
    }

    public int getRemaining(String userId) {
        String today = LocalDate.now().toString();
        String key = "user:" + userId + ":messages:" + today;

        String value = redisTemplate.opsForValue().get(key);
        int count = (value != null) ? Integer.parseInt(value) : 0;

        return Math.max(DAILY_LIMIT - count, 0);
    }

}

