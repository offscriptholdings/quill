import AddTaskFAB from '../components/AddTaskFAB'

export default function AllTasksTab() {
  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="font-header text-2xl text-ink mb-6">All Tasks</h1>
      <p className="font-task text-muted text-lg">Tasks coming soon.</p>
      <AddTaskFAB />
    </div>
  )
}
