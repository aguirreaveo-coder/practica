import { useState, useMemo } from 'react'

// Función para barajar un array (Fisher-Yates)
function barajar(array) {
  const copia = [...array]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function SlidePregunta({ slide }) {
  const [seleccion, setSeleccion] = useState(null)
  const [mostrarResultado, setMostrarResultado] = useState(false)

  // Barajar las opciones una sola vez por slide (memoizado)
  const { opcionesBarajadas, correctaBarajada } = useMemo(() => {
    const opcionesOriginales = slide.opciones.map((texto, idx) => ({
      texto,
      esCorrecta: idx === slide.correcta,
    }))

    const barajadas = barajar(opcionesOriginales)

    return {
      opcionesBarajadas: barajadas.map((o) => o.texto),
      correctaBarajada: barajadas.findIndex((o) => o.esCorrecta),
    }
  }, [slide])

  const responder = (index) => {
    if (mostrarResultado) return
    setSeleccion(index)
    setMostrarResultado(true)
  }

  const esCorrecta = seleccion === correctaBarajada

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 text-sm font-mono uppercase tracking-wider font-medium">
        Pregunta
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-slate-900 dark:text-white tracking-tight">
        {slide.pregunta}
      </h2>

      {/* Cuadrícula 2x2 con opciones barajadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {opcionesBarajadas.map((opcion, index) => {
          let clases = 'border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/30'

          if (mostrarResultado) {
            if (index === correctaBarajada) {
              clases = 'border-green-500/60 bg-green-500/20 text-green-800 dark:text-green-100'
            } else if (index === seleccion) {
              clases = 'border-red-500/60 bg-red-500/20 text-red-800 dark:text-red-100'
            } else {
              clases = 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 opacity-50'
            }
          }

          return (
            <button
              key={index}
              onClick={() => responder(index)}
              disabled={mostrarResultado}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${clases} ${
                !mostrarResultado ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-sm font-semibold shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm leading-snug pt-1">{opcion}</span>
              </div>
            </button>
          )
        })}
      </div>

      {mostrarResultado && (
        <div
          className={`mt-6 p-5 rounded-lg border ${
            esCorrecta
              ? 'border-green-500/40 bg-green-500/10'
              : 'border-red-500/40 bg-red-500/10'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{esCorrecta ? '✅' : '❌'}</span>
            <span className="font-semibold text-lg">
              {esCorrecta ? '¡Correcto!' : 'Incorrecto'}
            </span>
          </div>
          {slide.explicacion && (
            <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed">
              {slide.explicacion}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default SlidePregunta