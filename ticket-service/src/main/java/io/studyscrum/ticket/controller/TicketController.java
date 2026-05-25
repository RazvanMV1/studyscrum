package io.studyscrum.ticket.controller;

import io.studyscrum.ticket.dto.CreateTicketRequest;
import io.studyscrum.ticket.dto.MoveTicketRequest;
import io.studyscrum.ticket.dto.UpdateTicketRequest;
import io.studyscrum.ticket.model.Ticket;
import io.studyscrum.ticket.model.TicketStatus;
import io.studyscrum.ticket.model.TicketType;
import io.studyscrum.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // POST /tickets/{projectId}
    // Creează un ticket nou într-un proiect
    @PostMapping("/{projectId}")
    public ResponseEntity<Ticket> createTicket(
            @PathVariable String projectId,
            @Valid @RequestBody CreateTicketRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Name") String userName) {

        Ticket ticket = ticketService.createTicket(projectId, userId, userName, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    // GET /tickets/{projectId}
    // Returnează ticketele unui proiect, opțional filtrate după status sau tip
    @GetMapping("/{projectId}")
    public ResponseEntity<List<Ticket>> getTicketsForProject(
            @PathVariable String projectId,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketType type,
            @RequestParam(required = false) String assigneeId,
            @RequestHeader("X-User-Id") String userId) {

        List<Ticket> tickets;

        if (status != null) {
            tickets = ticketService.getTicketsByStatus(projectId, status);
        } else if (type != null) {
            tickets = ticketService.getTicketsByType(projectId, type);
        } else if (assigneeId != null) {
            tickets = ticketService.getTicketsByAssignee(projectId, assigneeId);
        } else {
            tickets = ticketService.getTicketsForProject(projectId);
        }

        return ResponseEntity.ok(tickets);
    }

    // GET /tickets/{projectId}/sprint/{sprintId}
    // Returnează ticketele unui sprint (Kanban board)
    @GetMapping("/{projectId}/sprint/{sprintId}")
    public ResponseEntity<List<Ticket>> getTicketsForSprint(
            @PathVariable String projectId,
            @PathVariable String sprintId,
            @RequestParam(required = false) TicketStatus status,
            @RequestHeader("X-User-Id") String userId) {

        List<Ticket> tickets;

        if (status != null) {
            tickets = ticketService.getTicketsForSprintByStatus(sprintId, status);
        } else {
            tickets = ticketService.getTicketsForSprint(sprintId);
        }

        return ResponseEntity.ok(tickets);
    }

    // GET /tickets/{projectId}/{ticketId}
    // Returnează un ticket după ID
    @GetMapping("/{projectId}/{ticketId}")
    public ResponseEntity<Ticket> getTicketById(
            @PathVariable String projectId,
            @PathVariable String ticketId,
            @RequestHeader("X-User-Id") String userId) {

        Ticket ticket = ticketService.getTicketById(ticketId);
        return ResponseEntity.ok(ticket);
    }

    // PATCH /tickets/{projectId}/{ticketId}
    // Actualizare parțială a unui ticket
    @PatchMapping("/{projectId}/{ticketId}")
    public ResponseEntity<Ticket> updateTicket(
            @PathVariable String projectId,
            @PathVariable String ticketId,
            @RequestBody UpdateTicketRequest request,
            @RequestHeader("X-User-Id") String userId) {

        Ticket ticket = ticketService.updateTicket(ticketId, request);
        return ResponseEntity.ok(ticket);
    }

    // PATCH /tickets/{projectId}/{ticketId}/move
    // Mută un ticket în Kanban (schimbă statusul și poziția)
    @PatchMapping("/{projectId}/{ticketId}/move")
    public ResponseEntity<Ticket> moveTicket(
            @PathVariable String projectId,
            @PathVariable String ticketId,
            @Valid @RequestBody MoveTicketRequest request,
            @RequestHeader("X-User-Id") String userId) {

        Ticket ticket = ticketService.moveTicket(ticketId, request);
        return ResponseEntity.ok(ticket);
    }

    // PATCH /tickets/{projectId}/{ticketId}/assign-sprint
    // Asignează un ticket la un sprint
    @PatchMapping("/{projectId}/{ticketId}/assign-sprint")
    public ResponseEntity<Ticket> assignToSprint(
            @PathVariable String projectId,
            @PathVariable String ticketId,
            @RequestParam String sprintId,
            @RequestHeader("X-User-Id") String userId) {

        Ticket ticket = ticketService.assignToSprint(ticketId, sprintId);
        return ResponseEntity.ok(ticket);
    }

    // PATCH /tickets/{projectId}/{ticketId}/remove-sprint
    // Elimină un ticket din sprint (îl trimite înapoi în backlog)
    @PatchMapping("/{projectId}/{ticketId}/remove-sprint")
    public ResponseEntity<Ticket> removeFromSprint(
            @PathVariable String projectId,
            @PathVariable String ticketId,
            @RequestHeader("X-User-Id") String userId) {

        Ticket ticket = ticketService.removeFromSprint(ticketId);
        return ResponseEntity.ok(ticket);
    }

    // DELETE /tickets/{projectId}/{ticketId}
    // Șterge un ticket
    @DeleteMapping("/{projectId}/{ticketId}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable String projectId,
            @PathVariable String ticketId,
            @RequestHeader("X-User-Id") String userId) {

        ticketService.deleteTicket(ticketId);
        return ResponseEntity.noContent().build();
    }
}
