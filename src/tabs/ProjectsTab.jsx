import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DOMAIN_ORDER, DOMAINS } from '../lib/domains';
import ViewHeader from '../components/ViewHeader';
import FilterChip from '../components/FilterChip';
import DomainChip from '../components/DomainChip';
import ProjectCard from '../components/ProjectCard';
import ProjectDetail from '../components/ProjectDetail';
import ProjectModal from '../components/ProjectModal';
import AddTaskFAB from '../components/AddTaskFAB';
import InlineError from '../components/InlineError';

const pillBtn = {
  display: 'inline-flex', alignItems: 'center',
  padding: '8px 14px', borderRadius: 15,
  background: 'transparent', boxShadow: 'inset 0 0 0 1px #8E3A1A',
  color: '#8E3A1A',
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  fontSize: 13, fontWeight: 600,
  border: 0, cursor: 'pointer',
};

export default function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [countsByProject, setCountsByProject] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('active');
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projRes = await supabase
        .schema('quill')
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });
      if (projRes.error) throw projRes.error;
      const projectsData = projRes.data ?? [];

      const [tasksRes, readyRes, blockedRes] = await Promise.all([
        supabase.schema('quill').from('tasks').select('id, project_id, status'),
        supabase.schema('quill').from('tasks_ready').select('id, project_id'),
        supabase.schema('quill').from('tasks_blocked').select('id, project_id'),
      ]);
      if (tasksRes.error) throw tasksRes.error;
      if (readyRes.error) throw readyRes.error;
      if (blockedRes.error) throw blockedRes.error;

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
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                background: '#FAF6EC', borderRadius: 4,
                boxShadow: 'inset 0 0 0 0.5px #D9CFB8', padding: '14px 14px 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 3, background: '#E5DCC6', animation: 'qPulse 1s ease-in-out infinite' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', width: '60%', height: 14, background: '#E5DCC6', borderRadius: 2, animation: 'qPulse 1s ease-in-out infinite' }} />
                    <span style={{ display: 'block', width: '30%', height: 8, background: '#EAE2CE', borderRadius: 2, marginTop: 6, animation: 'qPulse 1s ease-in-out infinite' }} />
                  </div>
                </div>
                <span style={{ display: 'block', marginTop: 14, height: 6, background: '#EAE2CE', borderRadius: 1, animation: 'qPulse 1s ease-in-out infinite' }} />
              </div>
            ))}
            <style>{`
              @keyframes qPulse {
                0%, 100% { opacity: 1 }
                50% { opacity: 0.5 }
              }
            `}</style>
          </div>
        )}
        {error && !loading && (
          <InlineError onRetry={fetchAll}>Failed to load projects.</InlineError>
        )}
        {!loading && !error && visible.length === 0 && (
          <div style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Newsreader, serif', fontSize: 18, lineHeight: '24px',
              color: '#5C5448', fontStyle: 'italic', marginBottom: 14,
            }}>
              No active projects.
            </div>
            <button onClick={() => setProjectModalOpen(true)} style={pillBtn}>
              + New Project
            </button>
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

      <ProjectModal
        open={projectModalOpen}
        project={null}
        onClose={() => setProjectModalOpen(false)}
        onSaved={() => { setProjectModalOpen(false); fetchAll(); }}
      />

      <AddTaskFAB onSaved={fetchAll} />
    </div>
  );
}
