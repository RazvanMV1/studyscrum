package io.studyscrum.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationMessage {

    // Tipul evenimentului (ex: TICKET_MOVED, SPRINT_STARTED, MEMBER_ADDED)
    private String type;

    // ID-ul proiectului afectat
    private String projectId;

    // ID-ul sprintului afectat (poate fi null)
    private String sprintId;

    // ID-ul ticketului afectat (poate fi null)
    private String ticketId;

    // Userul care a declansat evenimentul
    private String triggeredByUserId;
    private String triggeredByUserName;

    // Payload JSON liber pentru date suplimentare
    private Object payload;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
