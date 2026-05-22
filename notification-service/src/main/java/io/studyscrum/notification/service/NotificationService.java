package io.studyscrum.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.studyscrum.notification.model.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper redisObjectMapper;

    public void publish(NotificationMessage message) {
        try {
            String channel = "notifications:" + message.getProjectId();
            String json = redisObjectMapper.writeValueAsString(message);
            stringRedisTemplate.convertAndSend(channel, json);

            log.info("Mesaj publicat pe canalul {}: type={}",
                    channel, message.getType());

        } catch (Exception e) {
            log.error("Eroare la publicarea mesajului Redis: {}", e.getMessage());
        }
    }
}
