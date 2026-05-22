import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { getProjects, createProject } from '../../api/projects';
import type { Project, CreateProjectRequest } from '../../types/project';

const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    courseName: '',
    courseCode: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Eroare la fetch proiecte:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    setIsCreating(true);
    try {
      const project = await createProject(createForm);
      setProjects((prev) => [project, ...prev]);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', courseName: '', courseCode: '' });
    } catch (err) {
      console.error('Eroare la creare proiect:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-white">Projects</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
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
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">No projects yet</p>
            <p className="text-xs text-zinc-600 mt-1">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="text-left bg-[#111111] border border-zinc-800 rounded-2xl p-5
                           hover:border-zinc-700 hover:bg-[#161616] transition-all duration-200
                           hover:scale-[1.01] active:scale-[0.99] group"
              >
                {/* Project status dot */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      project.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-zinc-600'
                    }`} />
                    <span className="text-xs text-zinc-500 uppercase tracking-wide">
                      {project.status}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <h3 className="text-sm font-semibold text-white mb-1 truncate">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-xs text-zinc-500 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-800/50">
                  {project.courseName && (
                    <span className="text-xs text-zinc-600 truncate">
                      {project.courseName}
                    </span>
                  )}
                  <span className="text-xs text-zinc-600 ml-auto">
                    {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-base font-semibold text-white mb-1">New Project</h2>
            <p className="text-xs text-zinc-500 mb-5">Fill in the details for your new project</p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Project name <span className="text-indigo-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Cloud Computing Final Project"
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                             text-sm text-white placeholder-zinc-600
                             focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the project..."
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                             text-sm text-white placeholder-zinc-600 resize-none
                             focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Course name
                  </label>
                  <input
                    type="text"
                    value={createForm.courseName}
                    onChange={(e) => setCreateForm((p) => ({ ...p, courseName: e.target.value }))}
                    placeholder="e.g. Cloud Computing"
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                               text-sm text-white placeholder-zinc-600
                               focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Course code
                  </label>
                  <input
                    type="text"
                    value={createForm.courseCode}
                    onChange={(e) => setCreateForm((p) => ({ ...p, courseCode: e.target.value }))}
                    placeholder="e.g. CC2026"
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                               text-sm text-white placeholder-zinc-600
                               focus:outline-none focus:border-indigo-500 transition-colors"
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
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
