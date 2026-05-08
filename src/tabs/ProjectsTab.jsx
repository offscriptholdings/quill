import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import ProjectDetail from '../components/ProjectDetail'
import ProjectModal from '../components/ProjectModal'

const DOMAIN_ORDER = ['Spirit', 'Body', 'Project', 'Wealth', 'Family']

const DOMAIN_COLORS = {
  Spirit:  '#C4A962',
  Body:    '#7EA87E',
  Project: '#6B8CAE',
  Wealth:  '#C49A45',
  Family:  '#B8848A',
}

const STATUS_COLORS = {
  active:   '#7EA87E',
  waiting:  '#C49A45',
  complete: '#6B8CAE',
  archived: '#9A9187',
}

const STATUS_FILTERS = ['active', 'waiting', 'complete', 'archived']

export default function ProjectsTab() {
  const [projects, setProjects] = useState([])
  const [taskCounts, setTaskCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(['active', 'waiting'])
  const [selectedProject, setSelectedProject] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)

  const fetchProjects = useCallback(async () => {
    const [projRes, countRes] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .order('name'),
      supabase
        .from('tasks')
        .select('project_id')
        .eq('status', 'open')
        .not('project_id', 'is', null),
    ])

    if (projRes.data) setProjects(projRes.data)

    if (countRes.data) {
      const counts = {}
      for (const t of countRes.data) {
        counts[t.project_id] = (counts[t.project_id] ?? 0) + 1
      }
      setTaskCounts(counts)
    }

    setLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const filtered = projects.filter(p => statusFilter.includes(p.status))

  const grouped = DOMAIN_ORDER.reduce((acc, domain) => {
    const g = filtered.filter(p => p.domain === domain)
    if (g.length > 0) acc.push({ domain, projects: g })
    return acc
  }, [])

  function toggleStatusFilter(s) {
    setStatusFilter(prev => prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s])
  }

  function handleProjectSaved(project, mode) {
    if (mode === 'create') {
      setProjects(prev => [...prev, project].sort((a, b) => a.name.localeCompare(b.name)))
    } else {
      setProjects(prev => prev.map(p => p.id === project.id ? project : p))
      if (selectedProject?.id === project.id) setSelectedProject(project)
    }
  }

  // Detail view
  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onProjectUpdated={updated => {
          setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
          setSelectedProject(updated)
        }}
      />
    )
  }

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-header text-2xl text-ink">Projects</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="font-mono text-xs text-ink border border-border rounded-lg px-3 py-1.5"
          style={{ minHeight: 36 }}
        >
          + New
        </button>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => toggleStatusFilter(s)}
            className="px-3 py-1 rounded-full font-mono text-xs capitalize transition-all"
            style={{
              background: statusFilter.includes(s) ? STATUS_COLORS[s] + '33' : 'transparent',
              border: `1px solid ${statusFilter.includes(s) ? STATUS_COLORS[s] : 'rgba(255,255,255,0.08)'}`,
              color: statusFilter.includes(s) ? STATUS_COLORS[s] : '#9A9187',
              minHeight: 32,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p className="font-task text-muted text-base">Loading…</p>}

      {!loading && filtered.length === 0 && (
        <p className="font-task text-muted text-base">No projects.</p>
      )}

      {/* Domain groups */}
      {grouped.map(({ domain, projects: domainProjects }) => (
        <div key={domain} className="mb-6">
          <h2
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: DOMAIN_COLORS[domain] }}
          >
            {domain}
          </h2>
          {domainProjects.map(p => {
            const openCount = taskCounts[p.id] ?? 0
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className="w-full text-left border border-border rounded-xl p-4 mb-2 transition-colors active:bg-border"
                style={{ minHeight: 72 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-task text-base text-ink leading-tight">{p.name}</span>
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                        style={{
                          color: STATUS_COLORS[p.status] ?? '#9A9187',
                          background: (STATUS_COLORS[p.status] ?? '#9A9187') + '1A',
                          border: `1px solid ${(STATUS_COLORS[p.status] ?? '#9A9187')}33`,
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                    {p.goal && (
                      <p className="font-task text-sm text-muted leading-snug line-clamp-2">{p.goal}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    {openCount > 0 && (
                      <span className="font-mono text-xs text-muted">{openCount} open</span>
                    )}
                    <span className="text-muted text-lg mt-1">›</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      ))}

      <ProjectModal
        open={createOpen}
        project={null}
        onClose={() => setCreateOpen(false)}
        onSaved={handleProjectSaved}
      />
    </div>
  )
}
