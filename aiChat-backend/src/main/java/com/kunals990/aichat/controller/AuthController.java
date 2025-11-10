package com.kunals990.aichat.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.kunals990.aichat.entity.User;
import com.kunals990.aichat.repository.UserRepository;
import com.kunals990.aichat.service.UserService;
import com.kunals990.aichat.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @Value("${google.auth.client.secrets}")
    private String googleClientSecret;

    @Value("${google.auth.redirect.uri}")
    private String googleRedirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/google/callback")
    public ResponseEntity<?> handleGoogleCallback(@RequestBody Map<String, String> body) {

        List<String> allowedRedirects = List.of(
                "https://ai-chat-91.vercel.app/auth/callback",
                "https://ai-chat.kunalsable.com/auth/callback"
        );

        String redirectUri = body.get("redirect_uri");
        if (redirectUri == null || !allowedRedirects.contains(redirectUri)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid redirect URI");
        }

        String code = body.get("code");
        if (code == null) {
            return ResponseEntity.badRequest().body("Authorization code missing");
        }

        Map<String, String> params = new HashMap<>();
        params.put("code", code);
        params.put("client_id", googleClientId);
        params.put("client_secret", googleClientSecret);
        params.put("redirect_uri", redirectUri);
        params.put("grant_type", "authorization_code");

        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
                "https://oauth2.googleapis.com/token",
                params,
                Map.class
        );

        if (!tokenResponse.getStatusCode().is2xxSuccessful()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to exchange code");
        }

        String idToken = (String) tokenResponse.getBody().get("id_token");

        GoogleIdToken.Payload payload = verifyGoogleToken(idToken);
        if (payload == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google token");
        }

        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProvider("GOOGLE");
            newUser.setProfile_photo(picture);
            return userRepository.save(newUser);
        });

        // 4. Issue your own tokens
        String accessToken = jwtUtil.generateAccessToken(email);
        String refreshToken = jwtUtil.generateRefreshToken(email);

        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true).secure(true).path("/").sameSite("None")
                .maxAge(6 *60 * 60) // 6 hours
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true).secure(true).path("/").sameSite("None")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(Map.of("success", true));
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

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue("refresh_token") String refreshToken) {
        if (jwtUtil.validateToken(refreshToken)) {
            String email = jwtUtil.extractEmail(refreshToken);
            String newAccessToken = jwtUtil.generateAccessToken(email);

            ResponseCookie accessCookie = ResponseCookie.from("access_token", newAccessToken)
                    .httpOnly(true).secure(true).path("/").sameSite("None")
                    .maxAge(15 * 60)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                    .body(Map.of("success", true));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie deleteAccess = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(true) // true in production
                .path("/")
                .sameSite("None")
                .maxAge(0) // expires immediately
                .build();

        ResponseCookie deleteRefresh = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, deleteAccess.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, deleteRefresh.toString());

        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }


}
