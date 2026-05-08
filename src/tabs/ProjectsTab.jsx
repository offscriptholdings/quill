import AddTaskFAB from '../components/AddTaskFAB'

export default function ProjectsTab() {
  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="font-header text-2xl text-ink mb-6">Projects</h1>
      <p className="font-task text-muted text-lg">Projects coming soon.</p>
      <AddTaskFAB defaultValues={{ domain: 'Project' }} />
    </div>
  )
}
