package io.studyscrum.sprint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateSprintRequest {

    @NotBlank(message = "Numele sprintului este obligatoriu")
    private String name;

    private String goal;

    @NotNull(message = "Data de start este obligatorie")
    private LocalDate startDate;

    @NotNull(message = "Data de end este obligatorie")
    private LocalDate endDate;

    @Positive(message = "totalStoryPoints trebuie să fie pozitiv")
    private int totalStoryPoints;

    @Positive(message = "totalTasks trebuie să fie pozitiv")
    private int totalTasks;
}
