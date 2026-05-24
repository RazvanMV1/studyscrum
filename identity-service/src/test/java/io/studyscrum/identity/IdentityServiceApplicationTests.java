package io.studyscrum.identity;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=mongodb://localhost:27017/test",
    "spring.security.oauth2.client.registration.google.client-id=test-client-id",
    "spring.security.oauth2.client.registration.google.client-secret=test-client-secret",
    "jwt.secret=test-jwt-secret-key-that-is-long-enough-for-testing-purposes",
    "eureka.client.enabled=false",
    "spring.cloud.discovery.enabled=false"
})
class IdentityServiceApplicationTests {
    @Test
    void contextLoads() {
    }
}