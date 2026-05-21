package io.studyscrum.project.service;

import io.studyscrum.project.model.Project;
import io.studyscrum.project.model.ProjectMember;
import io.studyscrum.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    public Project createProject(String userId, String email, String name, Project project) {
        ProjectMember lead = ProjectMember.builder()
                .userId(userId)
                .email(email)
                .name(name)
                .role("LEAD")
                .joinedAt(Instant.now())
                .build();

        project.getMembers().add(lead);
        project.setStatus("ACTIVE");

        Project saved = projectRepository.save(project);
        log.info("Created project: {} by user: {}", saved.getId(), userId);
        return saved;
    }

    public List<Project> getProjectsForUser(String userId) {
        return projectRepository.findByMembersUserId(userId);
    }

    public Project getProjectById(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getUserId().equals(userId));

        if (!isMember) {
            throw new RuntimeException("Access denied for user: " + userId);
        }

        return project;
    }

    public Project addMember(String projectId, String leadUserId, ProjectMember newMember) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        boolean isLead = project.getMembers().stream()
                .anyMatch(m -> m.getUserId().equals(leadUserId) && m.getRole().equals("LEAD"));

        if (!isLead) {
            throw new RuntimeException("Only Team Lead can add members");
        }

        boolean alreadyMember = project.getMembers().stream()
                .anyMatch(m -> m.getUserId().equals(newMember.getUserId()));

        if (alreadyMember) {
            throw new RuntimeException("User is already a member");
        }

        newMember.setRole("MEMBER");
        newMember.setJoinedAt(Instant.now());
        project.getMembers().add(newMember);

        return projectRepository.save(project);
    }
}
