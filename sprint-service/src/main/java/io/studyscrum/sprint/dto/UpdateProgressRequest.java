package io.studyscrum.sprint.dto;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class UpdateProgressRequest {

    @PositiveOrZero(message = "completedStoryPoints nu poate fi negativ")
    private int completedStoryPoints;

    @PositiveOrZero(message = "completedTasks nu poate fi negativ")
    private int completedTasks;
}
