import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import KanbanCard from '../../components/kanban/KanbanCard';
import { getSprint } from '../../api/sprints';
import { getSprintTickets, createTicket, moveTicket } from '../../api/tickets';
import type { Sprint } from '../../types/sprint';
import type { Ticket, TicketStatus, CreateTicketRequest } from '../../types/ticket';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { NotificationMessage } from '../../types/notification';

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: 'BACKLOG', label: 'Backlog' },
  { status: 'TODO', label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'IN_REVIEW', label: 'In Review' },
  { status: 'DONE', label: 'Done' },
];

const columnAccents: Record<TicketStatus, string> = {
  BACKLOG: 'border-zinc-700',
  TODO: 'border-sky-800',
  IN_PROGRESS: 'border-indigo-800',
  IN_REVIEW: 'border-amber-800',
  DONE: 'border-emerald-800',
};

const SprintPage: React.FC = () => {
  const { projectId, sprintId } = useParams<{
    projectId: string;
    sprintId: string;
  }>();
  const navigate = useNavigate();
  const { tokens } = useAuth();

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [liveNotification, setLiveNotification] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateTicketRequest>({
    title: '',
    description: '',
    type: 'TASK',
    priority: 'MEDIUM',
    storyPoints: 0,
    labels: [],
    sprintId: sprintId,
  });

  // WebSocket — notificări în timp real
  const handleNotification = useCallback((message: NotificationMessage) => {
    setLiveNotification(`${message.triggeredByUserName}: ${message.type}`);
    setTimeout(() => setLiveNotification(null), 3000);

    // Refresh tickete la evenimente relevante
    if (['TICKET_MOVED', 'TICKET_CREATED', 'TICKET_UPDATED'].includes(message.type)) {
      fetchTickets();
    }
  }, []);

  useWebSocket(
    projectId ?? null,
    handleNotification,
    tokens?.accessToken ?? null
  );

  useEffect(() => {
    if (projectId && sprintId) fetchData();
  }, [projectId, sprintId]);

  const fetchData = async () => {
    try {
      const [sprintData, ticketsData] = await Promise.all([
        getSprint(projectId!, sprintId!),
        getSprintTickets(projectId!, sprintId!),
      ]);
      setSprint(sprintData);
      setTickets(ticketsData);
    } catch (err) {
      console.error('Eroare la fetch date sprint:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const data = await getSprintTickets(projectId!, sprintId!);
      setTickets(data);
    } catch (err) {
      console.error('Eroare la fetch tickete:', err);
    }
  };

  const getColumnTickets = (status: TicketStatus) =>
    tickets
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);

  const handleMoveTicket = async (
    ticket: Ticket,
    direction: 'left' | 'right'
  ) => {
    const statusOrder: TicketStatus[] = [
      'BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE',
    ];
    const currentIndex = statusOrder.indexOf(ticket.status);
    const newIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex < 0 || newIndex >= statusOrder.length) return;

    const newStatus = statusOrder[newIndex];
    const columnTickets = getColumnTickets(newStatus);

    try {
      const updated = await moveTicket(projectId!, ticket.id, {
        status: newStatus,
        position: columnTickets.length,
      });
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? updated : t))
      );
    } catch (err) {
      console.error('Eroare la mutare ticket:', err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !projectId) return;

    setIsCreating(true);
    try {
      const ticket = await createTicket(projectId, {
        ...createForm,
        sprintId: sprintId,
      });
      setTickets((prev) => [...prev, ticket]);
      setShowCreateModal(false);
      setCreateForm({
        title: '', description: '', type: 'TASK',
        priority: 'MEDIUM', storyPoints: 0, labels: [], sprintId,
      });
    } catch (err) {
      console.error('Eroare la creare ticket:', err);
    } finally {
      setIsCreating(false);
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

      {/* Live notification toast */}
      {liveNotification && (
        <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white
                        text-xs font-medium px-4 py-2 rounded-xl shadow-lg
                        animate-pulse">
          🔴 {liveNotification}
        </div>
      )}

      <main className="px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-600 mb-4 max-w-full">
          <button onClick={() => navigate('/dashboard')}
            className="hover:text-zinc-400 transition-colors">
            Projects
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/projects/${projectId}`)}
            className="hover:text-zinc-400 transition-colors">
            Project
          </button>
          <span>/</span>
          <span className="text-zinc-400">{sprint?.name}</span>
        </div>

        {/* Sprint Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-white">{sprint?.name}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-lg border ${
                sprint?.status === 'ACTIVE'
                  ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800'
                  : sprint?.status === 'COMPLETED'
                  ? 'text-indigo-400 bg-indigo-950/50 border-indigo-800'
                  : 'text-zinc-400 bg-zinc-800/50 border-zinc-700'
              }`}>
                {sprint?.status}
              </span>
            </div>
            {sprint?.goal && (
              <p className="text-xs text-zinc-500 mt-0.5">{sprint.goal}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sprint stats */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-600
                            bg-[#111111] border border-zinc-800 rounded-xl px-4 py-2">
              <span>{sprint?.completedStoryPoints}/{sprint?.totalStoryPoints} pts</span>
              <span className="w-px h-3 bg-zinc-800" />
              <span>{sprint?.completedTasks}/{sprint?.totalTasks} tasks</span>
              <span className="w-px h-3 bg-zinc-800" />
              <span>{sprint?.startDate} → {sprint?.endDate}</span>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500
                         text-white text-sm font-medium rounded-xl transition-all duration-200
                         hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Ticket
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => {
            const columnTickets = getColumnTickets(column.status);
            return (
              <div key={column.status}
                className="flex-shrink-0 w-64">
                {/* Column Header */}
                <div className={`flex items-center justify-between mb-3 pb-2
                                border-b ${columnAccents[column.status]}`}>
                  <span className="text-xs font-medium text-zinc-400">
                    {column.label}
                  </span>
                  <span className="text-xs text-zinc-600 bg-zinc-900
                                   px-1.5 py-0.5 rounded-md">
                    {columnTickets.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {columnTickets.map((ticket) => (
                    <KanbanCard
                      key={ticket.id}
                      ticket={ticket}
                      isFirst={column.status === 'BACKLOG'}
                      isLast={column.status === 'DONE'}
                      onMoveLeft={() => handleMoveTicket(ticket, 'left')}
                      onMoveRight={() => handleMoveTicket(ticket, 'right')}
                    />
                  ))}

                  {columnTickets.length === 0 && (
                    <div className="border border-dashed border-zinc-800 rounded-xl
                                    p-4 text-center">
                      <p className="text-xs text-zinc-700">No tickets</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center
                        justify-center z-50 px-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6
                          w-full max-w-md">
            <h2 className="text-base font-semibold text-white mb-1">New Ticket</h2>
            <p className="text-xs text-zinc-500 mb-5">Add a ticket to this sprint</p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Title <span className="text-indigo-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Implement login flow"
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
                  onChange={(e) => setCreateForm((p) => ({
                    ...p, description: e.target.value
                  }))}
                  placeholder="Optional details..."
                  rows={2}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                             text-sm text-white placeholder-zinc-600 resize-none
                             focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm((p) => ({
                      ...p, type: e.target.value as any
                    }))}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-indigo-500
                               transition-colors"
                  >
                    <option value="TASK">Task</option>
                    <option value="USER_STORY">User Story</option>
                    <option value="BUG">Bug</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm((p) => ({
                      ...p, priority: e.target.value as any
                    }))}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-indigo-500
                               transition-colors"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Story points
                </label>
                <input
                  type="number"
                  min="0"
                  value={createForm.storyPoints}
                  onChange={(e) => setCreateForm((p) => ({
                    ...p, storyPoints: parseInt(e.target.value) || 0
                  }))}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-2.5
                             text-sm text-white focus:outline-none focus:border-indigo-500
                             transition-colors"
                />
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
                  disabled={isCreating || !createForm.title.trim()}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500
                             disabled:opacity-50 disabled:cursor-not-allowed
                             text-white text-sm font-medium rounded-xl
                             transition-all duration-200"
                >
                  {isCreating ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintPage;
