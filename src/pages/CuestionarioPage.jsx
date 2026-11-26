import { useParams, useNavigate } from 'react-router-dom'
import Cuestionario from '../components/Cuestionario'
import { getCuestionarioFinal, getCuestionarioFinal2, getCuestionarioSesion } from '../data/cargarContenido'

function CuestionarioPage({ esFinal2 = false }) {
  const { id, num } = useParams()
  const navigate = useNavigate()

  // Si hay :num, es cuestionario de sesión; si no, es cuestionario final
  const cuestionario = num
    ? getCuestionarioSesion(id, num)
    : esFinal2
      ? getCuestionarioFinal2(id)
      : getCuestionarioFinal(id)

  if (!cuestionario) {
    return (
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 overflow-hidden transition-colors">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-300/40 dark:from-blue-900/20 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900" />

        <div className="relative text-center">
          <h1 className="text-3xl font-bold mb-4 tracking-tight">
            {num
              ? `Cuestionario de la Sesión ${num} no disponible`
              : esFinal2
                ? 'Cuestionario Final 2 no disponible'
                : 'Cuestionario no disponible'}
          </h1>
          <p className="text-slate-700 dark:text-slate-200 text-lg mb-8">
            Aún no hay contenido para este cuestionario.
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
    <Cuestionario
      cuestionario={cuestionario}
      cursoId={id}
      tipo={num ? `sesion-${num}` : esFinal2 ? 'final-2' : 'final'}
      onSalir={() => navigate(`/modulo/${id}`)}
    />
  )
}

export default CuestionarioPage