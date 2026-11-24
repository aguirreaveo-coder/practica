import { useState, useMemo, useRef, useEffect } from 'react'
import elementosData from '../data/modulos/tabla-periodica/elementos.json'
import { usePantallaCompleta } from '../hooks/usePantallaCompleta'

const ELEMENTOS_COMUNES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  31, 32, 33, 34, 35, 36,
  47, 50, 79, 82,
]

const OPCIONES_TIPO = [
  'Metal alcalino',
  'Metal alcalinotérreo',
  'Metal de transición',
  'Metal',
  'Metaloide',
  'No metal',
  'Halógeno',
  'Gas noble',
]

const OPCIONES_FAMILIA = [
  'Alcalinos',
  'Alcalinotérreos',
  'Metales de transición',
  'Metales post-transición',
  'Metaloides',
  'No metales',
  'Halógenos',
  'Gases nobles',
]

const OPCIONES_GRUPO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
const OPCIONES_PERIODO = [1, 2, 3, 4]

const COLORES_POR_TIPO = {
  'Metal alcalino': { grad: 'from-blue-500 to-blue-700', glow: 'shadow-blue-500/50', celda: 'bg-blue-500' },
  'Metal alcalinotérreo': { grad: 'from-emerald-500 to-emerald-700', glow: 'shadow-emerald-500/50', celda: 'bg-emerald-500' },
  'Metal de transición': { grad: 'from-purple-500 to-purple-700', glow: 'shadow-purple-500/50', celda: 'bg-purple-500' },
  'Metal': { grad: 'from-slate-500 to-slate-700', glow: 'shadow-slate-500/50', celda: 'bg-slate-500' },
  'Metaloide': { grad: 'from-amber-500 to-amber-700', glow: 'shadow-amber-500/50', celda: 'bg-amber-500' },
  'No metal': { grad: 'from-cyan-500 to-cyan-700', glow: 'shadow-cyan-500/50', celda: 'bg-cyan-500' },
  'Gas noble': { grad: 'from-red-500 to-red-700', glow: 'shadow-red-500/50', celda: 'bg-red-500' },
  'Halógeno': { grad: 'from-orange-500 to-orange-700', glow: 'shadow-orange-500/50', celda: 'bg-orange-500' },
  'Lantánido': { grad: 'from-pink-500 to-pink-700', glow: 'shadow-pink-500/50', celda: 'bg-pink-500' },
  'Actínido': { grad: 'from-rose-500 to-rose-700', glow: 'shadow-rose-500/50', celda: 'bg-rose-500' },
}

function getColorTipo(tipo) {
  if (COLORES_POR_TIPO[tipo]) return COLORES_POR_TIPO[tipo]
  if (tipo.includes('alcalinotérreo')) return COLORES_POR_TIPO['Metal alcalinotérreo']
  if (tipo.includes('alcalino')) return COLORES_POR_TIPO['Metal alcalino']
  if (tipo.includes('transición')) return COLORES_POR_TIPO['Metal de transición']
  if (tipo.includes('Gas noble')) return COLORES_POR_TIPO['Gas noble']
  if (tipo.includes('Halógeno')) return COLORES_POR_TIPO['Halógeno']
  if (tipo.includes('Metaloide')) return COLORES_POR_TIPO['Metaloide']
  if (tipo.includes('No metal')) return COLORES_POR_TIPO['No metal']
  if (tipo.includes('Lantánido')) return COLORES_POR_TIPO['Lantánido']
  if (tipo.includes('Actínido')) return COLORES_POR_TIPO['Actínido']
  return COLORES_POR_TIPO['Metal']
}

const PREGUNTAS = ['tipo', 'familia', 'grupo', 'periodo']
const ETIQUETAS = {
  tipo: '¿Cuál es el TIPO de este elemento?',
  familia: '¿A qué FAMILIA pertenece este elemento?',
  grupo: '¿En qué GRUPO está este elemento?',
  periodo: '¿En qué PERIODO está este elemento?',
}

