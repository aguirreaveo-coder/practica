import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

function Login() {
  const { usuario, usuarios, iniciarSesion } = useAuth()
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (usuario) return <Navigate to="/" replace />

  const enviar = (event) => {
    event.preventDefault()
    const coincide = usuarios.find(
      (perfil) => perfil.nombre.toLowerCase() === nombre.trim().toLowerCase()
    )
    if (coincide && !coincide.activo) {
      setError('Este perfil está inactivo temporalmente.')
      return
    }
    if (!iniciarSesion(nombre)) {
      setError('El nombre no coincide con ningún perfil definido.')
      return
    }
    setError('')
    navigate('/', { replace: true })
  }

  return (
    <div className="relative min-h-screen grid place-items-center overflow-hidden bg-slate-50 px-6 dark:bg-slate-900 text-slate-900 dark:text-white">
      <div className="absolute right-6 top-6"><ThemeToggle /></div>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-300/40 via-slate-50 to-slate-50 dark:from-blue-900/30 dark:via-slate-900 dark:to-slate-900" />

      <main className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-xl dark:border-white/10 dark:bg-slate-800/80 backdrop-blur">
        <div className="mb-8 text-center">
          <img src="/logo.jpg" alt="Práctica" className="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover shadow-md" />
          <h1 className="text-3xl font-bold">Práctica</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Selecciona tu perfil para continuar</p>
        </div>

        <form onSubmit={enviar} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="mb-2 block text-sm font-semibold">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              list="perfiles"
              autoComplete="off"
              required
              placeholder="Escribe tu nombre"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900"
            />
            <datalist id="perfiles">
              {usuarios.map((perfil) => <option key={perfil.id} value={perfil.nombre} />)}
            </datalist>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white shadow-sm transition hover:bg-blue-700">
            Iniciar sesión
          </button>
        </form>
      </main>
    </div>
  )
}

export default Login
