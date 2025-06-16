export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Settings {
  resetTime: string // HH:MM format
  lastResetDate: string // YYYY-MM-DD format
}
