import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DOMAIN_ORDER, DOMAINS } from '../lib/domains';
import ViewHeader from '../components/ViewHeader';
import FilterChip from '../components/FilterChip';
import DomainChip from '../components/DomainChip';
import ProjectCard from '../components/ProjectCard';
import ProjectDetail from '../components/ProjectDetail';
import AddTaskFAB from '../components/AddTaskFAB';

export default function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [countsByProject, setCountsByProject] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('active');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const projRes = await supabase
      .schema('quill')
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });
    const projectsData = projRes.data ?? [];

    const [tasksRes, readyRes, blockedRes] = await Promise.all([
      supabase.schema('quill').from('tasks').select('id, project_id, status'),
      supabase.schema('quill').from('tasks_ready').select('id, project_id'),
      supabase.schema('quill').from('tasks_blocked').select('id, project_id'),
    ]);
    const tasks = tasksRes.data ?? [];
    const readyIds = new Set((readyRes.data ?? []).map((r) => r.id));
    const blockedIds = new Set((blockedRes.data ?? []).map((r) => r.id));

    const counts = {};
    for (const p of projectsData) {
      counts[p.id] = { done: 0, ready: 0, blocked: 0, open: 0, total: 0 };
    }
    for (const t of tasks) {
      if (!t.project_id || !counts[t.project_id]) continue;
      counts[t.project_id].total++;
      if (t.status === 'done') {
        counts[t.project_id].done++;
      } else if (t.status === 'open') {
        counts[t.project_id].open++;
        if (readyIds.has(t.id)) counts[t.project_id].ready++;
        else if (blockedIds.has(t.id)) counts[t.project_id].blocked++;
      }
    }

    setProjects(projectsData);
    setCountsByProject(counts);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const selectedProject = selectedId ? projects.find((p) => p.id === selectedId) : null;

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => { setSelectedId(null); fetchAll(); }}
        onProjectUpdated={fetchAll}
      />
    );
  }

  const visible = projects.filter((p) => {
    if (filter === 'active') return p.status === 'active';
    if (filter === 'someday') return p.status === 'waiting';
    if (DOMAINS[filter]) return p.domain === filter && p.status === 'active';
    return true;
  });

  return (
    <div style={{ paddingBottom: 96 }}>
      <ViewHeader
        kicker="THE LEDGER"
        title="Projects"
        dropCap="P"
        count={visible.length}
      />

      <div style={{
        padding: '0 16px 12px',
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
      }}>
        <FilterChip active={filter === 'active'} onPress={() => setFilter('active')}>Active</FilterChip>
        <FilterChip active={filter === 'someday'} onPress={() => setFilter('someday')}>Someday</FilterChip>
        {DOMAIN_ORDER.map((d) => (
          <DomainChip
            key={d}
            domain={d}
            onPress={() => setFilter(d)}
            active={filter === d}
          />
        ))}
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && (
          <div style={{
            padding: '40px 0',
            textAlign: 'center',
            fontFamily: 'Newsreader, serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: '#948A78',
          }}>Loading…</div>
        )}
        {!loading && visible.length === 0 && (
          <div style={{
            padding: '40px 0',
            textAlign: 'center',
            fontFamily: 'Newsreader, serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: '#948A78',
          }}>
            No projects in this view.
          </div>
        )}
        {visible.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            counts={countsByProject[p.id]}
            onPress={() => setSelectedId(p.id)}
          />
        ))}
      </div>

      <AddTaskFAB onSaved={fetchAll} />
    </div>
  );
}
