package io.studyscrum.ticket.dto;

import io.studyscrum.ticket.model.TicketPriority;
import io.studyscrum.ticket.model.TicketType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CreateTicketRequest {

    @NotBlank(message = "Titlul ticketului este obligatoriu")
    private String title;

    private String description;

    private TicketType type = TicketType.TASK;

    private TicketPriority priority = TicketPriority.MEDIUM;

    private int storyPoints;

    private String assigneeId;
    private String assigneeName;

    private String sprintId;

    private List<String> labels = new ArrayList<>();
}