function ModoInteractivo({ onSalir }) {
  usePantallaCompleta()

  const todosLosElementos = elementosData.elementos

  const elementosFlash = useMemo(() => {
    return todosLosElementos.filter((e) => ELEMENTOS_COMUNES.includes(e.numeroAtomico))
  }, [todosLosElementos])

  const ordenBarajado = useMemo(() => {
    const copia = [...elementosFlash]
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
    }
    return copia
  }, [elementosFlash])

  const [indice, setIndice] = useState(0)
  const [respuesta, setRespuesta] = useState('')
  const [evaluado, setEvaluado] = useState(false)
  const [finalizado, setFinalizado] = useState(false)
  const [aciertosFinales, setAciertosFinales] = useState(0)
  const [mostrarPista, setMostrarPista] = useState(false)

  const elemento = ordenBarajado[indice]
  const total = ordenBarajado.length

  const campoPreguntado = useMemo(() => {
    return PREGUNTAS[Math.floor(Math.random() * PREGUNTAS.length)]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice])

  const colorTipo = getColorTipo(elemento.tipo)

  const opcionesActuales = {
    tipo: OPCIONES_TIPO,
    familia: OPCIONES_FAMILIA,
    grupo: OPCIONES_GRUPO,
    periodo: OPCIONES_PERIODO,
  }[campoPreguntado]

  const valorCorrecto = elemento[campoPreguntado]

  const esCorrecta =
    campoPreguntado === 'grupo' || campoPreguntado === 'periodo'
      ? Number(respuesta) === valorCorrecto
      : respuesta === valorCorrecto

  const seleccionar = (valor) => {
    if (evaluado) return
    setRespuesta(valor)
  }

  const evaluar = () => {
    if (respuesta === '') return
    setEvaluado(true)
    setMostrarPista(false)
    if (esCorrecta) {
      setAciertosFinales((prev) => prev + 1)
    }
  }

  const siguiente = () => {
    if (indice < total - 1) {
      setIndice(indice + 1)
      setRespuesta('')
      setEvaluado(false)
      setMostrarPista(false)
    } else {
      setFinalizado(true)
    }
  }

  const reiniciar = () => {
    setIndice(0)
    setRespuesta('')
    setEvaluado(false)
    setFinalizado(false)
    setAciertosFinales(0)
    setMostrarPista(false)
  }

  // ====== PANTALLA DE RESUMEN FINAL ======
  if (finalizado) {
    const porcentaje = Math.round((aciertosFinales / total) * 100)

    return (
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex items-center justify-center p-6 overflow-hidden transition-colors">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-300/40 dark:from-purple-900/30 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900" />

        <div className="relative max-w-xl w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">¡Completado!</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-10">Terminaste las {total} cartas</p>

          <div className="mb-8">
            <p className="text-7xl md:text-8xl font-bold tracking-tight mb-2">{porcentaje}%</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm uppercase tracking-widest font-mono">
              Precisión total
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              {aciertosFinales} de {total} correctas
            </p>
          </div>

          <div className="h-3 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden mb-10">
            <div
              className={`h-full transition-all duration-700 ${
                porcentaje >= 70 ? 'bg-green-500' : porcentaje >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>

          <p className="text-slate-600 dark:text-slate-300 mb-8">
            {porcentaje >= 70
              ? '¡Excelente trabajo! Dominas los elementos.'
              : porcentaje >= 50
              ? 'Buen intento, sigue practicando.'
              : 'Repasa las sesiones y vuelve a intentarlo.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reiniciar}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all text-base shadow-lg shadow-purple-500/25"
            >
              🔄 Jugar de nuevo
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

  // ====== PANTALLA DE JUEGO ======
  return (
    <div className="relative h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col overflow-hidden transition-colors">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-300/30 dark:from-purple-900/20 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900" />

      <div className="relative flex flex-col flex-1 min-h-0">
        <header className="shrink-0 px-4 py-3 border-b border-slate-300 dark:border-white/10 flex items-center justify-between">
          <button
            onClick={onSalir}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
          >
            ← Salir
          </button>
          <div className="text-sm font-mono uppercase tracking-widest text-purple-600 dark:text-purple-300 font-bold">
            🎮 Flash Cards
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-200 font-medium">
            {indice + 1} / {total}
          </div>
        </header>

        <div className="shrink-0 h-1 bg-slate-200 dark:bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${((indice + 1) / total) * 100}%` }}
          />
        </div>

        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
          <div className="max-w-5xl mx-auto h-full flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">

              <div className="flex justify-center">
                <div
                  className={`w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br ${colorTipo.grad} ${colorTipo.glow} transition-all duration-500 ${
                    evaluado && esCorrecta ? 'scale-105' : ''
                  }`}
                >
                  <div className="pt-6 pb-2 text-center">
                    <span className="inline-block text-white/95 text-xl font-mono font-bold bg-black/25 px-4 py-1 rounded-full">
                      {elemento.numeroAtomico}
                    </span>
                  </div>
                  <div className="text-center pb-6 px-4">
                    <h1 className="text-7xl md:text-8xl font-bold text-white drop-shadow-lg">
                      {elemento.simbolo}
                    </h1>
                  </div>
                  {evaluado && (
                    <div className="bg-black/30 backdrop-blur-sm px-4 py-4 space-y-2">
                      <p className="text-white text-xl font-bold text-center mb-3">
                        {elemento.nombre}
                      </p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-white text-xs">
                        <div>
                          <p className="text-white/70 uppercase tracking-wider text-[10px] font-mono">Tipo</p>
                          <p className="font-semibold">{elemento.tipo}</p>
                        </div>
                        <div>
                          <p className="text-white/70 uppercase tracking-wider text-[10px] font-mono">Familia</p>
                          <p className="font-semibold">{elemento.familia}</p>
                        </div>
                        <div>
                          <p className="text-white/70 uppercase tracking-wider text-[10px] font-mono">Grupo</p>
                          <p className="font-semibold">{elemento.grupo}</p>
                        </div>
                        <div>
                          <p className="text-white/70 uppercase tracking-wider text-[10px] font-mono">Periodo</p>
                          <p className="font-semibold">{elemento.periodo}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-widest font-mono text-purple-600 dark:text-purple-300 font-bold mb-1">
                    Pregunta {indice + 1}
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {ETIQUETAS[campoPreguntado]}
                  </h2>
                </div>

                <CampoSelect
                  valor={respuesta}
                  opciones={opcionesActuales}
                  onChange={seleccionar}
                  evaluado={evaluado}
                  esCorrecto={esCorrecta}
                  valorCorrecto={valorCorrecto}
                />

                {!evaluado && (
                  <button
                    onClick={() => setMostrarPista(true)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-dashed border-amber-400/60 bg-amber-500/5 hover:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    💡 Ver pista en la tabla periódica
                  </button>
                )}

                {evaluado && (
                  <div className={`text-center p-4 rounded-xl border-2 transition-all ${
                    esCorrecta
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-red-500/50 bg-red-500/10'
                  }`}>
                    <p className="text-sm uppercase tracking-widest font-mono text-slate-600 dark:text-slate-400 mb-1">
                      {esCorrecta ? '¡Correcto!' : 'Incorrecto'}
                    </p>
                    <p className={`text-2xl font-bold ${
                      esCorrecta ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {esCorrecta ? '✓' : `✗ La respuesta era: ${valorCorrecto}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="shrink-0 px-4 py-3 border-t border-slate-300 dark:border-white/10 flex items-center justify-center gap-3 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm">
          {!evaluado ? (
            <button
              onClick={evaluar}
              disabled={respuesta === ''}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-lg shadow-purple-500/25"
            >
              ✓ Verificar respuesta
            </button>
          ) : (
            <button
              onClick={siguiente}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all font-semibold text-sm shadow-lg shadow-purple-500/25"
            >
              {indice < total - 1 ? 'Siguiente carta →' : '🎉 Ver resultados'}
            </button>
          )}
        </footer>
      </div>

      {mostrarPista && (
        <ModalPista elemento={elemento} onCerrar={() => setMostrarPista(false)} />
      )}
    </div>
  )
}

// ===== Dropdown =====
function CampoSelect({ valor, opciones, onChange, evaluado, esCorrecto, valorCorrecto }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const manejar = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', manejar)
    return () => document.removeEventListener('mousedown', manejar)
  }, [])

  const seleccionar = (op) => {
    if (evaluado) return
    onChange(op)
    setAbierto(false)
  }

  let bordeClase = 'border-slate-300 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500/50'
  let fondoClase = 'bg-white dark:bg-slate-800/60'
  let textoClase = valor !== '' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
  let iconoEstado = null

  if (evaluado) {
    if (esCorrecto) {
      bordeClase = 'border-green-500'
      fondoClase = 'bg-green-500/10'
      textoClase = 'text-green-700 dark:text-green-300'
      iconoEstado = '✓'
    } else {
      bordeClase = 'border-red-500'
      fondoClase = 'bg-red-500/10'
      textoClase = 'text-red-700 dark:text-red-300'
      iconoEstado = '✗'
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !evaluado && setAbierto(!abierto)}
        disabled={evaluado}
        className={`w-full px-4 py-3 rounded-xl border-2 text-base font-medium text-left transition-all duration-200 flex items-center justify-between gap-2 ${bordeClase} ${fondoClase} ${textoClase} ${
          !evaluado ? 'cursor-pointer' : 'cursor-default'
        } ${abierto ? 'ring-2 ring-purple-500/30 border-purple-500' : ''}`}
      >
        <span className="truncate">{valor !== '' ? valor : 'Selecciona...'}</span>
        <span className="flex items-center gap-2 shrink-0">
          {iconoEstado && (
            <span className={`text-lg font-bold ${esCorrecto ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {iconoEstado}
            </span>
          )}
          {!evaluado && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </span>
      </button>

      {abierto && (
        <div className="absolute z-50 mt-1.5 w-full max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 shadow-2xl shadow-black/20 dark:shadow-black/50 animate-in">
          {opciones.map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => seleccionar(op)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                valor === op
                  ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ===== Modal de la pista: Tabla periódica =====
function ModalPista({ elemento, onCerrar }) {
  const todosLosElementos = elementosData.elementos

  const elementos = useMemo(() => {
    return todosLosElementos.filter(
      (e) => !e.tipo.includes('Lantánido') && !e.tipo.includes('Actínido')
    )
  }, [todosLosElementos])

  useEffect(() => {
    const manejar = (e) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', manejar)
    return () => window.removeEventListener('keydown', manejar)
  }, [onCerrar])

  const periodos = [1, 2, 3, 4, 5, 6, 7]
  const grupos = Array.from({ length: 18 }, (_, i) => i + 1)

  const mapaElementos = {}
  elementos.forEach((el) => {
    mapaElementos[`${el.periodo}-${el.grupo}`] = el
  })

  const colorCelda = (el) => {
    if (!el) return 'bg-slate-100 dark:bg-slate-800/30'
    const color = getColorTipo(el.tipo)
    return `${color.celda} text-white`
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-slate-200 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">💡 Pista: Tabla Periódica</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              La celda resaltada es el elemento de la carta actual
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-10 h-10 rounded-md bg-slate-300 dark:bg-slate-600 hover:bg-red-500 hover:text-white text-slate-800 dark:text-white font-bold transition-colors flex items-center justify-center text-lg leading-none"
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <div className="min-w-[850px]">
            <div className="grid gap-1" style={{ gridTemplateColumns: `30px repeat(18, minmax(0, 1fr))` }}>
              <div></div>
              {grupos.map((g) => (
                <div key={`g-${g}`} className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-mono font-bold pb-1">
                  {g}
                </div>
              ))}

              {periodos.map((p) => (
                <>
                  <div key={`p-${p}`} className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-mono font-bold flex items-center justify-center">
                    {p}
                  </div>

                  {grupos.map((g) => {
                    const el = mapaElementos[`${p}-${g}`]
                    const esActual = el && el.numeroAtomico === elemento.numeroAtomico

                    if (!el) {
                      return <div key={`${p}-${g}`} className="aspect-square rounded bg-transparent" />
                    }

                    return (
                      <div
                        key={`${p}-${g}`}
                        className={`aspect-square rounded flex flex-col items-center justify-center text-[10px] font-bold ${colorCelda(el)} ${
                          esActual
                            ? 'ring-4 ring-purple-500 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-800 scale-125 z-10 shadow-2xl animate-pulse'
                            : 'opacity-90'
                        } transition-all duration-300`}
                        title={`${el.nombre} (${el.simbolo})`}
                      >
                        <span className="text-[8px] opacity-80">{el.numeroAtomico}</span>
                        <span className="text-xs font-bold">{el.simbolo}</span>
                      </div>
                    )
                  })}
                </>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 justify-center text-xs">
              {Object.entries(COLORES_POR_TIPO)
                .filter(([tipo]) => !tipo.includes('Lantánido') && !tipo.includes('Actínido'))
                .map(([tipo, colores]) => (
                  <div key={tipo} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded ${colores.celda}`}></span>
                    <span className="text-slate-600 dark:text-slate-300">{tipo}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-5 py-3 bg-slate-200 dark:bg-slate-700 border-t border-slate-300 dark:border-slate-600">
          <p className="text-xs text-slate-600 dark:text-slate-300 text-center">
            Busca el elemento <strong className="text-purple-600 dark:text-purple-300">{elemento.simbolo}</strong> en la tabla.
            La celda con el anillo púrpura brillante es la respuesta.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ModoInteractivo