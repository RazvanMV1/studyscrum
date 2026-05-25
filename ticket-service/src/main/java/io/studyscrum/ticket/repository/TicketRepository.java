package io.studyscrum.ticket.repository;

import io.studyscrum.ticket.model.Ticket;
import io.studyscrum.ticket.model.TicketStatus;
import io.studyscrum.ticket.model.TicketType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {

    // Toate ticketele unui proiect (backlog complet)
    List<Ticket> findByProjectIdOrderByPositionAsc(String projectId);

    // Ticketele unui proiect filtrate după status (coloana Kanban)
    List<Ticket> findByProjectIdAndStatusOrderByPositionAsc(String projectId, TicketStatus status);

    // Ticketele unui sprint (Kanban board per sprint)
    List<Ticket> findBySprintIdOrderByPositionAsc(String sprintId);

    // Ticketele unui sprint filtrate după status
    List<Ticket> findBySprintIdAndStatusOrderByPositionAsc(String sprintId, TicketStatus status);

    // Ticketele unui proiect filtrate după tip
    List<Ticket> findByProjectIdAndTypeOrderByPositionAsc(String projectId, TicketType type);

    // Ticketele asignate unui user într-un proiect
    List<Ticket> findByProjectIdAndAssigneeIdOrderByPositionAsc(String projectId, String assigneeId);

    // Numărul de tickete dintr-un sprint (pentru burndown)
    long countBySprintId(String sprintId);

    // Numărul de tickete completate dintr-un sprint (pentru burndown)
    long countBySprintIdAndStatus(String sprintId, TicketStatus status);
}
