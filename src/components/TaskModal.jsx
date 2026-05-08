import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useModal } from '../context/ModalContext'
import { useProjects } from '../hooks/useProjects'

const DOMAINS = ['Spirit', 'Body', 'Project', 'Wealth', 'Family']
const PRIORITIES = ['urgent', 'high', 'normal', 'low']
const RRULE_OPTIONS = [
  { label: 'Daily',   value: 'FREQ=DAILY' },
  { label: 'Weekly',  value: 'FREQ=WEEKLY' },
  { label: 'Monthly', value: 'FREQ=MONTHLY' },
]

const DOMAIN_COLORS = {
  Spirit:  '#C4A962',
  Body:    '#7EA87E',
  Project: '#6B8CAE',
  Wealth:  '#C49A45',
  Family:  '#B8848A',
}

const empty = {
  title:         '',
  notes:         '',
  domain:        'Spirit',
  project_id:    null,
  priority:      'normal',
  schedule_date: '',
  due_date:      '',
  is_recurring:  false,
  rrule:         '',
}

export default function TaskModal({ onSaved }) {
  const { modalState, closeTaskModal } = useModal()
  const { open, task } = modalState
  const projects = useProjects()

  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const titleRef = useRef(null)

  useEffect(() => {
    if (!open) return
    if (task) {
      setForm({
        title:         task.title ?? '',
        notes:         task.notes ?? '',
        domain:        task.domain ?? 'Spirit',
        project_id:    task.project_id ?? null,
        priority:      task.priority ?? 'normal',
        schedule_date: task.schedule_date ?? '',
        due_date:      task.due_date ?? '',
        is_recurring:  task.is_recurring ?? false,
        rrule:         task.rrule ?? '',
      })
    } else {
      setForm(empty)
    }
    setError(null)
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [open, task])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('Title is required.')
      titleRef.current?.focus()
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      title:         form.title.trim(),
      notes:         form.notes.trim() || null,
      domain:        form.domain,
      project_id:    form.domain === 'Project' ? (form.project_id || null) : null,
      priority:      form.priority,
      schedule_date: form.schedule_date || null,
      due_date:      form.due_date || null,
      is_recurring:  form.is_recurring,
      rrule:         form.is_recurring ? form.rrule : null,
    }

    let result
    if (task?.id) {
      result = await supabase.schema('quill').from('tasks').update(payload).eq('id', task.id).select().single()
    } else {
      result = await supabase.schema('quill').from('tasks').insert({ ...payload, status: 'open' }).select().single()
    }

    setSaving(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    onSaved?.(result.data, task ? 'update' : 'create')
    closeTaskModal()
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) closeTaskModal()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full rounded-t-2xl overflow-y-auto"
        style={{
          background: '#161513',
          borderTop: '1px solid #2A2824',
          maxHeight: '92dvh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <h2 className="font-header text-xl text-ink">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={closeTaskModal}
            className="text-muted w-11 h-11 flex items-center justify-center text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-4 space-y-4 pb-10">
          {/* Title */}
          <div>
            <input
              ref={titleRef}
              type="text"
              placeholder="Task title"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full bg-transparent text-ink font-task text-xl placeholder-muted border-b border-border py-2 outline-none focus:border-ink transition-colors"
            />
            {error && <p className="font-mono text-xs mt-1" style={{ color: '#B8848A' }}>{error}</p>}
          </div>

          {/* Notes */}
          <div>
            <textarea
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              className="w-full bg-transparent text-ink font-task text-base placeholder-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-ink transition-colors resize-none"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-2">Domain</label>
            <div className="flex gap-2 flex-wrap">
              {DOMAINS.map(d => (
                <button
                  key={d}
                  onClick={() => set('domain', d)}
                  className="px-3 py-1.5 rounded-full font-mono text-xs transition-all"
                  style={{
                    background: form.domain === d ? DOMAIN_COLORS[d] + '33' : 'transparent',
                    border: `1px solid ${form.domain === d ? DOMAIN_COLORS[d] : '#2A2824'}`,
                    color: form.domain === d ? DOMAIN_COLORS[d] : '#9A9187',
                    minHeight: 36,
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Project selector — only when domain = Project */}
          {form.domain === 'Project' && (
            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-2">Project</label>
              <select
                value={form.project_id ?? ''}
                onChange={e => set('project_id', e.target.value || null)}
                className="w-full bg-transparent text-ink font-task border border-border rounded-lg px-3 py-2 outline-none"
                style={{ minHeight: 44 }}
              >
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-2">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  onClick={() => set('priority', p)}
                  className="flex-1 py-2 rounded-lg font-mono text-xs capitalize transition-all"
                  style={{
                    background: form.priority === p ? '#2A2824' : 'transparent',
                    border: `1px solid ${form.priority === p ? '#9A9187' : '#2A2824'}`,
                    color: form.priority === p ? '#E8E2D9' : '#9A9187',
                    minHeight: 44,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-2">Schedule</label>
              <input
                type="date"
                value={form.schedule_date}
                onChange={e => set('schedule_date', e.target.value)}
                className="w-full bg-transparent text-ink font-mono text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-ink"
                style={{ minHeight: 44, colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-2">Due</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => set('due_date', e.target.value)}
                className="w-full bg-transparent text-ink font-mono text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-ink"
                style={{ minHeight: 44, colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Recurring */}
          <div>
            <div className="flex items-center justify-between py-2">
              <label className="font-mono text-xs text-muted uppercase tracking-wide">Recurring</label>
              <button
                onClick={() => set('is_recurring', !form.is_recurring)}
                className="relative inline-flex items-center rounded-full transition-colors"
                style={{
                  width: 44,
                  height: 26,
                  background: form.is_recurring ? '#C4A962' : '#2A2824',
                  minHeight: 44,
                }}
                aria-checked={form.is_recurring}
                role="switch"
              >
                <span
                  className="inline-block rounded-full bg-white transition-transform"
                  style={{
                    width: 20,
                    height: 20,
                    transform: form.is_recurring ? 'translateX(20px)' : 'translateX(2px)',
                  }}
                />
              </button>
            </div>
            {form.is_recurring && (
              <div className="flex gap-2 mt-2">
                {RRULE_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => set('rrule', value)}
                    className="flex-1 py-2 rounded-lg font-mono text-xs transition-all"
                    style={{
                      background: form.rrule === value ? '#2A2824' : 'transparent',
                      border: `1px solid ${form.rrule === value ? '#9A9187' : '#2A2824'}`,
                      color: form.rrule === value ? '#E8E2D9' : '#9A9187',
                      minHeight: 44,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl font-mono text-sm uppercase tracking-wide transition-opacity"
            style={{
              background: '#E8E2D9',
              color: '#0E0D0B',
              minHeight: 52,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : task ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
