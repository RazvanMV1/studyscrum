package io.studyscrum.notification.controller;

import io.studyscrum.notification.model.NotificationMessage;
import io.studyscrum.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // REST endpoint pentru publicarea notificarilor din alte servicii
    // POST /notifications/publish
    @PostMapping("/notifications/publish")
    public ResponseEntity<Void> publishNotification(
            @RequestBody NotificationMessage message,
            @RequestHeader("X-User-Id") String userId) {

        notificationService.publish(message);
        return ResponseEntity.ok().build();
    }

    // WebSocket STOMP endpoint
    // Frontul trimite mesaje la /app/notify
    @MessageMapping("/notify")
    public void handleClientMessage(
            @Payload NotificationMessage message,
            SimpMessageHeaderAccessor headerAccessor) {

        // Preluam userId din atributele sesiunii WebSocket
        // (setate de WebSocketAuthInterceptor la handshake)
        String userId = (String) headerAccessor.getSessionAttributes()
                .get("userId");
        String userName = (String) headerAccessor.getSessionAttributes()
                .get("userName");

        message.setTriggeredByUserId(userId);
        message.setTriggeredByUserName(userName);

        log.info("Mesaj WebSocket primit de la {}: type={}",
                userName, message.getType());

        notificationService.publish(message);
    }
}
