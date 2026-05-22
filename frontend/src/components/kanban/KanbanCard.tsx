import React, { useState } from 'react';
import type { Ticket, TicketType, TicketPriority } from '../../types/ticket';

const typeColors: Record<TicketType, string> = {
  USER_STORY: 'text-indigo-400 bg-indigo-950/50 border-indigo-800',
  TASK: 'text-sky-400 bg-sky-950/50 border-sky-800',
  BUG: 'text-rose-400 bg-rose-950/50 border-rose-800',
};

const priorityColors: Record<TicketPriority, string> = {
  LOW: 'text-zinc-500',
  MEDIUM: 'text-amber-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-rose-500',
};

const priorityIcons: Record<TicketPriority, string> = {
  LOW: '↓',
  MEDIUM: '→',
  HIGH: '↑',
  CRITICAL: '↑↑',
};

interface KanbanCardProps {
  ticket: Ticket;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  ticket,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3
                 hover:border-zinc-700 transition-all duration-200 group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Type + Priority */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md border
                         ${typeColors[ticket.type]}`}>
          {ticket.type.replace('_', ' ')}
        </span>
        <span className={`text-xs font-bold ${priorityColors[ticket.priority]}`}>
          {priorityIcons[ticket.priority]}
        </span>
      </div>

      {/* Title */}
      <p className="text-xs font-medium text-white leading-snug mb-2">
        {ticket.title}
      </p>

      {/* Labels */}
      {ticket.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {ticket.labels.slice(0, 2).map((label) => (
            <span key={label}
              className="text-xs text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded-md">
              {label}
            </span>
          ))}
          {ticket.labels.length > 2 && (
            <span className="text-xs text-zinc-700">+{ticket.labels.length - 2}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {ticket.storyPoints > 0 && (
            <span className="text-xs text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded-md">
              {ticket.storyPoints}pts
            </span>
          )}
          {ticket.assigneeName && (
            <div className="w-4 h-4 rounded-full bg-indigo-600/30 border border-indigo-800/50
                            flex items-center justify-center">
              <span className="text-xs text-indigo-400" style={{ fontSize: '8px' }}>
                {ticket.assigneeName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Move actions */}
        {showActions && (
          <div className="flex items-center gap-1">
            {!isFirst && (
              <button
                onClick={onMoveLeft}
                className="w-5 h-5 rounded-md bg-zinc-800 hover:bg-zinc-700
                           flex items-center justify-center transition-colors"
              >
                <svg className="w-3 h-3 text-zinc-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {!isLast && (
              <button
                onClick={onMoveRight}
                className="w-5 h-5 rounded-md bg-zinc-800 hover:bg-zinc-700
                           flex items-center justify-center transition-colors"
              >
                <svg className="w-3 h-3 text-zinc-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;
