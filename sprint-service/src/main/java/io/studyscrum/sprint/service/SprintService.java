package io.studyscrum.sprint.service;

import io.studyscrum.sprint.model.BurndownSnapshot;
import io.studyscrum.sprint.model.Sprint;
import io.studyscrum.sprint.model.SprintStatus;
import io.studyscrum.sprint.repository.SprintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;

    // Creează un sprint nou (status implicit PLANNED)
    public Sprint createSprint(String projectId, String name, String goal,
                               LocalDate startDate, LocalDate endDate,
                               int totalStoryPoints, int totalTasks) {

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("startDate nu poate fi după endDate");
        }

        Sprint sprint = Sprint.builder()
                .projectId(projectId)
                .name(name)
                .goal(goal)
                .startDate(startDate)
                .endDate(endDate)
                .totalStoryPoints(totalStoryPoints)
                .totalTasks(totalTasks)
                .completedStoryPoints(0)
                .completedTasks(0)
                .status(SprintStatus.PLANNED)
                .build();

        return sprintRepository.save(sprint);
    }

    // Returnează toate sprinturile unui proiect
    public List<Sprint> getSprintsForProject(String projectId) {
        return sprintRepository.findByProjectIdOrderByStartDateDesc(projectId);
    }

    // Returnează sprinturile unui proiect filtrate după status
    public List<Sprint> getSprintsByStatus(String projectId, SprintStatus status) {
        return sprintRepository.findByProjectIdAndStatus(projectId, status);
    }

    // Returnează un sprint după ID
    public Sprint getSprintById(String sprintId) {
        return sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint negăsit: " + sprintId));
    }

    // Activează un sprint (PLANNED → ACTIVE)
    // Un proiect nu poate avea două sprinturi active simultan
    public Sprint activateSprint(String sprintId, String projectId) {
        if (sprintRepository.existsByProjectIdAndStatus(projectId, SprintStatus.ACTIVE)) {
            throw new IllegalStateException("Există deja un sprint activ pe acest proiect");
        }

        Sprint sprint = getSprintById(sprintId);

        if (sprint.getStatus() != SprintStatus.PLANNED) {
            throw new IllegalStateException("Doar sprinturile PLANNED pot fi activate");
        }

        sprint.setStatus(SprintStatus.ACTIVE);
        return sprintRepository.save(sprint);
    }

    // Completează un sprint (ACTIVE → COMPLETED)
    public Sprint completeSprint(String sprintId) {
        Sprint sprint = getSprintById(sprintId);

        if (sprint.getStatus() != SprintStatus.ACTIVE) {
            throw new IllegalStateException("Doar sprinturile ACTIVE pot fi completate");
        }

        sprint.setStatus(SprintStatus.COMPLETED);
        return sprintRepository.save(sprint);
    }

    // Adaugă un snapshot zilnic de burndown
    public Sprint addBurndownSnapshot(String sprintId, int remainingStoryPoints, int remainingTasks) {
        Sprint sprint = getSprintById(sprintId);

        if (sprint.getStatus() != SprintStatus.ACTIVE) {
            throw new IllegalStateException("Snapshot-urile se pot adăuga doar pe sprinturi ACTIVE");
        }

        BurndownSnapshot snapshot = BurndownSnapshot.builder()
                .date(LocalDate.now())
                .remainingStoryPoints(remainingStoryPoints)
                .remainingTasks(remainingTasks)
                .build();

        sprint.getBurndownSnapshots().add(snapshot);
        return sprintRepository.save(sprint);
    }

    // Actualizează progresul (completedStoryPoints și completedTasks)
    public Sprint updateProgress(String sprintId, int completedStoryPoints, int completedTasks) {
        Sprint sprint = getSprintById(sprintId);

        if (sprint.getStatus() != SprintStatus.ACTIVE) {
            throw new IllegalStateException("Progresul se poate actualiza doar pe sprinturi ACTIVE");
        }

        sprint.setCompletedStoryPoints(completedStoryPoints);
        sprint.setCompletedTasks(completedTasks);
        return sprintRepository.save(sprint);
    }

    // Calculează velocity: media story points completate pe sprinturile COMPLETED ale proiectului
    public double getVelocity(String projectId) {
        List<Sprint> completedSprints = sprintRepository
                .findByProjectIdAndStatus(projectId, SprintStatus.COMPLETED);

        if (completedSprints.isEmpty()) {
            return 0.0;
        }

        double totalCompleted = completedSprints.stream()
                .mapToInt(Sprint::getCompletedStoryPoints)
                .sum();

        return totalCompleted / completedSprints.size();
    }
}
