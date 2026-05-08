import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/today',     label: 'Today' },
  { to: '/this-week', label: 'This Week' },
  { to: '/projects',  label: 'Projects' },
  { to: '/all-tasks', label: 'All Tasks' },
]

export default function NavBar() {
  return (
    <nav
      className="flex bg-background safe-bottom"
      style={{ minHeight: 56, borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      {tabs.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [
              'flex flex-1 items-center justify-center',
              'font-mono text-xs tracking-wide uppercase',
              'transition-colors border-t-2',
              isActive
                ? 'text-ink border-accent'
                : 'text-muted border-transparent',
            ].join(' ')
          }
          style={{ minHeight: 44 }}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
