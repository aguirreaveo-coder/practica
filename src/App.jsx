import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Home from './pages/home'
import Modulo from './pages/Modulo'
import Clase from './pages/Clase'
import CuestionarioPage from './pages/CuestionarioPage'
import InteractivoPage from './pages/InteractivoPage'
import TablaReferenciaPage from './pages/TablaReferenciaPage'
import Administracion from './pages/Administracion'
import Login from './pages/Login'
import { useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/login" replace />
}

function AccessRoute({ children }) {
  const { id } = useParams()
  const { puedeAcceder } = useAuth()
  if (!puedeAcceder(id)) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center text-slate-900 dark:bg-slate-900 dark:text-white">
        <div>
          <p className="mb-3 text-5xl">🔒</p>
          <h1 className="mb-2 text-2xl font-bold">Contenido no disponible</h1>
          <p className="mb-6 text-slate-500 dark:text-slate-400">Este programa no está activado en tu perfil.</p>
          <a href="/" className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white">Volver al inicio</a>
        </div>
      </div>
    )
  }
  return children
}

function AdminRoute({ children }) {
  const { usuario } = useAuth()
  if (usuario?.nivel !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/administracion" element={<ProtectedRoute><AdminRoute><Administracion /></AdminRoute></ProtectedRoute>} />
      <Route path="/modulo/:id" element={<ProtectedRoute><AccessRoute><Modulo /></AccessRoute></ProtectedRoute>} />
      <Route path="/modulo/:id/clase/:num" element={<ProtectedRoute><AccessRoute><Clase /></AccessRoute></ProtectedRoute>} />
      <Route path="/modulo/:id/express" element={<ProtectedRoute><AccessRoute><Clase esExpress={true} /></AccessRoute></ProtectedRoute>} />
      <Route path="/modulo/:id/cuestionario" element={<ProtectedRoute><AccessRoute><CuestionarioPage /></AccessRoute></ProtectedRoute>} />
      <Route path="/modulo/:id/cuestionario/:num" element={<ProtectedRoute><AccessRoute><CuestionarioPage /></AccessRoute></ProtectedRoute>} />
      <Route path="/modulo/:id/interactivo" element={<ProtectedRoute><AccessRoute><InteractivoPage /></AccessRoute></ProtectedRoute>} />
      <Route path="/modulo/:id/tabla" element={<ProtectedRoute><AccessRoute><TablaReferenciaPage /></AccessRoute></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
