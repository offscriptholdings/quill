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

export default function TaskRow({ task, onComplete, onUndo, onEdit }) {
  const { completeTask } = useTaskComplete()
  const { openTaskModal } = useModal()
  const [completing, setCompleting] = useState(false)

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
        <div className="flex items-center gap-2">
          <span
            className="font-task text-base leading-snug"
            style={{
              color: completing ? '#9A9187' : '#E8E2D9',
              textDecoration: completing ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </span>
          {priorityColor && (
            <span
              className="inline-block rounded-full flex-shrink-0"
              style={{ width: 6, height: 6, background: priorityColor }}
            />
          )}
        </div>
        {task.notes && (
          <p className="font-task text-sm text-muted mt-0.5 line-clamp-1">{task.notes}</p>
        )}
      </button>

      {/* Domain chip */}
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
    </div>
  )
}
