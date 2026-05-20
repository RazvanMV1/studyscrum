package io.studyscrum.identity.service;

import io.studyscrum.identity.model.User;
import io.studyscrum.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;



@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findOrCreateUser(Map<String, Object> googleAttributes) {
        String googleId = (String) googleAttributes.get("sub");
        String email = (String) googleAttributes.get("email");
        String name = (String) googleAttributes.get("name");
        String pictureUrl = (String) googleAttributes.get("picture");

        return userRepository.findByGoogleId(googleId)
                .map(existingUser -> updateExistingUser(existingUser, name, pictureUrl))
                .orElseGet(() -> createNewUser(googleId, email, name, pictureUrl));
    }

    private User updateExistingUser(User user, String name, String pictureUrl) {
        user.setName(name);
        user.setPictureUrl(pictureUrl);
        User saved = userRepository.save(user);
        log.info("Updated existing user: {}", saved.getEmail());
        return saved;
    }

    private User createNewUser(String googleId, String email, String name, String pictureUrl) {
        User newUser = User.builder()
                .googleId(googleId)
                .email(email)
                .name(name)
                .pictureUrl(pictureUrl)
                .role("MEMBER")
                .build();
        User saved = userRepository.save(newUser);
        log.info("Created new user: {}", saved.getEmail());
        return saved;
    }

    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }
}
