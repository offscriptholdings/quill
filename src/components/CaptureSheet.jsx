import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useModal } from '../context/ModalContext'
import { useToast } from '../context/ToastContext'
import { parseInput } from '../lib/parser'
import { DOMAIN_ORDER, DOMAIN_DISPLAY_LABEL } from '../lib/domains'
import { localTodayIso, addDaysIso } from '../lib/date'
import Icon from './Icon'
import DomainChip from './DomainChip'

function formatDestination(task) {
  const domainLabel = DOMAIN_DISPLAY_LABEL[task?.domain] ?? task?.domain ?? '—'
  let when
  if (task?.schedule_date) {
    const today = localTodayIso()
    const tomorrow = addDaysIso(today, 1)
    if (task.schedule_date === today) when = 'Today'
    else if (task.schedule_date === tomorrow) when = 'Tomorrow'
    else {
      const d = new Date(`${task.schedule_date}T12:00:00`)
      when = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  } else if (task?.due_date) {
    const d = new Date(`${task.due_date}T12:00:00`)
    when = `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  } else {
    when = 'Someday'
  }
  return `${domainLabel} · ${when}`
}

const COLOR = {
  ink: '#1F1D18',
  ink2: '#5C5448',
  ink3: '#948A78',
  linen: '#F2EDE3',
  paper: '#FAF6EC',
  rule: '#D9CFB8',
  ruleSoft: '#E5DCC6',
  rubric: '#8E3A1A',
  gold: '#B8893A',
}
const SCRIM = 'rgba(31,29,24,0.32)'

export default function CaptureSheet() {
  const { modalState, closeTaskModal } = useModal()
  const { showToast } = useToast()
  const open = modalState.open
  const editing = !!modalState.task?.id
  const defaults = modalState.task ?? {}
  const isCrucible = !!modalState.task?._crucible
  const crucibleData = modalState.task?._crucible

  const [title, setTitle] = useState('')
  const [parseResult, setParseResult] = useState({ cleanedTitle: '', tokens: [], resolved: {} })
  const [projectId, setProjectId] = useState(null)
  const [projectName, setProjectName] = useState(null)
  const [domain, setDomain] = useState('spirit')
  const [priority, setPriority] = useState(1)
  const [scheduleDate, setScheduleDate] = useState(null)
  const [scheduledTime, setScheduledTime] = useState(null)
  const [waitsOn, setWaitsOn] = useState(null)
  const [recents, setRecents] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [allProjects, setAllProjects] = useState([])
  const [openTasks, setOpenTasks] = useState([])
  const [domainPickerOpen, setDomainPickerOpen] = useState(false)
  const [kind, setKind] = useState('task')
  const [location, setLocation] = useState('')

  const sheetRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const t = modalState.task ?? {}
    setTitle(t.title ?? '')
    setProjectId(t.project_id ?? null)
    setProjectName(t.projects?.name ?? null)
    setDomain(t.domain ?? defaults.domain ?? 'spirit')
    setPriority(t.priority ?? 1)
    setScheduleDate(t.schedule_date ?? defaults.schedule_date ?? null)
    setScheduledTime(null)
    setWaitsOn(null)
    setSubmitting(false)
    setParseResult({ cleanedTitle: '', tokens: [], resolved: {} })
    setKind(t.kind ?? 'task')
    setLocation(t.location ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, modalState.task])

  useEffect(() => {
    if (!open) return
    ;(async () => {
      const [recRes, projRes, openRes] = await Promise.all([
        supabase
          .schema('quill')
          .from('tasks')
          .select('id, title')
          .eq('status', 'done')
          .order('completed_at', { ascending: false })
          .limit(3),
        supabase.schema('quill').from('projects').select('id, name, domain').eq('status', 'active'),
        supabase.schema('quill').from('tasks').select('id, title').eq('status', 'open').limit(50),
      ])
      setRecents(recRes.data ?? [])
      setAllProjects(projRes.data ?? [])
      setOpenTasks(openRes.data ?? [])
    })()
  }, [open])

  useEffect(() => {
    const r = parseInput(title)
    setParseResult(r)
    if (r.resolved.domain) setDomain(r.resolved.domain)
    if (r.resolved.priority) setPriority(r.resolved.priority)
    if (r.resolved.scheduled) setScheduleDate(r.resolved.scheduled)
    if (r.resolved.scheduledTime) setScheduledTime(r.resolved.scheduledTime)
    if (r.resolved.projectQuery) {
      const hit = fuzzyFind(allProjects, r.resolved.projectQuery, (p) => p.name)
      if (hit) {
        setProjectId(hit.id)
        setProjectName(hit.name)
        if (hit.domain) setDomain(hit.domain)
      }
    }
    if (r.resolved.waitsOnQuery) {
      const hit = fuzzyFind(openTasks, r.resolved.waitsOnQuery, (t) => t.title)
      if (hit) setWaitsOn(hit)
    }
  }, [title, allProjects, openTasks])

  const isTimed = kind === 'meeting' || kind === 'appointment'

  const handleSubmit = useCallback(async () => {
    const finalTitle = (parseResult.cleanedTitle || title).trim()
    if (!finalTitle) return
    if (isCrucible && (!domain || !scheduleDate)) return
    if (isTimed && (!scheduleDate || !scheduledTime)) return
    setSubmitting(true)
    const payload = {
      title: finalTitle,
      domain,
      priority,
      kind,
      schedule_date: scheduleDate,
      scheduled:
        scheduleDate && scheduledTime
          ? new Date(`${scheduleDate}T${scheduledTime}:00`).toISOString()
          : null,
      project_id: projectId,
      source: isCrucible ? 'crucible' : 'manual',
      status: 'open',
    }
    payload.location = isTimed && location.trim() ? location.trim() : null
    let savedRow
    if (editing) {
      const { data } = await supabase
        .schema('quill')
        .from('tasks')
        .update(payload)
        .eq('id', modalState.task.id)
        .select()
        .single()
      savedRow = data
    } else {
      const { data } = await supabase
        .schema('quill')
        .from('tasks')
        .insert(payload)
        .select()
        .single()
      savedRow = data
    }
    if (waitsOn && savedRow && !editing) {
      const { error: depErr } = await supabase.schema('quill').from('dependencies').insert({
        task_id: savedRow.id,
        depends_on_task_id: waitsOn.id,
      })
      if (depErr && depErr.code !== '23505') {
        console.warn('waits-on link failed', depErr)
      }
    }
    if (isCrucible && savedRow) {
      await supabase
        .schema('quill')
        .from('inbox')
        .update({
          triaged_at: new Date().toISOString(),
          task_id: savedRow.id,
        })
        .eq('id', crucibleData.inbox_id)
    }
    modalState.onSaved?.(savedRow, editing ? 'update' : 'create')
    if (savedRow && !isCrucible) {
      const verb = editing ? 'Updated' : 'Captured'
      showToast({ message: `${verb} → ${formatDestination(savedRow)}` })
    }
    closeTaskModal()
  }, [
    title,
    parseResult,
    domain,
    priority,
    scheduleDate,
    scheduledTime,
    projectId,
    waitsOn,
    editing,
    isCrucible,
    crucibleData,
    modalState,
    closeTaskModal,
    kind,
    location,
    isTimed,
    showToast,
  ])

  const handleSkip = useCallback(async () => {
    if (!isCrucible || !crucibleData) return
    setSubmitting(true)
    await supabase
      .schema('quill')
      .from('inbox')
      .update({
        triaged_at: new Date().toISOString(),
        task_id: null,
      })
      .eq('id', crucibleData.inbox_id)
    modalState.onSaved?.(null, 'skip')
    closeTaskModal()
  }, [isCrucible, crucibleData, modalState, closeTaskModal])

  if (!open) return null

  return (
    <>
      <div
        onClick={closeTaskModal}
        style={{
          position: 'fixed',
          inset: 0,
          background: SCRIM,
          zIndex: 50,
          animation: 'fadeIn 240ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
        }}
      />
      <div
        ref={sheetRef}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 51,
          background: COLOR.linen,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          boxShadow: '0 -8px 32px rgba(31,29,24,0.18), 0 -1px 0 rgba(0,0,0,0.04)',
          padding: '8px 16px calc(24px + env(safe-area-inset-bottom))',
          animation: 'slideUp 240ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 10px' }}>
          <span style={{ width: 36, height: 4, borderRadius: 2, background: COLOR.rule }} />
        </div>
        {isCrucible && (
          <>
            <div
              style={{
                margin: '-8px -16px 12px',
                padding: '10px 16px',
                background: COLOR.gold,
                color: COLOR.linen,
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span>FROM CRUCIBLE</span>
              <span style={{ flex: 1 }} />
              {crucibleData?.counter && (
                <span style={{ opacity: 0.8 }}>
                  {crucibleData.counter.n} OF {crucibleData.counter.total}
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: 'Newsreader, serif',
                fontStyle: 'italic',
                fontSize: 16,
                color: COLOR.ink2,
                borderLeft: '2px solid ' + COLOR.rubric,
                paddingLeft: 10,
                margin: '0 0 14px',
              }}
            >
              {extractCapturedText(crucibleData?.payload)}
            </div>
          </>
        )}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <span
            style={{
              fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
              fontSize: 12,
              fontWeight: 600,
              color: COLOR.ink3,
              letterSpacing: '0.08em',
            }}
          >
            {isCrucible ? 'TRIAGE' : editing ? 'EDIT' : 'CAPTURE'}
          </span>
          <span style={{ flex: 1 }} />
          {isCrucible ? (
            <button onClick={handleSkip} disabled={submitting} style={btnTextStyle(COLOR.ink3)}>
              Skip
            </button>
          ) : (
            <button onClick={closeTaskModal} style={btnTextStyle(COLOR.ink3)}>
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !title.trim() ||
              (isCrucible && (!domain || !scheduleDate)) ||
              (isTimed && (!scheduleDate || !scheduledTime))
            }
            style={{
              ...btnPillStyle(COLOR.ink, COLOR.linen),
              opacity:
                submitting ||
                !title.trim() ||
                (isCrucible && (!domain || !scheduleDate)) ||
                (isTimed && (!scheduleDate || !scheduledTime))
                  ? 0.5
                  : 1,
            }}
          >
            {editing ? 'Save' : 'Inscribe'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[
            { value: 'task', label: 'Task' },
            { value: 'meeting', label: 'Meeting' },
            { value: 'appointment', label: 'Appointment' },
          ].map((opt) => {
            const selected = kind === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setKind(opt.value)}
                style={{
                  padding: '4px 12px',
                  height: 26,
                  borderRadius: 15,
                  background: selected ? COLOR.ink : COLOR.paper,
                  color: selected ? COLOR.linen : COLOR.ink,
                  boxShadow: selected ? 'none' : `inset 0 0 0 0.5px ${COLOR.rule}`,
                  border: 0,
                  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        <textarea
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's next?"
          style={{
            width: '100%',
            minHeight: 80,
            background: 'transparent',
            border: 0,
            outline: 'none',
            resize: 'none',
            fontFamily: 'Newsreader, serif',
            fontSize: 20,
            lineHeight: '28px',
            color: COLOR.ink,
            fontStyle: title ? 'normal' : 'italic',
          }}
        />
        {isTimed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0 10px' }}>
            <span style={{
              fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
              fontSize: 10, fontWeight: 600, color: COLOR.ink3,
              letterSpacing: '0.07em', textTransform: 'uppercase',
            }}>
              Time
            </span>
            <input
              type="time"
              value={scheduledTime ?? ''}
              onChange={(e) => setScheduledTime(e.target.value || null)}
              disabled={!scheduleDate}
              style={{
                width: 140,
                padding: '6px 10px',
                border: `0.5px solid ${COLOR.rule}`,
                borderRadius: 3,
                background: scheduleDate ? COLOR.paper : COLOR.linen,
                color: scheduleDate ? COLOR.ink : COLOR.ink3,
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              style={{
                width: '100%',
                marginTop: 4,
                padding: '6px 10px',
                border: `0.5px solid ${COLOR.rule}`,
                borderRadius: 3,
                background: COLOR.paper,
                color: COLOR.ink,
                fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
        )}
        {(projectName || domain || scheduleDate || priority > 0 || waitsOn) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 0' }}>
            {projectName && (
              <Chip
                onClear={() => {
                  setProjectId(null)
                  setProjectName(null)
                }}
              >
                @{projectName}
              </Chip>
            )}
            <DomainChip domain={domain} onPress={() => setDomainPickerOpen((v) => !v)} />
            {scheduleDate && (
              <Chip
                onClear={() => {
                  setScheduleDate(null)
                  setScheduledTime(null)
                }}
              >
                {scheduleDate}
                {scheduledTime ? ' ' + scheduledTime : ''}
              </Chip>
            )}
            {priority > 0 && (
              <Chip onClear={() => setPriority(0)}>{'!'.repeat(priority)}</Chip>
            )}
            {waitsOn && (
              <Chip onClear={() => setWaitsOn(null)}>^{waitsOn.title.slice(0, 24)}</Chip>
            )}
          </div>
        )}
        {domainPickerOpen && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 0 8px' }}>
            {DOMAIN_ORDER.map((d) => (
              <DomainChip
                key={d}
                domain={d}
                onPress={() => {
                  setDomain(d)
                  setDomainPickerOpen(false)
                }}
              />
            ))}
          </div>
        )}
        {!title && (
          <div style={{ padding: '10px 0', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <SyntaxHint>type</SyntaxHint>
            <SyntaxHint mono>@project</SyntaxHint>
            <SyntaxHint mono>#domain</SyntaxHint>
            <SyntaxHint mono>today</SyntaxHint>
            <SyntaxHint mono>!!</SyntaxHint>
            <SyntaxHint mono>^waits-on</SyntaxHint>
            <SyntaxHint>in title to auto-fill</SyntaxHint>
          </div>
        )}
        {!title && !editing && recents.length > 0 && (
          <div style={{ padding: '8px 0 0' }}>
            <div
              style={{
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                fontSize: 10,
                fontWeight: 600,
                color: COLOR.ink3,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Recents
            </div>
            {recents.map((r) => (
              <div
                key={r.id}
                style={{
                  fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                  fontSize: 10,
                  color: COLOR.ink3,
                  padding: '2px 0',
                }}
              >
                {r.title}
              </div>
            ))}
          </div>
        )}
        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        `}</style>
      </div>
    </>
  )
}

