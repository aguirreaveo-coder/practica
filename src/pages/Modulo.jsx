import { Link, useParams } from 'react-router-dom'
import modulos from '../data/modulos.json'
import programas from '../data/programas.json'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

function Modulo() {
  const { id } = useParams()

  const modulo = modulos.find((m) => m.id === id)
  const programa = programas.find((p) => p.id === id)
  const item = modulo || programa

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
        <Header />
        <div className="flex flex-col items-center justify-center p-6" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">No encontrado</h1>
          <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-base font-medium">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const esPrograma = item.tipo === 'programa'
  const esTablaPeriodica = item.tipoEspecial === 'tabla-periodica'
  const etiqueta = item.etiquetaSesion || 'Clase'
  const duracion = item.duracion || (esPrograma ? '4 horas' : '2 horas')

  // Construir las opciones dinámicamente
  let sesiones = []

  if (esPrograma) {
    sesiones = (item.sesiones || []).map((s) => ({
      num: s.num,
      titulo: `${etiqueta} ${s.num}`,
      subtema: s.subtema !== `${etiqueta} ${s.num}` ? s.subtema : null,
      tipo: 'clase',
    }))
  } else {
    sesiones = [
      { tipo: 'clase', num: 1, titulo: 'Clase 1' },
      { tipo: 'clase', num: 2, titulo: 'Clase 2' },
      { tipo: 'clase', num: 3, titulo: 'Clase 3' },
      { tipo: 'clase', num: 4, titulo: 'Clase 4' },
    ]
  }

  const numero = esPrograma ? null : item.id.replace('modulo-', '')

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${item.caratula})`,
          opacity: 0.15,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse at top, ${item.color}30 0%, transparent 65%)`,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.06] dark:opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(100,116,139,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <Header item={item} numero={numero} />

      <div className="relative">
        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="h-px w-8 bg-slate-400 dark:bg-slate-600" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium">
              Contenido del {esPrograma ? 'programa' : 'módulo'}
            </h2>
            <span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
          </div>

          <div className="space-y-3">
            {/* SESIONES */}
            {sesiones.map((sesion) => {
              // PROGRAMAS NORMALES: 2 columnas (clase + cuestionario de sesión)
              if (esPrograma && !esTablaPeriodica) {
                return (
                  <div key={sesion.num} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Link
                      to={`/modulo/${id}/clase/${sesion.num}`}
                      className="group flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm hover:bg-white dark:hover:bg-white/[0.08] hover:border-slate-400 dark:hover:border-white/25 shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="w-1 h-10 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <h3 className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
                            {sesion.titulo}
                            {sesion.subtema && (
                              <span className="text-slate-600 dark:text-slate-300 font-medium">
                                {' · '}{sesion.subtema}
                              </span>
                            )}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">
                            {duracion} · Diapositivas + actividades
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all text-xl">
                        →
                      </span>
                    </Link>

                    <Link
                      to={`/modulo/${id}/cuestionario/${sesion.num}`}
                      className="group flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm hover:bg-white dark:hover:bg-white/[0.06] hover:border-slate-400 dark:hover:border-white/25 shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">📝</span>
                        <div>
                          <h3 className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">
                            Cuestionario de la {sesion.titulo}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">
                            Autoevaluación de la sesión
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all text-xl">
                        →
                      </span>
                    </Link>
                  </div>
                )
              }

              // TABLA PERIÓDICA y MÓDULOS DE PREPA: solo botón de la sesión/clase (ancho completo)
              return (
                <Link
                  key={sesion.num}
                  to={`/modulo/${id}/clase/${sesion.num}`}
                  className="group flex items-center justify-between p-5 border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm hover:bg-white dark:hover:bg-white/[0.08] hover:border-slate-400 dark:hover:border-white/25 shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
                        {sesion.titulo}
                        {sesion.subtema && (
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {' · '}{sesion.subtema}
                          </span>
                        )}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">
                        {duracion} · Diapositivas + actividades
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all text-xl">
                    →
                  </span>
                </Link>
              )
            })}

            {/* EXPRESS (para todos excepto tabla periódica) */}
            {!esTablaPeriodica && item.mostrarExpress !== false && (
              <Link
                to={`/modulo/${id}/express`}
                className="group flex items-center justify-between p-5 border border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <span className="w-1 h-10 rounded-full shrink-0 bg-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
                      Clase Express
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">
                      Versión comprimida · {duracion}
                    </p>
                  </div>
                </div>
                <span className="text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all text-xl">
                  →
                </span>
              </Link>
            )}

            {/* MODO INTERACTIVO (solo para tabla periódica) */}
            {esTablaPeriodica && (
              <Link
                to={`/modulo/${id}/interactivo`}
                className="group flex items-center justify-between p-5 border border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 dark:border-purple-500/40 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <span className="w-1 h-10 rounded-full shrink-0 bg-purple-500" />
                  <div>
                    <h3 className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
                      🎮 Modo Interactivo
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">
                      Flash Cards para memorizar los elementos
                    </p>
                  </div>
                </div>
                <span className="text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all text-xl">
                  →
                </span>
              </Link>
            )}

            {/* CUESTIONARIO FINAL (siempre) */}
            {item.mostrarCuestionarioFinal !== false && (
              <Link
                to={`/modulo/${id}/cuestionario`}
                className="group flex items-center justify-between p-5 border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] hover:border-slate-400 dark:hover:border-white/25 shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-1 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
                      Cuestionario Final
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">
                      {esPrograma ? 'Autoevaluación general del programa' : '40 preguntas · Autoevaluación'}
                    </p>
                  </div>
                </div>
                <span className="text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all text-xl">
                  →
                </span>
              </Link>
            )}

            {/* TABLA PERIÓDICA DE REFERENCIA (solo para tabla periódica) */}
            {esTablaPeriodica && (
              <Link
                to={`/modulo/${id}/tabla`}
                className="group flex items-center justify-between p-5 border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 dark:border-amber-500/40 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <span className="w-1 h-10 rounded-full shrink-0 bg-amber-500" />
                  <div>
                    <h3 className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
                      📋 Tabla Periódica de Referencia
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">
                      Consulta todos los elementos y sus datos
                    </p>
                  </div>
                </div>
                <span className="text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all text-xl">
                  →
                </span>
              </Link>
            )}
          </div>
        </main>

        <footer className="border-t border-slate-200 dark:border-white/10 mt-8">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Práctica · {item.nombre}
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// ===== HEADER REUTILIZABLE =====
function Header({ item, numero }) {
  const { usuario, cerrarSesion } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <img
                src="/logo.jpg"
                alt="Práctica"
                className="w-10 h-10 rounded-lg object-cover shadow-sm group-hover:opacity-90 transition-opacity"
              />
              <div className="leading-tight hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Práctica
                </h1>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {usuario?.nombre}
                  </p>
                </div>
              </div>
            </Link>

            {item && (
              <>
                <span className="hidden md:block text-slate-300 dark:text-slate-700 text-xl">/</span>
                <div className="hidden md:flex items-baseline gap-3 min-w-0">
                  <span className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white shrink-0">
                    {numero ? `Módulo ${numero}` : 'Programa'}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600 text-lg">·</span>
                  <span className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {item.nombre}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={cerrarSesion}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
              title="Cerrar sesión"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Modulo