package io.studyscrum.sprint.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VelocityResponse {

    private String projectId;
    private double averageVelocity;
    private int completedSprintsCount;
}
