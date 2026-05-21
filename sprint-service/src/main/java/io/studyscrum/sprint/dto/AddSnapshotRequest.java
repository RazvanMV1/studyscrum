package io.studyscrum.sprint.dto;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class AddSnapshotRequest {

    @PositiveOrZero(message = "remainingStoryPoints nu poate fi negativ")
    private int remainingStoryPoints;

    @PositiveOrZero(message = "remainingTasks nu poate fi negativ")
    private int remainingTasks;
}
