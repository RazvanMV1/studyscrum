package io.studyscrum.notification.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {

        String query = request.getURI().getQuery();

        if (query == null || !query.contains("token=")) {
            log.warn("WebSocket handshake respins: token lipsa");
            return false;
        }

        String token = extractToken(query);

        if (token == null || !jwtService.isTokenValid(token)) {
            log.warn("WebSocket handshake respins: token invalid");
            return false;
        }

        // Injectam userId si userName in atributele sesiunii WebSocket
        attributes.put("userId", jwtService.extractUserId(token));
        attributes.put("userName", jwtService.extractName(token));
        attributes.put("email", jwtService.extractEmail(token));

        log.info("WebSocket handshake acceptat pentru userId: {}",
                jwtService.extractUserId(token));

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // Nu avem nevoie de logica post-handshake
    }

    private String extractToken(String query) {
        for (String param : query.split("&")) {
            if (param.startsWith("token=")) {
                return param.substring("token=".length());
            }
        }
        return null;
    }
}
