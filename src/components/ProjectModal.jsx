import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { DOMAIN_VALUES, DOMAIN_DISPLAY_LABEL, DOMAINS } from '../lib/domains'
import Icon from './Icon'

const COLOR = {
  ink:    '#1F1D18',
  ink2:   '#5C5448',
  ink3:   '#948A78',
  linen:  '#F2EDE3',
  paper:  '#FAF6EC',
  rule:   '#D9CFB8',
  ruleSoft: '#E5DCC6',
  rubric: '#8E3A1A',
}
const SCRIM = 'rgba(31,29,24,0.32)'

const STATUSES = ['active', 'waiting', 'complete', 'archived']

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
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'flex-end',
        background: SCRIM,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          background: COLOR.linen,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          maxHeight: '90dvh',
          overflowY: 'auto',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
          <span style={{ width: 36, height: 4, borderRadius: 2, background: COLOR.rule }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px 10px',
          borderBottom: `0.5px solid ${COLOR.rule}`,
        }}>
          <span style={{
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 12, fontWeight: 600,
            color: COLOR.ink3,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            {project ? 'Edit project' : 'New project'}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 0, padding: 4, cursor: 'pointer', color: COLOR.ink3, display: 'inline-flex' }}
          >
            <Icon name="x" size={18} sw={1.6} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Name */}
          <div>
            <input
              ref={nameRef}
              type="text"
              placeholder="Project name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 0,
                borderBottom: `1px solid ${COLOR.rule}`,
                padding: '8px 0',
                fontFamily: 'Newsreader, serif',
                fontSize: 22,
                fontWeight: 500,
                color: COLOR.ink,
                outline: 'none',
              }}
            />
            {error && (
              <p style={{
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                fontSize: 11, color: COLOR.rubric,
                margin: '6px 0 0',
              }}>{error}</p>
            )}
          </div>

          {/* Goal */}
          <Field label="Goal — what done looks like">
            <textarea
              placeholder="What does success look like?"
              value={form.goal}
              onChange={(e) => set('goal', e.target.value)}
              rows={2}
              style={textareaStyle}
            />
          </Field>

          {/* Description */}
          <Field label="Description (optional)">
            <textarea
              placeholder="Context, notes…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              style={textareaStyle}
            />
          </Field>

          {/* Domain */}
          <Field label="Domain">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DOMAIN_VALUES.map((d) => {
                const selected = form.domain === d
                const c = DOMAINS[d]?.color ?? COLOR.ink3
                return (
                  <button
                    key={d}
                    onClick={() => set('domain', d)}
                    style={{
                      padding: '6px 12px',
                      minHeight: 32,
                      borderRadius: 15,
                      background: selected ? c + '22' : 'transparent',
                      border: `1px solid ${selected ? c : COLOR.rule}`,
                      color: selected ? c : COLOR.ink3,
                      fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                      fontSize: 11, fontWeight: 600,
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    {DOMAIN_DISPLAY_LABEL[d] ?? d}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Status */}
          <Field label="Status">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {STATUSES.map((s) => {
                const selected = form.status === s
                return (
                  <button
                    key={s}
                    onClick={() => set('status', s)}
                    style={{
                      padding: '6px 12px',
                      minHeight: 32,
                      borderRadius: 8,
                      background: selected ? COLOR.ink : 'transparent',
                      border: `1px solid ${selected ? COLOR.ink : COLOR.rule}`,
                      color: selected ? COLOR.paper : COLOR.ink3,
                      fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                      fontSize: 11, fontWeight: 600,
                      letterSpacing: '0.05em', textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Submit */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px',
              marginTop: 4,
              border: 0,
              borderRadius: 15,
              background: COLOR.ink,
              color: COLOR.paper,
              fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              cursor: saving ? 'wait' : 'pointer',
              opacity: saving ? 0.6 : 1,
              minHeight: 48,
            }}
          >
            {saving ? 'Saving…' : project ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 10,
        color: COLOR.ink3,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        fontWeight: 600,
        marginBottom: 8,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

const textareaStyle = {
  width: '100%',
  background: COLOR.paper,
  border: `1px solid ${COLOR.rule}`,
  borderRadius: 6,
  padding: '10px 12px',
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  fontSize: 14,
  color: COLOR.ink,
  outline: 'none',
  resize: 'vertical',
  minHeight: 60,
}
