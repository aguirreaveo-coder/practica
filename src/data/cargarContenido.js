// Carga automáticamente todos los JSON dentro de src/data/modulos/
const archivos = import.meta.glob('./modulos/*/*.json', { eager: true })

const contenido = {}

for (const ruta in archivos) {
  const partes = ruta.split('/')
  const moduloId = partes[partes.length - 2]
  const nombreArchivo = partes[partes.length - 1].replace('.json', '')

  if (!contenido[moduloId]) contenido[moduloId] = {}
  contenido[moduloId][nombreArchivo] = archivos[ruta].default
}

export const UMBRAL_APROBACION = 70

export function calcularProgresoCuestionarios(moduloId, aprobados = {}) {
  const mod = contenido[moduloId]
  if (!mod) return 0

  const tiposCuestionario = Object.keys(mod).flatMap((nombre) => {
    if (nombre === 'cuestionario-final' && Array.isArray(mod[nombre]?.preguntas)) {
      return ['final']
    }

    if (nombre === 'cuestionario-final-2' && Array.isArray(mod[nombre]?.preguntas)) {
      return ['final-2']
    }

    const sesion = nombre.match(/^cuestionario-sesion(\d+)$/)
    if (sesion && Array.isArray(mod[nombre]?.preguntas)) {
      return [`sesion-${sesion[1]}`]
    }

    return []
  })

  if (tiposCuestionario.length === 0) return 0

  const aprobadosContados = tiposCuestionario.filter((tipo) => aprobados[tipo] === true).length
  return Math.round((aprobadosContados / tiposCuestionario.length) * 100)
}

// Clase: busca "claseN" o "sesionN"
export function getClase(moduloId, num) {
  const mod = contenido[moduloId]
  if (!mod) return null
  return mod[`clase${num}`] || mod[`sesion${num}`] || null
}

export function getExpress(moduloId) {
  return contenido[moduloId]?.['express'] || null
}

// Cuestionario Final (del programa/módulo completo)
export function getCuestionarioFinal(moduloId) {
  return contenido[moduloId]?.['cuestionario-final'] || null
}

export function getCuestionarioFinal2(moduloId) {
  return contenido[moduloId]?.['cuestionario-final-2'] || null
}

// Cuestionario de una sesión específica (para programas especiales)
export function getCuestionarioSesion(moduloId, num) {
  return contenido[moduloId]?.[`cuestionario-sesion${num}`] || null
}

export function listarContenido() {
  return contenido
}

export default contenido