import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { DOMAIN_VALUES as DOMAINS, DOMAIN_DISPLAY_LABEL } from '../lib/domains'
import Icon from './Icon'

const STATUSES = ['active', 'waiting', 'complete', 'archived']

const DOMAIN_COLORS = {
  spirit: '#C4A962',
  body:   '#7EA87E',
  work:   '#6B8CAE',
  wealth: '#C49A45',
  family: '#B8848A',
}

const empty = { name: '', description: '', domain: 'work', goal: '', status: 'active' }

export default function ProjectModal({ open, project, onClose, onSaved }) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const nameRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setForm(project
      ? { name: project.name, description: project.description ?? '', domain: project.domain, goal: project.goal ?? '', status: project.status }
      : empty
    )
    setError(null)
    setTimeout(() => nameRef.current?.focus(), 50)
  }, [open, project])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Name is required.')
      nameRef.current?.focus()
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      name:        form.name.trim(),
      description: form.description.trim() || null,
      domain:      form.domain,
      goal:        form.goal.trim() || null,
      status:      form.status,
    }

    let result
    if (project?.id) {
      result = await supabase.schema('quill').from('projects').update(payload).eq('id', project.id).select().single()
    } else {
      result = await supabase.schema('quill').from('projects').insert(payload).select().single()
    }

    setSaving(false)
    if (result.error) { setError(result.error.message); return }
    onSaved?.(result.data, project ? 'update' : 'create')
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full rounded-t-2xl overflow-y-auto"
        style={{ background: '#161513', borderTop: '1px solid #2A2824', maxHeight: '90dvh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <h2 className="font-header text-xl text-ink">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="text-ink-3 w-11 h-11 flex items-center justify-center" aria-label="Close"><Icon name="x" size={20} /></button>
        </div>

        <div className="px-4 py-4 space-y-4 pb-10">
          {/* Name */}
          <div>
            <input
              ref={nameRef}
              type="text"
              placeholder="Project name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full bg-transparent text-ink font-task text-xl placeholder-muted border-b border-border py-2 outline-none focus:border-ink transition-colors"
            />
            {error && <p className="font-mono text-xs mt-1" style={{ color: '#B8848A' }}>{error}</p>}
          </div>

          {/* Goal */}
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-2">Goal — what done looks like</label>
            <textarea
              placeholder="What does success look like?"
              value={form.goal}
              onChange={e => set('goal', e.target.value)}
              rows={2}
              className="w-full bg-transparent text-ink font-task text-base placeholder-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-ink resize-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-2">Description (optional)</label>
            <textarea
              placeholder="Context, notes…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              className="w-full bg-transparent text-ink font-task text-base placeholder-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-ink resize-none"
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
                  {DOMAIN_DISPLAY_LABEL[d] ?? d}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-2">Status</label>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => set('status', s)}
                  className="px-3 py-1.5 rounded-lg font-mono text-xs capitalize transition-all"
                  style={{
                    background: form.status === s ? '#2A2824' : 'transparent',
                    border: `1px solid ${form.status === s ? '#9A9187' : '#2A2824'}`,
                    color: form.status === s ? '#E8E2D9' : '#9A9187',
                    minHeight: 36,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl font-mono text-sm uppercase tracking-wide"
            style={{ background: '#E8E2D9', color: '#0E0D0B', minHeight: 52, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : project ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
