package io.studyscrum.ticket.dto;

import io.studyscrum.ticket.model.TicketStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class MoveTicketRequest {

    @NotNull(message = "Statusul destinație este obligatoriu")
    private TicketStatus status;

    @PositiveOrZero(message = "Poziția nu poate fi negativă")
    private int position;
}
