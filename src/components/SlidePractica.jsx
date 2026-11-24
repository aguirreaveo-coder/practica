import { useState, useEffect, useRef } from 'react'

function SlidePractica({ slide }) {
  const [reveladas, setReveladas] = useState(
    Array(slide.ejercicios.length).fill(false)
  )

  // ====== CRONÓMETRO ======
  const DURACION_INICIAL = 10 * 60
  const [tiempoRestante, setTiempoRestante] = useState(DURACION_INICIAL)
  const [corriendo, setCorriendo] = useState(false)
  const intervaloRef = useRef(null)

  useEffect(() => {
    if (corriendo && tiempoRestante > 0) {
      intervaloRef.current = setInterval(() => {
        setTiempoRestante((t) => {
          if (t <= 1) {
            setCorriendo(false)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }

    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current)
    }
  }, [corriendo, tiempoRestante])

  const toggleCronometro = () => {
    if (tiempoRestante === 0) return
    setCorriendo((c) => !c)
  }

  const reiniciarCronometro = () => {
    setCorriendo(false)
    setTiempoRestante(DURACION_INICIAL)
  }

  const formatearTiempo = (segundos) => {
    const min = Math.floor(segundos / 60)
    const seg = segundos % 60
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
  }

  const porcentajeRestante = (tiempoRestante / DURACION_INICIAL) * 100
  const tiempoAgotado = tiempoRestante === 0
  const tiempoBajo = tiempoRestante <= 60 && tiempoRestante > 0
  const tiempoMedio = tiempoRestante <= 180 && tiempoRestante > 60

  let colorCronometro = 'text-green-600 dark:text-green-400'
  let colorFondo = 'bg-green-500/10 border-green-500/30'
  let animacionPulso = ''

  if (tiempoAgotado) {
    colorCronometro = 'text-red-600 dark:text-red-400'
    colorFondo = 'bg-red-500/20 border-red-500/50'
    animacionPulso = 'animate-pulse'
  } else if (tiempoBajo) {
    colorCronometro = 'text-red-600 dark:text-red-400'
    colorFondo = 'bg-red-500/10 border-red-500/40'
    animacionPulso = 'animate-pulse'
  } else if (tiempoMedio) {
    colorCronometro = 'text-yellow-600 dark:text-yellow-400'
    colorFondo = 'bg-yellow-500/10 border-yellow-500/40'
  }

  // ====== PRÁCTICA ======
  const toggleRespuesta = (index) => {
    const nuevas = [...reveladas]
    nuevas[index] = !nuevas[index]
    setReveladas(nuevas)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header: título + cronómetro */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="mb-3 inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-300 text-sm font-mono uppercase tracking-wider font-medium">
            Práctica
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {slide.titulo}
          </h2>
          {slide.formula && (
            <div
              className="mt-3 inline-block rounded-md border px-3 py-2 font-mono text-base font-semibold text-slate-900 dark:text-white"
              style={{
                backgroundColor: 'rgba(245,158,11,0.2)',
                borderColor: 'rgba(245,158,11,0.5)'
              }}
            >
              {slide.formula}
            </div>
          )}
        </div>

        {/* Cronómetro */}
        <div
          className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-colors ${colorFondo} ${animacionPulso}`}
        >
          <div className={`font-mono text-2xl font-bold tabular-nums ${colorCronometro}`}>
            {formatearTiempo(tiempoRestante)}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleCronometro}
              disabled={tiempoAgotado}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                tiempoAgotado
                  ? 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
              title={corriendo ? 'Pausar' : 'Iniciar'}
            >
              {corriendo ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={reiniciarCronometro}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
              title="Reiniciar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de progreso del cronómetro */}
      <div className="mb-6 h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            tiempoAgotado
              ? 'bg-red-600'
              : tiempoBajo
              ? 'bg-red-500'
              : tiempoMedio
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${porcentajeRestante}%` }}
        />
      </div>

      {/* Grid de ejercicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {slide.ejercicios.map((ejercicio, index) => (
          <div
            key={index}
            className="flex flex-col border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 rounded-lg overflow-hidden transition-colors h-full"
          >
            {/* Enunciado */}
            <div className="p-4 flex-1">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-700 dark:text-green-300 flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </span>
                <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed pt-0.5 whitespace-pre-line">
                  {ejercicio.pregunta}
                </p>
              </div>
            </div>

            {/* Botón o respuesta (en el mismo espacio) */}
            <div className="px-4 pb-4">
              {reveladas[index] ? (
                <button
                  onClick={() => toggleRespuesta(index)}
                  className="w-full text-left border-l-4 border-green-500 bg-green-500/10 hover:bg-green-500/20 p-3 rounded-r-md transition-colors cursor-pointer"
                  title="Clic para ocultar la respuesta"
                >
                  <p className="text-[10px] uppercase tracking-wider font-mono text-green-700 dark:text-green-300 font-semibold mb-1">
                    Respuesta (clic para ocultar)
                  </p>
                  <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-line">
                    {ejercicio.respuesta}
                  </p>
                </button>
              ) : (
                <button
                  onClick={() => toggleRespuesta(index)}
                  className="w-full px-3 py-2 rounded-md text-xs font-medium transition-colors bg-green-600 hover:bg-green-500 text-white"
                >
                  ▼ Ver respuesta
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SlidePractica