import { useState, useEffect } from 'react'
import SlideContenido from './SlideContenido'
import SlidePregunta from './SlidePregunta'
import SlideActividad from './SlideActividad'
import SlidePractica from './SlidePractica'
import SlideEjemplo from './SlideEjemplo'
import Pizarron from './Pizarron'
import { usePantallaCompleta } from '../hooks/usePantallaCompleta'
import { useAuth } from '../contexts/AuthContext'

function Slideshow({ clase, cursoId, onSalir }) {
  usePantallaCompleta()
  const { registrarProgreso } = useAuth()

  const [indice, setIndice] = useState(0)
  const [pizarronAbierto, setPizarronAbierto] = useState(false)
  const total = clase.slides.length
  const slide = clase.slides[indice]

  const siguiente = () => {
    if (indice < total - 1) setIndice(indice + 1)
  }
  const anterior = () => {
    if (indice > 0) setIndice(indice - 1)
  }

  useEffect(() => {
    const manejar = (e) => {
      if (pizarronAbierto) return
      if (e.key === 'ArrowRight') siguiente()
      if (e.key === 'ArrowLeft') anterior()
    }
    window.addEventListener('keydown', manejar)
    return () => window.removeEventListener('keydown', manejar)
  }, [indice, pizarronAbierto])

  useEffect(() => {
    const porcentaje = Math.round(((indice + 1) / total) * 100)
    if (cursoId) registrarProgreso(cursoId, porcentaje)
  }, [indice, total, cursoId])

  const renderizarSlide = () => {
    switch (slide.tipo) {
      case 'contenido':
        return <SlideContenido key={indice} slide={slide} />
      case 'pregunta':
        return <SlidePregunta key={indice} slide={slide} />
      case 'actividad':
        return <SlideActividad key={indice} slide={slide} />
      case 'practica':
        return <SlidePractica key={indice} slide={slide} />
      case 'ejemplo':
        return <SlideEjemplo key={indice} slide={slide} />
      default:
        return <p className="text-red-500">Tipo de slide desconocido: {slide.tipo}</p>
    }
  }

  return (
    <div className="relative h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col overflow-hidden transition-colors">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-300/30 dark:from-blue-900/20 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900" />

      <div className="relative flex flex-col flex-1 min-h-0">
        {/* Header compacto con botón de pizarrón */}
        <header className="shrink-0 px-4 py-1 border-b border-slate-300 dark:border-white/10 flex items-center justify-between">
          <button
            onClick={onSalir}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
          >
            ← Salir
          </button>
          <div className="text-sm text-slate-700 dark:text-slate-200 font-medium">
            <button
              onClick={() => setPizarronAbierto(true)}
              className="mr-3 px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
              title="Abrir pizarrón"
            >
              Pizarrón
            </button>
            {indice + 1} / {total}
          </div>
        </header>

        {/* Barra de progreso */}
        <div className="shrink-0 h-0.5 bg-slate-200 dark:bg-white/5">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((indice + 1) / total) * 100}%` }}
          />
        </div>

        {/* Contenido con scroll interno */}
        <main className="flex-1 min-h-0 overflow-y-auto px-6 py-4 flex items-start justify-center">
          <div className="w-full max-w-3xl">
            {renderizarSlide()}
          </div>
        </main>

        {/* Footer compacto */}
        <footer className="shrink-0 px-4 py-1 border-t border-slate-300 dark:border-white/10 flex items-center justify-between bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm">
          <button
            onClick={anterior}
            disabled={indice === 0}
            className="px-3 py-1.5 rounded-md bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-medium"
          >
            ← Anterior
          </button>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden md:block">
            Usa las flechas ← → del teclado
          </span>
          <button
            onClick={siguiente}
            disabled={indice === total - 1}
            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold text-xs"
          >
            Siguiente →
          </button>
        </footer>
      </div>

      {/* Pizarrón overlay con slideId único por slide */}
      <Pizarron
        abierto={pizarronAbierto}
        onCerrar={() => setPizarronAbierto(false)}
        slideId={`${clase.titulo}-${indice}`}
      />
    </div>
  )
}

export default Slideshow