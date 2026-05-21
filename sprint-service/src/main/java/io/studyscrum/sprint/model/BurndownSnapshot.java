package io.studyscrum.sprint.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BurndownSnapshot {

    private LocalDate date;

    // Remaining story points la sfârșitul zilei
    private int remainingStoryPoints;

    // Remaining tasks la sfârșitul zilei
    private int remainingTasks;
}
