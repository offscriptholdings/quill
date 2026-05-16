// DB values — lowercase, used in all SELECT/INSERT/UPDATE against quill.tasks/quill.projects
export const DOMAIN_VALUES = ['spirit', 'body', 'work', 'wealth', 'family']

// Display labels — what users see in the UI
export const DOMAIN_DISPLAY_LABEL = {
  spirit: 'Spirit',
  body:   'Body',
  work:   'Work',
  wealth: 'Wealth',
  family: 'Family',
}

export function displayDomain(value) {
  return DOMAIN_DISPLAY_LABEL[value] ?? value
}

// Priority values (int 0–3) + display labels
export const PRIORITY_VALUES = [0, 1, 2, 3] // low | normal | high | urgent
export const PRIORITY_DISPLAY_LABEL = {
  0: 'Low',
  1: 'Normal',
  2: 'High',
  3: 'Urgent',
}
export const PRIORITY_TO_INT = { low: 0, normal: 1, high: 2, urgent: 3 }
