package io.studyscrum.ticket.dto;

import io.studyscrum.ticket.model.TicketPriority;
import io.studyscrum.ticket.model.TicketStatus;
import io.studyscrum.ticket.model.TicketType;
import lombok.Data;

import java.util.List;

@Data
public class UpdateTicketRequest {

    private String title;
    private String description;
    private TicketType type;
    private TicketStatus status;
    private TicketPriority priority;
    private int storyPoints;
    private String assigneeId;
    private String assigneeName;
    private String sprintId;
    private List<String> labels;
}
