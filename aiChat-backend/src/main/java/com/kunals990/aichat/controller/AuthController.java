package com.kunals990.aichat.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.kunals990.aichat.DTOs.AuthResponse;
import com.kunals990.aichat.DTOs.TokenRequest;
import com.kunals990.aichat.entity.User;
import com.kunals990.aichat.repository.UserRepository;
import com.kunals990.aichat.service.UserService;
import com.kunals990.aichat.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${google.auth.client.id}")
    private String googleClientId;

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody TokenRequest tokenRequest, HttpServletResponse response) {
        String idTokenString = tokenRequest.getToken();

        GoogleIdToken.Payload payload = verifyGoogleToken(idTokenString);
        if (payload == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid ID token");
        }

        String email = payload.getEmail();
        String name = (String) payload.get("name");

        // Check or create user


        User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setName(name);
                        newUser.setProvider("GOOGLE");
                        return userRepository.save(newUser);
                    });


        // Issue your JWT
        String jwt = jwtUtil.generateToken(email);

        ResponseCookie jwtCookie = ResponseCookie.from("access_token", jwt)
                .httpOnly(false)
                .secure(false) // true in production; false for local dev without HTTPS
                .path("/")
                .sameSite("Lax")
                .maxAge(24 * 60 * 60) // 1 day
                .build();

        response.addHeader("Set-Cookie", jwtCookie.toString());

        return ResponseEntity.ok(new AuthResponse(jwt));
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance()
            ).setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) return idToken.getPayload();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Invalidate the cookie by setting Max-Age to 0
        ResponseCookie deleteCookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(false) // or true if you're using HTTPS
                .path("/")
                .sameSite("Lax")
                .maxAge(0) // 👈 removes the cookie
                .build();

        response.addHeader("Set-Cookie", deleteCookie.toString());

        return ResponseEntity.ok("Logged out");
    }

}
