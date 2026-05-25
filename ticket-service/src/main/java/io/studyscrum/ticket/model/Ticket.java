package io.studyscrum.ticket.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    @Indexed
    private String projectId;

    // Poate fi null dacă ticketul este în backlog
    @Indexed
    private String sprintId;

    private String title;

    private String description;

    @Builder.Default
    private TicketType type = TicketType.TASK;

    @Builder.Default
    private TicketStatus status = TicketStatus.BACKLOG;

    @Builder.Default
    private TicketPriority priority = TicketPriority.MEDIUM;

    // Story points estimate
    private int storyPoints;

    // Userul căruia îi este asignat ticketul
    private String assigneeId;
    private String assigneeName;

    // Userul care a creat ticketul
    private String reporterId;
    private String reporterName;

    // Ordinea în coloana Kanban
    private int position;

    // Label-uri libere (ex: "frontend", "backend", "urgent")
    @Builder.Default
    private List<String> labels = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
