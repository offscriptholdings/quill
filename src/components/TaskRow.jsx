import { useState } from 'react'
import { useTaskComplete } from '../hooks/useTaskComplete'
import { useModal } from '../context/ModalContext'

const DOMAIN_COLORS = {
  Spirit:  '#C4A962',
  Body:    '#7EA87E',
  Project: '#6B8CAE',
  Wealth:  '#C49A45',
  Family:  '#B8848A',
}

const PRIORITY_DOTS = {
  urgent: '#B8848A',
  high:   '#C49A45',
  normal: null,
  low:    null,
}

function formatDue(dateStr) {
  if (!dateStr) return null
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'due today'
  if (dateStr === tomorrow) return 'due tomorrow'
  const d = new Date(dateStr + 'T00:00:00')
  const isPast = dateStr < today
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return isPast ? `overdue ${label}` : `due ${label}`
}

export default function TaskRow({ task, onComplete, onUndo, onEdit, showDomain = true, completed = false }) {
  const { completeTask } = useTaskComplete()
  const { openTaskModal } = useModal()
  const [completing, setCompleting] = useState(completed)

  const projectName = task.projects?.name ?? null

  function handleComplete() {
    if (completing) return
    setCompleting(true)
    completeTask(task, {
      onOptimistic: () => onComplete?.(task),
      onRevert: () => setCompleting(false),
      onUndo: () => onUndo?.(task),
    })
  }

  function handleEdit() {
    if (onEdit) {
      onEdit(task)
    } else {
      openTaskModal(task)
    }
  }

  const domainColor = DOMAIN_COLORS[task.domain] ?? '#9A9187'
  const priorityColor = PRIORITY_DOTS[task.priority]
  const dueLabel = formatDue(task.due_date)
  const isOverdue = task.due_date && task.due_date < new Date().toISOString().split('T')[0]

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border">
      {/* Completion circle */}
      <button
        onClick={handleComplete}
        className="flex-shrink-0 rounded-full border-2 transition-colors mt-0.5"
        style={{
          width: 24,
          height: 24,
          minWidth: 24,
          borderColor: completing ? domainColor : '#2A2824',
          background: completing ? domainColor + '33' : 'transparent',
        }}
        aria-label="Complete task"
      />

      {/* Task content */}
      <button
        onClick={handleEdit}
        className="flex-1 text-left min-h-[44px] flex flex-col justify-center"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-task text-base leading-snug"
            style={{
              color: completing ? '#9A9187' : '#E8E2D9',
              textDecoration: completing ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </span>
          {priorityColor && !completing && (
            <span
              className="inline-block rounded-full flex-shrink-0"
              style={{ width: 6, height: 6, background: priorityColor }}
            />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {projectName && (
            <span className="font-mono text-xs text-muted">{projectName}</span>
          )}
          {dueLabel && !completing && (
            <span
              className="font-mono text-xs"
              style={{ color: isOverdue ? '#B8848A' : '#9A9187' }}
            >
              {dueLabel}
            </span>
          )}
        </div>
      </button>

      {/* Domain chip — optional */}
      {showDomain && (
        <span
          className="font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0 mt-1"
          style={{
            color: domainColor,
            background: domainColor + '1A',
            border: `1px solid ${domainColor}33`,
          }}
        >
          {task.domain}
        </span>
      )}
    </div>
  )
}
