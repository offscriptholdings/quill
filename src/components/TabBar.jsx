import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';

const COLOR = { ink: '#1F1D18', ink3: '#948A78', rule: '#D9CFB8', rubric: '#8E3A1A', linen: '#F2EDE3' };

const TABS = [
  { id: 'today',    label: 'Today',    icon: 'today',   path: '/today' },
  { id: 'projects', label: 'Projects', icon: 'list',    path: '/projects' },
  { id: 'someday',  label: 'Someday',  icon: 'horizon', path: '/someday' },
  { id: 'menu',     label: 'Menu',     icon: 'menu',    path: '/menu' },
];

/**
 * Bottom 4-tab bar. Active tab derived from URL.
 * Must be rendered inside a <BrowserRouter> (uses useLocation/useNavigate).
 * Designed for use inside App.jsx after CRU-187 adds /someday and /menu routes.
 */
export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = TABS.find((t) => location.pathname.startsWith(t.path))?.id ?? 'today';

  return (
    <div
      className="safe-bottom"
      style={{
        background: COLOR.linen,
        borderTop: `0.5px solid ${COLOR.rule}`,
        position: 'sticky', bottom: 0, zIndex: 20,
      }}
    >
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        height: 56,
      }}>
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => navigate(t.path)}
              style={{
                background: 'none', border: 0, cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                color: on ? COLOR.ink : COLOR.ink3,
                position: 'relative', padding: 0,
              }}
              aria-label={t.label}
            >
              {on && (
                <span style={{
                  position: 'absolute', top: 6, width: 16, height: 1.5,
                  background: COLOR.rubric, borderRadius: 1,
                }} />
              )}
              <Icon name={t.icon} size={20} sw={on ? 1.6 : 1.4} />
              <span style={{
                fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
                fontSize: 10.5,
                fontWeight: on ? 600 : 500,
                letterSpacing: '0.02em',
              }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
