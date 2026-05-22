export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

export type MemberRole = 'LEAD' | 'MEMBER';

export interface ProjectMember {
  userId: string;
  email: string;
  name: string;
  role: MemberRole;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  courseName?: string;
  courseCode?: string;
  semesterStart?: string;
  semesterEnd?: string;
  projectDeadline?: string;
  members: ProjectMember[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  courseName?: string;
  courseCode?: string;
  semesterStart?: string;
  semesterEnd?: string;
  projectDeadline?: string;
}
