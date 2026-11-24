import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import usuariosData from '../data/usuarios.json'
import modulos from '../data/modulos.json'
import programas from '../data/programas.json'

const AuthContext = createContext(null)
const SESSION_KEY = 'practica_usuario'
const ACADEMICO_KEY = 'practica_academico'

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function AuthProvider({ children }) {
  const [usuarios] = useState(() =>
    usuariosData.map((perfil) => ({
      ...perfil,
      activo: perfil.activo !== false,
    }))
  )
  const [usuario, setUsuario] = useState(() => {
    const guardado = sessionStorage.getItem(SESSION_KEY)
    if (!guardado) return null
    const perfil = usuarios.find((item) => item.id === guardado)
    return perfil?.activo ? perfil : null
  })
  const [academico, setAcademico] = useState({})

  useEffect(() => {
    if (!usuario?.id) {
      setAcademico({})
      return
    }
    try {
      const guardado = JSON.parse(localStorage.getItem(`${ACADEMICO_KEY}_${usuario.id}`)) || {}
      setAcademico({
        progreso: { ...usuario.progreso, ...guardado.progreso },
        calificaciones: { ...usuario.calificacionesFinales, ...guardado.calificaciones },
      })
    } catch {
      setAcademico({
        progreso: usuario.progreso || {},
        calificaciones: usuario.calificacionesFinales || {},
      })
    }
  }, [usuario])

  const iniciarSesion = (nombre, password = '') => {
    const nombreNormalizado = normalizar(nombre.trim())
    const encontrado = usuarios.find(
      (perfil) => perfil.activo && normalizar(perfil.nombre) === nombreNormalizado
    )

    if (!encontrado) return false
    if (encontrado.nivel === 'admin' && encontrado.password !== password) return false

    sessionStorage.setItem(SESSION_KEY, encontrado.id)
    setUsuario(encontrado)
    return true
  }

  const cerrarSesion = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setUsuario(null)
  }

  const guardarAcademico = (actualizacion) => {
    if (!usuario) return
    setAcademico((actual) => {
      const nuevo = actualizacion(actual)
      localStorage.setItem(
        `${ACADEMICO_KEY}_${usuario.id}`,
        JSON.stringify(nuevo)
      )
      return nuevo
    })
  }

  const registrarProgreso = (cursoId, porcentaje) => {
    guardarAcademico((actual) => ({
      progreso: {
        ...(actual.progreso || {}),
        [cursoId]: Math.max(actual.progreso?.[cursoId] || 0, porcentaje),
      },
      calificaciones: actual.calificaciones || {},
    }))
  }

  const registrarCalificacion = (cursoId, tipo, porcentaje) => {
    guardarAcademico((actual) => ({
      progreso: actual.progreso || {},
      calificaciones: {
        ...(actual.calificaciones || {}),
        [cursoId]: {
          ...(actual.calificaciones?.[cursoId] || {}),
          [tipo]: porcentaje,
        },
      },
    }))
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
    academico,
    registrarProgreso,
    registrarCalificacion,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
