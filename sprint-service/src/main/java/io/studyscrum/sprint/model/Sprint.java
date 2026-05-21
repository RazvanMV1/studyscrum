package io.studyscrum.sprint.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "sprints")
public class Sprint {

    @Id
    private String id;

    @Indexed
    private String projectId;

    private String name;

    private String goal;

    private LocalDate startDate;

    private LocalDate endDate;

    @Builder.Default
    private SprintStatus status = SprintStatus.PLANNED;

    // Story points
    private int totalStoryPoints;
    private int completedStoryPoints;

    // Task count
    private int totalTasks;
    private int completedTasks;

    // Burndown snapshots zilnice
    @Builder.Default
    private List<BurndownSnapshot> burndownSnapshots = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
