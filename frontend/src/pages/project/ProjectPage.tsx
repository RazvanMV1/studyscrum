import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { getProject } from '../../api/projects';
import { getSprints, createSprint, activateSprint, completeSprint } from '../../api/sprints';
import type { Project } from '../../types/project';
import type { Sprint, CreateSprintRequest } from '../../types/sprint';

const statusColors: Record<string, string> = {
  PLANNED: 'text-zinc-400 bg-zinc-800/50 border-zinc-700',
  ACTIVE: 'text-emerald-400 bg-emerald-950/50 border-emerald-800',
  COMPLETED: 'text-indigo-400 bg-indigo-950/50 border-indigo-800',
};

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateSprintRequest>({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    totalStoryPoints: 0,
    totalTasks: 0,
  });

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectData, sprintsData] = await Promise.all([
        getProject(projectId!),
        getSprints(projectId!),
      ]);
      setProject(projectData);
      setSprints(sprintsData);
    } catch (err) {
      console.error('Eroare la fetch date proiect:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !projectId) return;

    setIsCreating(true);
    try {
      const sprint = await createSprint(projectId, createForm);
      setSprints((prev) => [sprint, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        name: '', goal: '', startDate: '', endDate: '',
        totalStoryPoints: 0, totalTasks: 0,
      });
    } catch (err) {
      console.error('Eroare la creare sprint:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleActivateSprint = async (sprintId: string) => {
    if (!projectId) return;
    try {
      const updated = await activateSprint(projectId, sprintId);
      setSprints((prev) => prev.map((s) => s.id === sprintId ? updated : s));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Cannot activate sprint');
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    if (!projectId) return;
    try {
      const updated = await completeSprint(projectId, sprintId);
      setSprints((prev) => prev.map((s) => s.id === sprintId ? updated : s));
    } catch (err) {
      console.error('Eroare la completare sprint:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-600 mb-6">
          <button onClick={() => navigate('/dashboard')}
            className="hover:text-zinc-400 transition-colors">
            Projects
          </button>
          <span>/</span>
          <span className="text-zinc-400">{project?.name}</span>
        </div>

        {/* Project Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-white">{project?.name}</h1>
            {project?.description && (
              <p className="text-sm text-zinc-500 mt-1">{project.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              {project?.courseName && (
                <span className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800
                                 px-2 py-0.5 rounded-lg">
                  {project.courseName}
                </span>
              )}
              {project?.courseCode && (
                <span className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800
                                 px-2 py-0.5 rounded-lg">
                  {project.courseCode}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500
                       text-white text-sm font-medium rounded-xl transition-all duration-200
                       hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Sprint
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sprints List */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium text-zinc-400 mb-3">
              Sprints ({sprints.length})
            </h2>

            {sprints.length === 0 ? (
              <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8
                              flex flex-col items-center justify-center text-center">
                <p className="text-sm text-zinc-500">No sprints yet</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Create your first sprint to start tracking work
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sprints.map((sprint) => (
                  <div key={sprint.id}
                    className="bg-[#111111] border border-zinc-800 rounded-2xl p-4
                               hover:border-zinc-700 transition-all duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-lg border
                                          ${statusColors[sprint.status]}`}>
                            {sprint.status}
                          </span>
                          <h3 className="text-sm font-medium text-white truncate">
                            {sprint.name}
                          </h3>
                        </div>

                        {sprint.goal && (
                          <p className="text-xs text-zinc-500 mb-2 line-clamp-1">
                            {sprint.goal}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-zinc-600">
                          <span>{sprint.startDate} → {sprint.endDate}</span>
                          <span>{sprint.completedStoryPoints}/{sprint.totalStoryPoints} pts</span>
                          <span>{sprint.completedTasks}/{sprint.totalTasks} tasks</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {sprint.status === 'PLANNED' && (
                          <button
                            onClick={() => handleActivateSprint(sprint.id)}
                            className="text-xs px-3 py-1.5 bg-emerald-950/50 border border-emerald-800
                                       text-emerald-400 hover:bg-emerald-900/50 rounded-lg
                                       transition-all duration-200"
                          >
                            Activate
                          </button>
                        )}
                        {sprint.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => navigate(`/projects/${projectId}/sprints/${sprint.id}`)}
                              className="text-xs px-3 py-1.5 bg-indigo-950/50 border border-indigo-800
                                         text-indigo-400 hover:bg-indigo-900/50 rounded-lg
                                         transition-all duration-200"
                            >
                              Open Board
                            </button>
                            <button
                              onClick={() => handleCompleteSprint(sprint.id)}
                              className="text-xs px-3 py-1.5 bg-zinc-800 border border-zinc-700
                                         text-zinc-400 hover:text-zinc-300 rounded-lg
                                         transition-all duration-200"
                            >
                              Complete
                            </button>
                          </>
                        )}
                        {sprint.status === 'COMPLETED' && (
                          <button
                            onClick={() => navigate(`/projects/${projectId}/sprints/${sprint.id}`)}
                            className="text-xs px-3 py-1.5 bg-zinc-800 border border-zinc-700
                                       text-zinc-400 hover:text-zinc-300 rounded-lg
                                       transition-all duration-200"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {sprint.totalStoryPoints > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-zinc-800/50 rounded-full h-1">
                          <div
                            className="bg-indigo-500 h-1 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                (sprint.completedStoryPoints / sprint.totalStoryPoints) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members Panel */}
          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-3">
              Members ({project?.members.length})
            </h2>
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-4 space-y-3">
              {project?.members.map((member) => (
                <div key={member.userId} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-800/50
                                  flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-indigo-400">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{member.name}</p>
                    <p className="text-xs text-zinc-600 truncate">{member.email}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md border shrink-0 ${
                    member.role === 'LEAD'
                      ? 'text-amber-400 bg-amber-950/50 border-amber-800'
                      : 'text-zinc-500 bg-zinc-800/50 border-zinc-700'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Create Sprint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center
                        justify-center z-50 px-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-base font-semibold text-white mb-1">New Sprint</h2>
            <p className="text-xs text-zinc-500 mb-5">Define the sprint scope and timeline</p>

            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Sprint name <span className="text-indigo-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Sprint 1"
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                             text-sm text-white placeholder-zinc-600
                             focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Goal</label>
                <input
                  type="text"
                  value={createForm.goal}
                  onChange={(e) => setCreateForm((p) => ({ ...p, goal: e.target.value }))}
                  placeholder="What do you want to achieve?"
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                             text-sm text-white placeholder-zinc-600
                             focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Start date <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-indigo-500
                               transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    End date <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-indigo-500
                               transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Story points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.totalStoryPoints}
                    onChange={(e) => setCreateForm((p) => ({
                      ...p, totalStoryPoints: parseInt(e.target.value) || 0
                    }))}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-indigo-500
                               transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Total tasks
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.totalTasks}
                    onChange={(e) => setCreateForm((p) => ({
                      ...p, totalTasks: parseInt(e.target.value) || 0
                    }))}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-indigo-500
                               transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-zinc-800 text-zinc-400
                             hover:text-zinc-300 hover:border-zinc-700 text-sm font-medium
                             rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !createForm.name.trim()}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500
                             disabled:opacity-50 disabled:cursor-not-allowed
                             text-white text-sm font-medium rounded-xl
                             transition-all duration-200"
                >
                  {isCreating ? 'Creating...' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
