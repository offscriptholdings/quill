import { Routes, Route, Navigate } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import { ToastProvider } from './context/ToastContext';
import AppTopBar from './components/AppTopBar';
import TabBar from './components/TabBar';
import CaptureSheet from './components/CaptureSheet';
import UndoToast from './components/UndoToast';
import TodayTab from './tabs/TodayTab';
import ProjectsTab from './tabs/ProjectsTab';
import SomedayTab from './tabs/SomedayTab';
import MenuTab from './tabs/MenuTab';
import LogbookTab from './tabs/LogbookTab';
import DomainScreen from './tabs/DomainScreen';
import TaskDetailScreen from './tabs/TaskDetailScreen';

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function App() {
  const today = formatDate(new Date());
  return (
    <ToastProvider>
      <ModalProvider>
        <div className="flex flex-col h-full bg-linen">
          <AppTopBar
            left={today}
            right={
              <span style={{
                fontFamily: 'Newsreader, serif', fontSize: 18,
                fontWeight: 500, fontStyle: 'italic', color: '#1F1D18',
              }}>
                Quill
              </span>
            }
          />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/"               element={<Navigate to="/today" replace />} />
              <Route path="/today"          element={<TodayTab />} />
              <Route path="/projects"       element={<ProjectsTab />} />
              <Route path="/someday"        element={<SomedayTab />} />
              <Route path="/menu"           element={<MenuTab />} />
              <Route path="/menu/logbook"   element={<LogbookTab />} />
              <Route path="/domain/:slug"   element={<DomainScreen />} />
              <Route path="/task/:id"       element={<TaskDetailScreen />} />
              {/* Redirects from old routes */}
              <Route path="/this-week"      element={<Navigate to="/today" replace />} />
              <Route path="/all-tasks"      element={<Navigate to="/someday" replace />} />
              <Route path="/logbook"        element={<Navigate to="/menu/logbook" replace />} />
              {/* Catch-all → today */}
              <Route path="*"               element={<Navigate to="/today" replace />} />
            </Routes>
          </main>
          <TabBar />
          <CaptureSheet />
          <UndoToast />
        </div>
      </ModalProvider>
    </ToastProvider>
  );
}
