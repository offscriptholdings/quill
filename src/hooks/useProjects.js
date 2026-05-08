import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProjects() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    supabase
      .from('projects')
      .select('id, name, domain, status')
      .eq('status', 'active')
      .order('name')
      .schema('quill')
      .then(({ data }) => {
        if (data) setProjects(data)
      })
  }, [])

  return projects
}
