import { useMemo, useState } from 'react'
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

function Administracion() {
  const [busqueda, setBusqueda] = useState('')
  const { usuario, usuarios, cerrarSesion } = useAuth()

  const catalogo = useMemo(
    () => [...programas, ...modulos],
    []
  )

  const usuariosFiltrados = useMemo(() => {
    const query = normalizar(busqueda.trim())
    if (!query) return usuarios

    return usuarios.filter((perfil) => {
      const cursos = perfil.nivel === 'admin'
        ? 'acceso completo'
        : (perfil.cursos || [])
          .map((id) => catalogo.find((curso) => curso.id === id)?.nombre || id)
          .join(' ')

      return normalizar(`${perfil.nombre} ${perfil.nivel} ${perfil.activo ? 'activo' : 'inactivo'} ${cursos}`).includes(query)
    })
  }, [busqueda, usuarios, catalogo])

  const obtenerCursos = (perfil) => {
    if (perfil.nivel === 'admin') {
      return ['Acceso completo']
    }

    if (!perfil.cursos?.length) {
      return ['Sin cursos asignados']
    }

    return perfil.cursos.map((id) => {
      return catalogo.find((curso) => curso.id === id)?.nombre || id
    })
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-900 dark:text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-300/30 dark:from-blue-900/20 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900" />

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Práctica" className="h-10 w-10 rounded-lg object-cover" />
            <div>
              <h1 className="text-lg font-bold">Administración</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{usuario?.nombre}</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar usuario..."
                className="w-64 rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-800"
              />
            </div>
            <ThemeToggle />
            <button
              onClick={cerrarSesion}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link to="/" className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
              ← Volver al inicio
            </Link>
            <h2 className="mt-3 text-3xl font-bold">Usuarios registrados</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {usuariosFiltrados.length} {usuariosFiltrados.length === 1 ? 'usuario' : 'usuarios'}
            </p>
          </div>

          <input
            type="text"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar usuario..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-4 text-sm outline-none focus:border-blue-500 sm:hidden dark:border-white/10 dark:bg-slate-800"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800/50">
          <div className="hidden grid-cols-[minmax(220px,1.2fr)_160px_minmax(280px,2fr)] gap-4 border-b border-slate-200 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid dark:border-white/10 dark:text-slate-400">
            <span>Nombre</span>
            <span>Estado</span>
            <span>Cursos</span>
          </div>

          {usuariosFiltrados.length === 0 ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400">
              No se encontraron usuarios.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {usuariosFiltrados.map((perfil) => (
                <div
                  key={perfil.id}
                  className="grid gap-4 px-6 py-5 md:grid-cols-[minmax(220px,1.2fr)_160px_minmax(280px,2fr)] md:items-start"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{perfil.nombre}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {perfil.nivel === 'admin' ? 'Administrador' : 'Usuario'}
                    </p>
                  </div>

                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      perfil.activo
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {perfil.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {obtenerCursos(perfil).map((curso) => (
                      <span
                        key={curso}
                        className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                      >
                        {curso}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Administracion
