"use client"

import { useNotes } from "./hooks/use-notes"
import { NoteSidebar } from "./components/note-sidebar"
import { NoteEditor } from "./components/note-editor"

export default function NoteApp() {
  const { notes, selectedNote, setSelectedNote, createNote, updateNote, deleteNote } = useNotes()

  return (
    <div className="h-screen flex bg-background">
      <NoteSidebar
        notes={notes}
        selectedNote={selectedNote}
        onSelectNote={setSelectedNote}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
      />
      <NoteEditor note={selectedNote} onUpdateNote={updateNote} />
    </div>
  )
}
