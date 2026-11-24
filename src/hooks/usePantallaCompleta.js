import { useEffect, useState } from 'react'

export function usePantallaCompleta() {
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false)

  useEffect(() => {
    const manejarCambio = () => {
      setEnPantallaCompleta(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', manejarCambio)
    return () => document.removeEventListener('fullscreenchange', manejarCambio)
  }, [])

  const activar = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
    } catch (err) {
      console.warn('No se pudo activar pantalla completa:', err)
    }
  }

  const desactivar = async () => {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.warn('No se pudo desactivar pantalla completa:', err)
    }
  }

  const alternar = () => {
    if (document.fullscreenElement) {
      desactivar()
    } else {
      activar()
    }
  }

  useEffect(() => {
    const manejar = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        alternar()
      }
    }
    window.addEventListener('keydown', manejar)
    return () => window.removeEventListener('keydown', manejar)
  }, [])

  return { enPantallaCompleta, activar, desactivar, alternar }
}