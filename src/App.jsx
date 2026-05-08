import { Component } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ModalProvider } from './context/ModalContext'
import { ToastProvider } from './context/ToastContext'
import NavBar from './components/NavBar'
import TaskModal from './components/TaskModal'
import UndoToast from './components/UndoToast'
import TodayTab from './tabs/TodayTab'
import ThisWeekTab from './tabs/ThisWeekTab'
import ProjectsTab from './tabs/ProjectsTab'
import AllTasksTab from './tabs/AllTasksTab'
import LogbookTab from './tabs/LogbookTab'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#E8E2D9', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
          {'ERROR\n\n' + this.state.error?.message + '\n\n' + this.state.error?.stack}
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
    <ToastProvider>
      <ModalProvider>
        <div className="flex flex-col h-full bg-canvas">
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/"           element={<Navigate to="/today" replace />} />
              <Route path="/today"      element={<TodayTab />} />
              <Route path="/this-week"  element={<ThisWeekTab />} />
              <Route path="/projects"   element={<ProjectsTab />} />
              <Route path="/all-tasks"  element={<AllTasksTab />} />
              <Route path="/logbook"    element={<LogbookTab />} />
            </Routes>
          </main>
          <NavBar />
          <TaskModal />
          <UndoToast />
        </div>
      </ModalProvider>
    </ToastProvider>
    </ErrorBoundary>
  )
}
