package io.studyscrum.project.controller;

import io.studyscrum.project.model.Project;
import io.studyscrum.project.model.ProjectMember;
import io.studyscrum.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<Project> createProject(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Name") String name,
            @RequestBody Project project) {
        Project created = projectService.createProject(userId, email, name, project);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Project>> getMyProjects(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(projectService.getProjectsForUser(userId));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<Project> getProject(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String projectId) {
        return ResponseEntity.ok(projectService.getProjectById(projectId, userId));
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<Project> addMember(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String projectId,
            @RequestBody ProjectMember member) {
        return ResponseEntity.ok(projectService.addMember(projectId, userId, member));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleException(RuntimeException ex) {
        if (ex.getMessage().contains("Access denied")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", ex.getMessage()));
        }
        if (ex.getMessage().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", ex.getMessage()));
    }
}
