package io.studyscrum.project.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMember {

    private String userId;

    private String email;

    private String name;

    private String role;

    private Instant joinedAt;
}
