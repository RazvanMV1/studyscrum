package io.studyscrum.identity.controller;

import io.studyscrum.identity.model.User;
import io.studyscrum.identity.service.JwtService;
import io.studyscrum.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7);

        if (!jwtService.isTokenValid(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
        }

        String userId = jwtService.extractUserId(token);
        User user = userService.findById(userId);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "pictureUrl", user.getPictureUrl() != null ? user.getPictureUrl() : "",
                "role", user.getRole()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");

        if (refreshToken == null || !jwtService.isTokenValid(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired refresh token"));
        }

        String userId = jwtService.extractUserId(refreshToken);
        User user = userService.findById(userId);

        String newAccessToken = jwtService.generateAccessToken(user);

        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }
}
