package io.studyscrum.sprint.controller;

import io.studyscrum.sprint.dto.AddSnapshotRequest;
import io.studyscrum.sprint.dto.CreateSprintRequest;
import io.studyscrum.sprint.dto.UpdateProgressRequest;
import io.studyscrum.sprint.dto.VelocityResponse;
import io.studyscrum.sprint.model.Sprint;
import io.studyscrum.sprint.model.SprintStatus;
import io.studyscrum.sprint.service.SprintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;

    // POST /sprints/{projectId}
    // Creează un sprint nou pentru un proiect
    @PostMapping("/{projectId}")
    public ResponseEntity<Sprint> createSprint(
            @PathVariable String projectId,
            @Valid @RequestBody CreateSprintRequest request,
            @RequestHeader("X-User-Id") String userId) {

        Sprint sprint = sprintService.createSprint(
                projectId,
                request.getName(),
                request.getGoal(),
                request.getStartDate(),
                request.getEndDate(),
                request.getTotalStoryPoints(),
                request.getTotalTasks()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(sprint);
    }

    // GET /sprints/{projectId}
    // Returnează toate sprinturile unui proiect, opțional filtrate după status
    @GetMapping("/{projectId}")
    public ResponseEntity<List<Sprint>> getSprintsForProject(
            @PathVariable String projectId,
            @RequestParam(required = false) SprintStatus status,
            @RequestHeader("X-User-Id") String userId) {

        List<Sprint> sprints;

        if (status != null) {
            sprints = sprintService.getSprintsByStatus(projectId, status);
        } else {
            sprints = sprintService.getSprintsForProject(projectId);
        }

        return ResponseEntity.ok(sprints);
    }

    // GET /sprints/{projectId}/{sprintId}
    // Returnează un sprint după ID
    @GetMapping("/{projectId}/{sprintId}")
    public ResponseEntity<Sprint> getSprintById(
            @PathVariable String projectId,
            @PathVariable String sprintId,
            @RequestHeader("X-User-Id") String userId) {

        Sprint sprint = sprintService.getSprintById(sprintId);
        return ResponseEntity.ok(sprint);
    }

    // PATCH /sprints/{projectId}/{sprintId}/activate
    // Activează un sprint (PLANNED → ACTIVE)
    @PatchMapping("/{projectId}/{sprintId}/activate")
    public ResponseEntity<Sprint> activateSprint(
            @PathVariable String projectId,
            @PathVariable String sprintId,
            @RequestHeader("X-User-Id") String userId) {

        Sprint sprint = sprintService.activateSprint(sprintId, projectId);
        return ResponseEntity.ok(sprint);
    }

    // PATCH /sprints/{projectId}/{sprintId}/complete
    // Completează un sprint (ACTIVE → COMPLETED)
    @PatchMapping("/{projectId}/{sprintId}/complete")
    public ResponseEntity<Sprint> completeSprint(
            @PathVariable String projectId,
            @PathVariable String sprintId,
            @RequestHeader("X-User-Id") String userId) {

        Sprint sprint = sprintService.completeSprint(sprintId);
        return ResponseEntity.ok(sprint);
    }

    // PATCH /sprints/{projectId}/{sprintId}/progress
    // Actualizează completedStoryPoints și completedTasks
    @PatchMapping("/{projectId}/{sprintId}/progress")
    public ResponseEntity<Sprint> updateProgress(
            @PathVariable String projectId,
            @PathVariable String sprintId,
            @Valid @RequestBody UpdateProgressRequest request,
            @RequestHeader("X-User-Id") String userId) {

        Sprint sprint = sprintService.updateProgress(
                sprintId,
                request.getCompletedStoryPoints(),
                request.getCompletedTasks()
        );

        return ResponseEntity.ok(sprint);
    }

    // POST /sprints/{projectId}/{sprintId}/snapshot
    // Adaugă un snapshot zilnic de burndown
    @PostMapping("/{projectId}/{sprintId}/snapshot")
    public ResponseEntity<Sprint> addBurndownSnapshot(
            @PathVariable String projectId,
            @PathVariable String sprintId,
            @Valid @RequestBody AddSnapshotRequest request,
            @RequestHeader("X-User-Id") String userId) {

        Sprint sprint = sprintService.addBurndownSnapshot(
                sprintId,
                request.getRemainingStoryPoints(),
                request.getRemainingTasks()
        );

        return ResponseEntity.ok(sprint);
    }

    // GET /sprints/{projectId}/velocity
    // Returnează velocity-ul mediu al proiectului
    @GetMapping("/{projectId}/velocity")
    public ResponseEntity<VelocityResponse> getVelocity(
            @PathVariable String projectId,
            @RequestHeader("X-User-Id") String userId) {

        List<Sprint> completedSprints = sprintService.getSprintsByStatus(
                projectId, SprintStatus.COMPLETED);

        double velocity = sprintService.getVelocity(projectId);

        return ResponseEntity.ok(new VelocityResponse(
                projectId,
                velocity,
                completedSprints.size()
        ));
    }
}
