package io.studyscrum.notification.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // Validează tokenul și returnează claims-urile
    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Extrage userId din token
    public String extractUserId(String token) {
        return validateToken(token).getSubject();
    }

    // Extrage email din token
    public String extractEmail(String token) {
        return validateToken(token).get("email", String.class);
    }

    // Extrage name din token
    public String extractName(String token) {
        return validateToken(token).get("name", String.class);
    }

    // Verifică dacă tokenul este valid fără să arunce excepție
    public boolean isTokenValid(String token) {
        try {
            validateToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
