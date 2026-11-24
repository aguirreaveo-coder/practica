import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import modulos from '../data/modulos.json'
import programas from '../data/programas.json'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function Home() {
  const [busqueda, setBusqueda] = useState('')
  const [caratulasDisponibles, setCaratulasDisponibles] = useState({})
  const {
    usuario,
    nombresCursos,
    cerrarSesion,
    cursosPermitidos,
    academico,
  } = useAuth()

  const modulosVisibles = useMemo(
    () => modulos.filter((item) => cursosPermitidos.some((permitido) => permitido.id === item.id)),
    [cursosPermitidos]
  )
  const programasVisibles = useMemo(
    () => programas.filter((item) => cursosPermitidos.some((permitido) => permitido.id === item.id)),
    [cursosPermitidos]
  )
  const todos = cursosPermitidos

  useEffect(() => {
    todos.forEach((item) => {
      const img = new Image()
      img.onload = () => {
        setCaratulasDisponibles((prev) => ({ ...prev, [item.id]: true }))
      }
      img.onerror = () => {
        setCaratulasDisponibles((prev) => ({ ...prev, [item.id]: false }))
      }
      img.src = item.caratula
    })
  }, [todos])

  const filtroActivo = busqueda.trim().length > 0

  const modulosFiltrados = useMemo(() => {
    const q = normalizar(busqueda.trim())
    if (!q) return modulosVisibles
    return modulosVisibles.filter((m) =>
      normalizar(m.nombre).includes(q) ||
      normalizar(m.descripcion).includes(q)
    )
  }, [busqueda, modulosVisibles])

  const programasFiltrados = useMemo(() => {
    const q = normalizar(busqueda.trim())
    if (!q) return programasVisibles
    return programasVisibles.filter((p) =>
      normalizar(p.nombre).includes(q) ||
      normalizar(p.descripcion).includes(q)
    )
  }, [busqueda, programasVisibles])

  const totalResultados = modulosFiltrados.length + programasFiltrados.length

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-300/30 dark:from-blue-900/20 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900" />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.06] dark:opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(100,116,139,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.jpg"
                alt="Práctica"
                className="w-10 h-10 rounded-lg object-cover shadow-sm group-hover:opacity-90 transition-opacity"
              />
              <div className="leading-tight">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Práctica
                </h1>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Sesión activa: {usuario?.nombre}
                  </p>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-3 flex-1 max-w-lg ml-auto">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-blue-500 dark:focus:border-blue-500/60 transition-colors shadow-sm"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                    aria-label="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
              {usuario?.nivel === 'admin' && (
                <Link
                  to="/administracion"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-blue-500/60 dark:hover:text-blue-400"
                  title="Administración de usuarios"
                  aria-label="Administración de usuarios"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </Link>
              )}
              <ThemeToggle />
              <button
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

      {/* CONTENIDO */}
      <div className="relative">
        <main className="max-w-7xl mx-auto px-6 py-10">
          <section className="mb-10 rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-800/50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Mi perfil
                </p>
                <h2 className="mt-1 text-xl font-bold">{usuario?.nombre}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Nivel {usuario?.nivel === 'admin' ? 'Administrador' : 'Usuario'}
                </p>
              </div>
              <div className="sm:max-w-xl sm:text-right">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {usuario?.nivel === 'admin' ? 'Permisos' : 'Cursos activados'}
                </p>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {nombresCursos.map((curso) => (
                    <span key={curso} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                      {curso}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {usuario?.nivel === 'usuario' && (
            <section className="mb-10 rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-800/50">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Progreso y calificaciones
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {nombresCursos.map((nombreCurso) => {
                  const curso = [...programas, ...modulos].find((item) => item.nombre === nombreCurso)
                  const cursoId = curso?.id
                  const progreso = academico.progreso?.[cursoId] || 0
                  const calificacion = academico.calificaciones?.[cursoId]?.final
                  return (
                    <div key={nombreCurso} className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                      <p className="font-bold">{nombreCurso}</p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Progreso: <span className="font-bold text-slate-900 dark:text-white">{progreso}%</span>
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full bg-blue-500" style={{ width: `${progreso}%` }} />
                      </div>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        Calificación final:{' '}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {calificacion == null ? 'Pendiente' : `${calificacion}%`}
                        </span>
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {filtroActivo ? (
            <>
              {/* Modo búsqueda: mostrar todo en una sola grid */}
              <div className="flex items-center gap-4 mb-8">
                <span className="h-px w-8 bg-slate-400 dark:bg-slate-600" />
                <h2 className="text-sm font-mono uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium">
                  Resultados de búsqueda
                </h2>
                <span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                  {totalResultados} {totalResultados === 1 ? 'resultado' : 'resultados'}
                </span>
              </div>

              {totalResultados === 0 ? (
                <div className="text-center py-20">
                  <p className="text-6xl mb-4">🔍</p>
                  <p className="text-slate-700 dark:text-slate-200 text-lg">
                    No hay resultados para "{busqueda}"
                  </p>
                  <button
                    onClick={() => setBusqueda('')}
                    className="mt-6 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline transition-colors text-base font-medium"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...programasFiltrados, ...modulosFiltrados].map((item) => (
                    <Tarjeta key={item.id} item={item} tieneCaratula={caratulasDisponibles[item.id] === true} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Sección: Programas Especiales (siempre primero) */}
              <section className="mb-14">
                <div className="flex items-center gap-4 mb-8">
                  <span className="h-px w-8 bg-slate-400 dark:bg-slate-600" />
                  <h2 className="text-sm font-mono uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium">
                    Programas Especiales
                  </h2>
                  <span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    {programasVisibles.length} programas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {programasVisibles.map((item) => (
                    <Tarjeta key={item.id} item={item} tieneCaratula={caratulasDisponibles[item.id] === true} />
                  ))}
                </div>
              </section>

              {/* Sección: Módulos de Prepa Abierta */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="h-px w-8 bg-slate-400 dark:bg-slate-600" />
                  <h2 className="text-sm font-mono uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium">
                    Módulos de Prepa Abierta
                  </h2>
                  <span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    {modulosVisibles.length} módulos
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {modulosVisibles.map((item) => (
                    <Tarjeta key={item.id} item={item} tieneCaratula={caratulasDisponibles[item.id] === true} />
                  ))}
                </div>
              </section>
            </>
          )}
        </main>

        <footer className="border-t border-slate-200 dark:border-white/10 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm tracking-wide">
              Práctica · {new Date().getFullYear()}
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Creada por <span className="text-slate-900 dark:text-slate-200 font-medium">Christofer Aguirre</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// ===== TARJETA REUTILIZABLE =====
function Tarjeta({ item, tieneCaratula }) {
  // Para módulos de prepa: "Módulo X"
  // Para programas: "Programa"
  let etiqueta = ''
  if (item.tipo === 'prepa') {
    const numero = item.id.replace('modulo-', '')
    etiqueta = `Módulo ${numero}`
  } else {
    etiqueta = 'Programa'
  }

  const enlaceExterno = item.tipoEspecial === 'externo' && item.enlaceExterno
  const contenido = (
    <>
      {tieneCaratula ? (
        <>
          <img
            src={item.caratula}
            alt={item.nombre}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}99 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
        </>
      )}

      <div className="relative h-full flex flex-col justify-between p-5">
        <div className="flex justify-between items-start">
          <span className="text-white text-sm font-mono uppercase tracking-wider bg-black/40 backdrop-blur-sm px-2 py-1 rounded font-medium">
            {etiqueta}
          </span>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg leading-tight mb-2 drop-shadow-md">
            {item.nombre}
          </h2>
          <p className="text-white text-sm leading-snug font-medium drop-shadow-sm">
            {item.descripcion}
          </p>
        </div>
      </div>
    </>
  )

  const className = "group relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl ring-1 ring-black/5 dark:ring-white/5 hover:ring-black/20 dark:hover:ring-white/20 transition-all duration-300 hover:-translate-y-1"

  return enlaceExterno ? (
    <a
      href={enlaceExterno}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {contenido}
    </a>
  ) : (
    <Link to={`/modulo/${item.id}`} className={className}>
      {contenido}
    </Link>
  )
}

export default Home