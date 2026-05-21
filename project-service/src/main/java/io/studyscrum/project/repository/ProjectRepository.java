package io.studyscrum.project.repository;

import io.studyscrum.project.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {

    @Query("{ 'members.userId': ?0 }")
    List<Project> findByMembersUserId(String userId);

    @Query("{ 'members': { $elemMatch: { 'userId': ?0, 'role': 'LEAD' } } }")
    List<Project> findByLeadUserId(String userId);

    boolean existsByIdAndMembersUserId(String projectId, String userId);
}
