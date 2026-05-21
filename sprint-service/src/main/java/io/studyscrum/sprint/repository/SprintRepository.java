package io.studyscrum.sprint.repository;

import io.studyscrum.sprint.model.Sprint;
import io.studyscrum.sprint.model.SprintStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SprintRepository extends MongoRepository<Sprint, String> {

    // Toate sprinturile unui proiect, ordonate descrescător după data de start
    List<Sprint> findByProjectIdOrderByStartDateDesc(String projectId);

    // Sprinturile unui proiect filtrate după status
    List<Sprint> findByProjectIdAndStatus(String projectId, SprintStatus status);

    // Verifică dacă există deja un sprint activ pe proiect
    boolean existsByProjectIdAndStatus(String projectId, SprintStatus status);
}
