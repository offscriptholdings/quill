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
      className="flex border-t border-border bg-canvas safe-bottom"
      style={{ minHeight: 56 }}
    >
      {tabs.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [
              'flex flex-1 items-center justify-center',
              'font-mono text-xs tracking-wide uppercase',
              'transition-colors',
              isActive
                ? 'text-ink'
                : 'text-muted',
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
