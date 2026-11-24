import { useState, useEffect, useMemo } from 'react'
import Pizarron from './Pizarron'
import { usePantallaCompleta } from '../hooks/usePantallaCompleta'
import { useAuth } from '../contexts/AuthContext'
import { UMBRAL_APROBACION } from '../data/cargarContenido'

// Fisher-Yates: baraja un array
function barajar(array) {
  const copia = [...array]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

// Mezcla las opciones de cada pregunta (mismo patrón que SlidePregunta)
function mezclarPreguntas(preguntas) {
  return preguntas.map((p) => {
    const opcionesOriginales = p.opciones.map((texto, idx) => ({
      texto,
      esCorrecta: idx === p.correcta,
    }))

    const barajadas = barajar(opcionesOriginales)

    return {
      ...p,
      opciones: barajadas.map((o) => o.texto),
      correcta: barajadas.findIndex((o) => o.esCorrecta),
    }
  })
}

function Cuestionario({ cuestionario, cursoId, tipo = 'final', onSalir }) {
  usePantallaCompleta()
  const { registrarCalificacion } = useAuth()

  // Contador de versión: al incrementarlo se fuerza una nueva mezcla
  const [version, setVersion] = useState(0)

  // Se vuelve a mezclar cada vez que cambia "version"
  // (mismo patrón que SlidePregunta con useMemo)
  const preguntasMezcladas = useMemo(
    () => mezclarPreguntas(cuestionario.preguntas),
    [cuestionario.preguntas, version]
  )

  const total = preguntasMezcladas.length

  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState(Array(total).fill(null))
  const [finalizado, setFinalizado] = useState(false)
  const [pizarronAbierto, setPizarronAbierto] = useState(false)

  const pregunta = preguntasMezcladas[indice]
  const respuestaActual = respuestas[indice]
  const yaRespondio = respuestaActual !== null
  const esCorrecta = yaRespondio && respuestaActual === pregunta.correcta

  const responder = (index) => {
    if (yaRespondio) return
    const nuevas = [...respuestas]
    nuevas[indice] = index
    setRespuestas(nuevas)
  }

  const siguiente = () => {
    if (indice < total - 1) setIndice(indice + 1)
  }
  const anterior = () => {
    if (indice > 0) setIndice(indice - 1)
  }

  useEffect(() => {
    const manejar = (e) => {
      if (finalizado) return
      if (pizarronAbierto) return

      if (e.key === 'ArrowRight') {
        if (yaRespondio && indice < total - 1) {
          setIndice(indice + 1)
        }
      }
      if (e.key === 'ArrowLeft') {
        if (indice > 0) setIndice(indice - 1)
      }
    }
    window.addEventListener('keydown', manejar)
    return () => window.removeEventListener('keydown', manejar)
  }, [indice, yaRespondio, finalizado, total, pizarronAbierto])

  const calcularPuntaje = () => {
    return respuestas.reduce((acc, resp, i) => {
      return acc + (resp === preguntasMezcladas[i].correcta ? 1 : 0)
    }, 0)
  }

  useEffect(() => {
    if (!finalizado) return
    const puntaje = calcularPuntaje()
    const porcentaje = Math.round((puntaje / total) * 100)
    registrarCalificacion(cursoId, tipo, porcentaje)
  }, [finalizado])

  const reiniciar = () => {
    setIndice(0)
    setRespuestas(Array(total).fill(null))
    setFinalizado(false)
    setVersion((v) => v + 1) // ← fuerza nueva mezcla
  }

  // ====== RESULTADO ======
  if (finalizado) {
    const puntaje = calcularPuntaje()
    const porcentaje = Math.round((puntaje / total) * 100)

    return (
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex items-center justify-center p-6 overflow-hidden transition-colors">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-300/30 dark:from-blue-900/20 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900" />

        <div className="relative max-w-2xl w-full text-center">
          <div className="mb-8">
            <p className="text-slate-600 dark:text-slate-300 text-sm uppercase tracking-widest mb-4 font-mono font-medium">
              Resultado final
            </p>
            <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight">
              {puntaje} <span className="text-slate-400 dark:text-slate-500">/ {total}</span>
            </h1>
            <p className="text-2xl text-slate-700 dark:text-slate-200 font-medium">{porcentaje}%</p>
          </div>

          <div className="h-3 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden mb-10">
            <div
              className={`h-full transition-all duration-700 ${
                porcentaje >= UMBRAL_APROBACION ? 'bg-green-500' : porcentaje >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>

          <p className="text-slate-700 dark:text-slate-200 text-lg mb-8">
            {porcentaje >= UMBRAL_APROBACION
              ? '¡Excelente trabajo! 🎉'
              : porcentaje >= 50
              ? 'Buen intento, sigue repasando. 💪'
              : 'Repasa el contenido y vuelve a intentarlo. 📚'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reiniciar}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors text-base"
            >
              🔄 Reintentar
            </button>
            <button
              onClick={onSalir}
              className="px-6 py-3 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-transparent font-semibold transition-colors text-base"
            >
              ← Volver al menú
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ====== PREGUNTA ======
  const esUltima = indice === total - 1
  const todasRespondidas = respuestas.every((r) => r !== null)

  return (
    <div className="relative h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col overflow-hidden transition-colors">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-300/30 dark:from-blue-900/20 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900" />

      <div className="relative flex flex-col flex-1 min-h-0">
        {/* Header compacto con botón de pizarrón */}
        <header className="shrink-0 px-4 py-2 border-b border-slate-300 dark:border-white/10 flex items-center justify-between">
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
            Pregunta {indice + 1} / {total}
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
            <h2 className="text-lg md:text-xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">
              {pregunta.pregunta}
            </h2>

            {/* Grid 2x2 con opciones ya mezcladas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pregunta.opciones.map((opcion, index) => {
                let clases = 'border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/30'

                if (yaRespondio) {
                  if (index === pregunta.correcta) {
                    clases = 'border-green-500/60 bg-green-500/20 text-green-800 dark:text-green-100'
                  } else if (index === respuestaActual) {
                    clases = 'border-red-500/60 bg-red-500/20 text-red-800 dark:text-red-100'
                  } else {
                    clases = 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 opacity-50'
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => responder(index)}
                    disabled={yaRespondio}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${clases} ${
                      !yaRespondio ? 'cursor-pointer' : 'cursor-default'
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

            {/* Feedback */}
            {yaRespondio && (
              <div
                className={`mt-4 p-4 rounded-lg border ${
                  esCorrecta
                    ? 'border-green-500/40 bg-green-500/10'
                    : 'border-red-500/40 bg-red-500/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{esCorrecta ? '✅' : '❌'}</span>
                  <span className="font-semibold text-sm">
                    {esCorrecta ? '¡Correcto!' : 'Incorrecto'}
                  </span>
                </div>
                {pregunta.explicacion && (
                  <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                    {pregunta.explicacion}
                  </p>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Footer compacto */}
        <footer className="shrink-0 px-4 py-2 border-t border-slate-300 dark:border-white/10 flex items-center justify-between bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm">
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

          {esUltima ? (
            <button
              onClick={() => setFinalizado(true)}
              disabled={!todasRespondidas}
              className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold text-xs"
            >
              Finalizar
            </button>
          ) : (
            <button
              onClick={siguiente}
              disabled={!yaRespondio}
              className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold text-xs"
            >
              Siguiente →
            </button>
          )}
        </footer>
      </div>

      {/* Pizarrón overlay */}
      <Pizarron
        abierto={pizarronAbierto}
        onCerrar={() => setPizarronAbierto(false)}
        slideId={`cuestionario-${cuestionario.titulo}-${indice}`}
      />
    </div>
  )
}

export default Cuestionario