function Chip({ children, onClear }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        height: 26,
        borderRadius: 15,
        background: '#FAF6EC',
        boxShadow: 'inset 0 0 0 0.5px #D9CFB8',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        fontSize: 12,
        color: '#1F1D18',
      }}
    >
      {children}
      <button
        onClick={onClear}
        style={{
          background: 'none',
          border: 0,
          padding: 0,
          color: '#948A78',
          cursor: 'pointer',
          display: 'inline-flex',
        }}
      >
        <Icon name="x" size={10} sw={1.6} />
      </button>
    </span>
  )
}

function SyntaxHint({ children, mono = false }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: mono
          ? '"IBM Plex Mono", ui-monospace, monospace'
          : '"IBM Plex Sans", system-ui, sans-serif',
        fontSize: 10,
        color: '#948A78',
        letterSpacing: mono ? '0.04em' : 0,
        fontStyle: mono ? 'normal' : 'italic',
      }}
    >
      {children}
    </span>
  )
}

function btnTextStyle(color) {
  return {
    background: 'none',
    border: 0,
    padding: '8px 12px',
    cursor: 'pointer',
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    fontSize: 14,
    color,
  }
}
function btnPillStyle(bg, fg) {
  return {
    background: bg,
    color: fg,
    border: 0,
    borderRadius: 15,
    padding: '8px 14px',
    cursor: 'pointer',
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    fontSize: 13,
    fontWeight: 600,
  }
}

function fuzzyFind(items, query, getStr) {
  if (!query) return null
  const q = query.toLowerCase()
  const prefix = items.find((it) => getStr(it)?.toLowerCase().startsWith(q))
  if (prefix) return prefix
  return items.find((it) => getStr(it)?.toLowerCase().includes(q)) ?? null
}

function extractCapturedText(payload) {
  if (!payload) return ''
  if (typeof payload === 'string') return payload
  return payload.text ?? payload.title ?? payload.content ?? JSON.stringify(payload)
}
