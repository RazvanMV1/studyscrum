package io.studyscrum.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.studyscrum.notification.model.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisMessageSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper redisObjectMapper;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            // message.getBody() contine JSON-ul raw ca bytes
            String json = new String(message.getBody());

            NotificationMessage notification = redisObjectMapper
                    .readValue(json, NotificationMessage.class);

            String projectId = notification.getProjectId();
            String destination = "/topic/project/" + projectId;

            messagingTemplate.convertAndSend(destination, notification);

            log.info("Notificare trimisa pe {}: type={}", destination,
                    notification.getType());

        } catch (Exception e) {
            log.error("Eroare la procesarea mesajului Redis: {}", e.getMessage());
        }
    }
}
