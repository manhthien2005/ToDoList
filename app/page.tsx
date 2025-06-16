import dynamic from "next/dynamic"

// Dynamic import để tránh SSR issues
const CuteTodoApp = dynamic(() => import("../cute-todo-app"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🚀</div>
        <p className="text-white text-xl">Loading Space Mission Control...</p>
      </div>
    </div>
  ),
})

export default function Page() {
  return <CuteTodoApp />
}
