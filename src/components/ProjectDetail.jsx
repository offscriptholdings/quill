import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import TaskRow from './TaskRow'
import ProjectModal from './ProjectModal'
import { useModal } from '../context/ModalContext'

const PRIORITY_RANK = { urgent: 0, high: 1, normal: 2, low: 3 }

const STATUS_COLORS = {
  active:   '#7EA87E',
  waiting:  '#C49A45',
  complete: '#6B8CAE',
  archived: '#9A9187',
}

const DOMAIN_COLORS = {
  Spirit:  '#C4A962',
  Body:    '#7EA87E',
  Project: '#6B8CAE',
  Wealth:  '#C49A45',
  Family:  '#B8848A',
}

export default function ProjectDetail({ project: initialProject, onBack, onProjectUpdated }) {
  const { openTaskModal } = useModal()

  const [project, setProject] = useState(initialProject)
  const [tasks, setTasks] = useState([])
  const [deps, setDeps] = useState({})
  const [expandedDep, setExpandedDep] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchProjectData = useCallback(async () => {
    const [tasksRes, depsRes] = await Promise.all([
      supabase
        .schema('quill')
        .from('tasks')
        .select('*, projects!project_id(name)')
        .eq('project_id', project.id)
        .eq('status', 'open')
        .order('priority'),
      supabase
        .schema('quill')
        .from('dependencies')
        .select('task_id, depends_on_task_id, blocker:depends_on_task_id(id, title, status, domain)')
        .in(
          'task_id',
          (await supabase.schema('quill').from('tasks').select('id').eq('project_id', project.id)).data?.map(t => t.id) ?? []
        ),
    ])

    if (tasksRes.data) {
      setTasks(tasksRes.data.sort((a, b) => (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2)))
    }

    if (depsRes.data) {
      const depMap = {}
      for (const d of depsRes.data) {
        if (!depMap[d.task_id]) depMap[d.task_id] = []
        depMap[d.task_id].push(d.blocker)
      }
      setDeps(depMap)
    }

    setLoading(false)
  }, [project.id])

  useEffect(() => { fetchProjectData() }, [fetchProjectData])

  function handleComplete(task) {
    setTasks(ts => ts.filter(t => t.id !== task.id))
  }

  function handleUndo() {
    fetchProjectData()
  }

  function handleAddTask() {
    openTaskModal(
      { domain: 'Project', project_id: project.id },
      { onSaved: (saved, mode) => {
          if (mode === 'create') setTasks(ts => [...ts, saved])
          else setTasks(ts => ts.map(t => t.id === saved.id ? { ...t, ...saved } : t))
        }
      }
    )
  }

  async function handleStatusChange(newStatus) {
    setActionLoading(true)
    const { data } = await supabase.schema('quill').from('projects').update({ status: newStatus }).eq('id', project.id).select().single()
    if (data) {
      setProject(data)
      onProjectUpdated?.(data)
    }
    setActionLoading(false)
  }

  const domainColor = DOMAIN_COLORS[project.domain] ?? '#9A9187'
  const statusColor = STATUS_COLORS[project.status] ?? '#9A9187'

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-xs text-muted mb-4"
        style={{ minHeight: 44 }}
      >
        ← Projects
      </button>

      {/* Project header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h1 className="font-header text-2xl text-ink leading-tight flex-1">{project.name}</h1>
          <button
            onClick={() => setEditOpen(true)}
            className="font-mono text-xs text-muted border border-border rounded-lg px-3 py-1.5 flex-shrink-0"
            style={{ minHeight: 36 }}
          >
            Edit
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span
            className="font-mono text-xs px-2 py-0.5 rounded-full"
            style={{ color: domainColor, background: domainColor + '1A', border: `1px solid ${domainColor}33` }}
          >
            {project.domain}
          </span>
          <span
            className="font-mono text-xs px-2 py-0.5 rounded-full capitalize"
            style={{ color: statusColor, background: statusColor + '1A', border: `1px solid ${statusColor}33` }}
          >
            {project.status}
          </span>
        </div>

        {project.goal && (
          <p className="font-task text-base text-muted italic leading-relaxed">{project.goal}</p>
        )}
      </div>

      {/* Quick actions */}
      {project.status !== 'complete' && project.status !== 'archived' && (
        <div className="flex gap-2 mb-6">
          {project.status !== 'complete' && (
            <button
              onClick={() => handleStatusChange('complete')}
              disabled={actionLoading}
              className="font-mono text-xs border border-border rounded-lg px-3 py-1.5 text-muted"
              style={{ minHeight: 36 }}
            >
              Mark complete
            </button>
          )}
          {project.status === 'active' && (
            <button
              onClick={() => handleStatusChange('waiting')}
              disabled={actionLoading}
              className="font-mono text-xs border border-border rounded-lg px-3 py-1.5 text-muted"
              style={{ minHeight: 36 }}
            >
              Set waiting
            </button>
          )}
          {project.status === 'waiting' && (
            <button
              onClick={() => handleStatusChange('active')}
              disabled={actionLoading}
              className="font-mono text-xs border border-border rounded-lg px-3 py-1.5 text-muted"
              style={{ minHeight: 36 }}
            >
              Resume
            </button>
          )}
          <button
            onClick={() => handleStatusChange('archived')}
            disabled={actionLoading}
            className="font-mono text-xs border border-border rounded-lg px-3 py-1.5 text-muted"
            style={{ minHeight: 36 }}
          >
            Archive
          </button>
        </div>
      )}

      {/* Task list */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          Tasks ({tasks.length})
        </h2>
        <button
          onClick={handleAddTask}
          className="font-mono text-xs text-ink border border-border rounded-lg px-3 py-1.5"
          style={{ minHeight: 36 }}
        >
          + Add task
        </button>
      </div>

      {loading && <p className="font-task text-muted text-base">Loading…</p>}

      {!loading && tasks.length === 0 && (
        <p className="font-task text-muted text-base">No open tasks.</p>
      )}

      {tasks.map(task => {
        const blockers = deps[task.id]
        return (
          <div key={task.id}>
            <TaskRow
              task={task}
              showDomain={false}
              onComplete={handleComplete}
              onUndo={handleUndo}
            />
            {blockers?.length > 0 && (
              <div className="pl-9 mb-1">
                <button
                  onClick={() => setExpandedDep(expandedDep === task.id ? null : task.id)}
                  className="font-mono text-xs py-1"
                  style={{ color: '#C49A45', minHeight: 36 }}
                >
                  ⧗ Blocked by {blockers.length} task{blockers.length > 1 ? 's' : ''}
                </button>
                {expandedDep === task.id && (
                  <div className="mt-1 space-y-1 pb-2">
                    {blockers.map(b => b && (
                      <div
                        key={b.id}
                        className="font-task text-sm text-muted pl-2 border-l-2"
                        style={{ borderColor: '#2A2824' }}
                      >
                        {b.title}
                        {b.status === 'done' && (
                          <span className="font-mono text-xs ml-2" style={{ color: '#7EA87E' }}>done</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      <ProjectModal
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => { setProject(updated); onProjectUpdated?.(updated) }}
      />
    </div>
  )
}
