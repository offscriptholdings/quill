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

export default function App() {
  return (
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
            </Routes>
          </main>
          <NavBar />
          <TaskModal />
          <UndoToast />
        </div>
      </ModalProvider>
    </ToastProvider>
  )
}
