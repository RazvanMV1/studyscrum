package io.studyscrum.ticket.service;

import io.studyscrum.ticket.dto.CreateTicketRequest;
import io.studyscrum.ticket.dto.MoveTicketRequest;
import io.studyscrum.ticket.dto.UpdateTicketRequest;
import io.studyscrum.ticket.model.Ticket;
import io.studyscrum.ticket.model.TicketStatus;
import io.studyscrum.ticket.model.TicketType;
import io.studyscrum.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    // Creează un ticket nou în backlog sau direct într-un sprint
    public Ticket createTicket(String projectId, String reporterId,
                               String reporterName, CreateTicketRequest request) {

        // Poziția este la sfârșitul listei din statusul BACKLOG
        long count = ticketRepository.countBySprintIdAndStatus(
                request.getSprintId() != null ? request.getSprintId() : "",
                TicketStatus.BACKLOG
        );

        Ticket ticket = Ticket.builder()
                .projectId(projectId)
                .sprintId(request.getSprintId())
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType() != null ? request.getType() : io.studyscrum.ticket.model.TicketType.TASK)
                .status(TicketStatus.BACKLOG)
                .priority(request.getPriority() != null ? request.getPriority() : io.studyscrum.ticket.model.TicketPriority.MEDIUM)
                .storyPoints(request.getStoryPoints())
                .assigneeId(request.getAssigneeId())
                .assigneeName(request.getAssigneeName())
                .reporterId(reporterId)
                .reporterName(reporterName)
                .position((int) count)
                .labels(request.getLabels() != null ? request.getLabels() : new java.util.ArrayList<>())
                .build();

        return ticketRepository.save(ticket);
    }

    // Returnează toate ticketele unui proiect (backlog complet)
    public List<Ticket> getTicketsForProject(String projectId) {
        return ticketRepository.findByProjectIdOrderByPositionAsc(projectId);
    }

    // Returnează ticketele unui proiect filtrate după status
    public List<Ticket> getTicketsByStatus(String projectId, TicketStatus status) {
        return ticketRepository.findByProjectIdAndStatusOrderByPositionAsc(projectId, status);
    }

    // Returnează ticketele unui sprint
    public List<Ticket> getTicketsForSprint(String sprintId) {
        return ticketRepository.findBySprintIdOrderByPositionAsc(sprintId);
    }

    // Returnează ticketele unui sprint filtrate după status
    public List<Ticket> getTicketsForSprintByStatus(String sprintId, TicketStatus status) {
        return ticketRepository.findBySprintIdAndStatusOrderByPositionAsc(sprintId, status);
    }

    // Returnează ticketele unui proiect filtrate după tip
    public List<Ticket> getTicketsByType(String projectId, TicketType type) {
        return ticketRepository.findByProjectIdAndTypeOrderByPositionAsc(projectId, type);
    }

    // Returnează ticketele asignate unui user într-un proiect
    public List<Ticket> getTicketsByAssignee(String projectId, String assigneeId) {
        return ticketRepository.findByProjectIdAndAssigneeIdOrderByPositionAsc(projectId, assigneeId);
    }

    // Returnează un ticket după ID
    public Ticket getTicketById(String ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket negăsit: " + ticketId));
    }

    // Actualizare parțială (PATCH semantic) — doar câmpurile non-null din request
    public Ticket updateTicket(String ticketId, UpdateTicketRequest request) {
        Ticket ticket = getTicketById(ticketId);

        if (request.getTitle() != null) ticket.setTitle(request.getTitle());
        if (request.getDescription() != null) ticket.setDescription(request.getDescription());
        if (request.getType() != null) ticket.setType(request.getType());
        if (request.getStatus() != null) ticket.setStatus(request.getStatus());
        if (request.getPriority() != null) ticket.setPriority(request.getPriority());
        if (request.getStoryPoints() > 0) ticket.setStoryPoints(request.getStoryPoints());
        if (request.getAssigneeId() != null) ticket.setAssigneeId(request.getAssigneeId());
        if (request.getAssigneeName() != null) ticket.setAssigneeName(request.getAssigneeName());
        if (request.getSprintId() != null) ticket.setSprintId(request.getSprintId());
        if (request.getLabels() != null) ticket.setLabels(request.getLabels());

        return ticketRepository.save(ticket);
    }

    // Mută un ticket în Kanban (schimbă statusul și poziția)
    public Ticket moveTicket(String ticketId, MoveTicketRequest request) {
        Ticket ticket = getTicketById(ticketId);

        ticket.setStatus(request.getStatus());
        ticket.setPosition(request.getPosition());

        return ticketRepository.save(ticket);
    }

    // Asignează un ticket la un sprint
    public Ticket assignToSprint(String ticketId, String sprintId) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setSprintId(sprintId);
        ticket.setStatus(TicketStatus.TODO);
        return ticketRepository.save(ticket);
    }

    // Elimină un ticket din sprint (îl trimite înapoi în backlog)
    public Ticket removeFromSprint(String ticketId) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setSprintId(null);
        ticket.setStatus(TicketStatus.BACKLOG);
        return ticketRepository.save(ticket);
    }

    // Șterge un ticket
    public void deleteTicket(String ticketId) {
        Ticket ticket = getTicketById(ticketId);
        ticketRepository.delete(ticket);
    }
}
