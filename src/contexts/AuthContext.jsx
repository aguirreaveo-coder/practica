import { createContext, useContext, useMemo, useState } from 'react'
import usuariosData from '../data/usuarios.json'
import modulos from '../data/modulos.json'
import programas from '../data/programas.json'

const AuthContext = createContext(null)
const SESSION_KEY = 'practica_usuario'
const ESTADOS_KEY = 'practica_estados_perfiles'

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function AuthProvider({ children }) {
  const [usuarios, setUsuarios] = useState(() => {
    let estados = {}
    try {
      estados = JSON.parse(localStorage.getItem(ESTADOS_KEY)) || {}
    } catch {
      estados = {}
    }
    return usuariosData.map((perfil) => ({
      ...perfil,
      activo: Object.prototype.hasOwnProperty.call(estados, perfil.id)
        ? estados[perfil.id]
        : perfil.activo !== false,
    }))
  })

  const [usuario, setUsuario] = useState(() => {
    const guardado = sessionStorage.getItem(SESSION_KEY)
    if (!guardado) return null
    const perfil = usuarios.find((item) => item.id === guardado)
    return perfil?.activo ? perfil : null
  })

  const iniciarSesion = (nombre) => {
    const nombreNormalizado = normalizar(nombre.trim())
    const encontrado = usuarios.find(
      (perfil) => perfil.activo && normalizar(perfil.nombre) === nombreNormalizado
    )

    if (!encontrado) return false

    sessionStorage.setItem(SESSION_KEY, encontrado.id)
    setUsuario(encontrado)
    return true
  }

  const cerrarSesion = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setUsuario(null)
  }

  const actualizarEstadoPerfil = (id, activo) => {
    if (usuario?.nivel !== 'admin') return false

    setUsuarios((actuales) => {
      const nuevos = actuales.map((perfil) =>
        perfil.id === id ? { ...perfil, activo } : perfil
      )
      const estados = Object.fromEntries(nuevos.map((perfil) => [perfil.id, perfil.activo]))
      localStorage.setItem(ESTADOS_KEY, JSON.stringify(estados))
      return nuevos
    })

    setUsuario((actual) => {
      if (actual?.id !== id) return actual
      return activo ? actual : null
    })
    if (usuario?.id === id && !activo) {
      sessionStorage.removeItem(SESSION_KEY)
    }
    return true
  }

  const puedeAcceder = (id) => {
    if (!usuario) return false
    if (usuario.nivel === 'admin') return true
    return usuario.cursos.includes(id)
  }

  const cursosPermitidos = useMemo(() => {
    if (!usuario) return []
    const todos = [...programas, ...modulos]
    if (usuario.nivel === 'admin') return todos
    return todos.filter((item) => usuario.cursos.includes(item.id))
  }, [usuario])

  const nombresCursos = useMemo(() => {
    if (!usuario) return []
    if (usuario.nivel === 'admin') return ['Acceso completo a todos los contenidos']
    return usuario.cursos.map((id) => {
      const curso = [...programas, ...modulos].find((item) => item.id === id)
      return curso?.nombre || id
    })
  }, [usuario])

  const value = {
    usuario,
    usuarios,
    iniciarSesion,
    cerrarSesion,
    puedeAcceder,
    cursosPermitidos,
    nombresCursos,
    actualizarEstadoPerfil,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
