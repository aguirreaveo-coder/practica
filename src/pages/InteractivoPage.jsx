import { useParams, useNavigate } from 'react-router-dom'
import ModoInteractivo from '../components/ModoInteractivo'

function InteractivoPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Por ahora solo tabla-periodica tiene este modo
  if (id !== 'tabla-periodica') {
    return (
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 overflow-hidden transition-colors">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-300/30 dark:from-purple-900/20 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900" />
        <div className="relative text-center">
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Modo no disponible</h1>
          <p className="text-slate-700 dark:text-slate-200 text-lg mb-8">
            El modo interactivo solo está disponible para Tabla Periódica.
          </p>
          <button
            onClick={() => navigate(`/modulo/${id}`)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline transition-colors text-base font-medium"
          >
            ← Volver al menú
          </button>
        </div>
      </div>
    )
  }

  return (
    <ModoInteractivo
      onSalir={() => navigate(`/modulo/${id}`)}
    />
  )
}

export default InteractivoPage