import { useState, useMemo, useEffect } from 'react'
import elementosData from '../data/modulos/tabla-periodica/elementos.json'

const COLORES_POR_TIPO = {
  'Metal alcalino': { celda: 'bg-blue-500', grad: 'from-blue-500 to-blue-700' },
  'Metal alcalinotérreo': { celda: 'bg-emerald-500', grad: 'from-emerald-500 to-emerald-700' },
  'Metal de transición': { celda: 'bg-purple-500', grad: 'from-purple-500 to-purple-700' },
  'Metal': { celda: 'bg-slate-500', grad: 'from-slate-500 to-slate-700' },
  'Metaloide': { celda: 'bg-amber-500', grad: 'from-amber-500 to-amber-700' },
  'No metal': { celda: 'bg-cyan-500', grad: 'from-cyan-500 to-cyan-700' },
  'Gas noble': { celda: 'bg-red-500', grad: 'from-red-500 to-red-700' },
  'Halógeno': { celda: 'bg-orange-500', grad: 'from-orange-500 to-orange-700' },
  'Lantánido': { celda: 'bg-pink-500', grad: 'from-pink-500 to-pink-700' },
  'Actínido': { celda: 'bg-rose-500', grad: 'from-rose-500 to-rose-700' },
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

// Distribución de electrones por capa según el número atómico
function getDistribucionElectrones(z) {
  const capacidades = [2, 8, 18, 32, 32, 18, 8]
  const capas = []
  let restantes = z

  for (const capacidad of capacidades) {
    if (restantes <= 0) break
    const enEstaCapa = Math.min(restantes, capacidad)
    capas.push(enEstaCapa)
    restantes -= enEstaCapa
  }

  return capas
}

function ModalTablaPeriodica({ onCerrar }) {
  const elementos = elementosData.elementos
  const [elementoSeleccionado, setElementoSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const manejar = (e) => {
      if (e.key === 'Escape') {
        if (elementoSeleccionado) {
          setElementoSeleccionado(null)
        } else {
          onCerrar()
        }
      }
    }
    window.addEventListener('keydown', manejar)
    return () => window.removeEventListener('keydown', manejar)
  }, [onCerrar, elementoSeleccionado])

  const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const filtroActivo = busqueda.trim().length > 0
  const busquedaNormalizada = normalizar(busqueda)

  const coincide = (el) => {
    if (!filtroActivo) return false
    return (
      normalizar(el.nombre).includes(busquedaNormalizada) ||
      normalizar(el.simbolo).includes(busquedaNormalizada)
    )
  }

  const elementosPrincipales = useMemo(
    () => elementos.filter((e) => !e.tipo.includes('Lantánido') && !e.tipo.includes('Actínido')),
    [elementos]
  )

  const lantanidos = useMemo(() => elementos.filter((e) => e.tipo.includes('Lantánido')), [elementos])
  const actinidos = useMemo(() => elementos.filter((e) => e.tipo.includes('Actínido')), [elementos])

  const mapaPrincipal = {}
  elementosPrincipales.forEach((el) => {
    mapaPrincipal[`${el.periodo}-${el.grupo}`] = el
  })

  const periodos = [1, 2, 3, 4, 5, 6, 7]
  const grupos = Array.from({ length: 18 }, (_, i) => i + 1)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between gap-4 px-5 py-3 bg-slate-200 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">📋 Tabla Periódica</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Haz clic en cualquier elemento para ver sus datos
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-10 h-10 rounded-md bg-slate-300 dark:bg-slate-600 hover:bg-red-500 hover:text-white text-slate-800 dark:text-white font-bold transition-colors flex items-center justify-center text-lg leading-none shrink-0"
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Buscador */}
        <div className="shrink-0 px-5 py-3 border-b border-slate-300 dark:border-slate-600">
          <div className="relative max-w-md mx-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o símbolo..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg pl-10 pr-10 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
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
                <Fragmento key={`p-${p}`}>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-mono font-bold flex items-center justify-center">
                    {p}
                  </div>
                  {grupos.map((g) => {
                    const el = mapaPrincipal[`${p}-${g}`]
                    if (!el) return <div key={`${p}-${g}`} className="aspect-square rounded bg-transparent" />
                    return (
                      <CeldaElemento
                        key={el.numeroAtomico}
                        el={el}
                        resaltado={coincide(el)}
                        atenuado={filtroActivo && !coincide(el)}
                        onClick={() => setElementoSeleccionado(el)}
                      />
                    )
                  })}
                </Fragmento>
              ))}
            </div>

            {/* Lantánidos */}
            <div className="mt-6">
              <p className="text-xs font-mono uppercase tracking-widest text-pink-600 dark:text-pink-300 font-bold mb-2">
                Lantánidos
              </p>
              <div className="grid gap-1" style={{ gridTemplateColumns: `30px repeat(15, minmax(0, 1fr))` }}>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-mono font-bold flex items-center justify-center">
                  57-71
                </div>
                {lantanidos.map((el) => (
                  <CeldaElemento key={el.numeroAtomico} el={el} resaltado={coincide(el)} atenuado={filtroActivo && !coincide(el)} onClick={() => setElementoSeleccionado(el)} />
                ))}
              </div>
            </div>

            {/* Actínidos */}
            <div className="mt-4">
              <p className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-300 font-bold mb-2">
                Actínidos
              </p>
              <div className="grid gap-1" style={{ gridTemplateColumns: `30px repeat(15, minmax(0, 1fr))` }}>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-mono font-bold flex items-center justify-center">
                  89-103
                </div>
                {actinidos.map((el) => (
                  <CeldaElemento key={el.numeroAtomico} el={el} resaltado={coincide(el)} atenuado={filtroActivo && !coincide(el)} onClick={() => setElementoSeleccionado(el)} />
                ))}
              </div>
            </div>

            {/* Leyenda */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center text-xs">
              {Object.entries(COLORES_POR_TIPO).map(([tipo, colores]) => (
                <div key={tipo} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded ${colores.celda}`}></span>
                  <span className="text-slate-600 dark:text-slate-300">{tipo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 bg-slate-200 dark:bg-slate-700 border-t border-slate-300 dark:border-slate-600">
          <p className="text-xs text-slate-600 dark:text-slate-300 text-center">
            Presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-300 dark:bg-slate-600 font-mono text-[10px]">Esc</kbd> para cerrar
          </p>
        </div>
      </div>

      {/* Modal de detalle del elemento */}
      {elementoSeleccionado && (
        <ModalElemento elemento={elementoSeleccionado} onCerrar={() => setElementoSeleccionado(null)} />
      )}
    </div>
  )
}

function Fragmento({ children }) {
  return <>{children}</>
}

function CeldaElemento({ el, resaltado, atenuado, onClick }) {
  const color = getColorTipo(el.tipo)
  return (
    <button
      onClick={onClick}
      className={`aspect-square rounded flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 hover:shadow-lg ${color.celda} ${
        resaltado ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-800 scale-110 z-10 shadow-xl' : ''
      } ${atenuado ? 'opacity-20' : 'opacity-95'}`}
      title={`${el.nombre} (${el.simbolo})`}
    >
      <span className="text-[8px] opacity-80 leading-none">{el.numeroAtomico}</span>
      <span className="text-xs font-bold leading-tight">{el.simbolo}</span>
    </button>
  )
}

// ===== Modal de detalle con diagrama animado =====
function ModalElemento({ elemento, onCerrar }) {
  const color = getColorTipo(elemento.tipo)
  const distribucion = getDistribucionElectrones(elemento.numeroAtomico)

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con color según tipo */}
        <div className={`bg-gradient-to-br ${color.grad} p-6 relative shrink-0`}>
          <button
            onClick={onCerrar}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white font-bold transition-colors flex items-center justify-center text-lg leading-none z-10"
            title="Cerrar (Esc)"
          >
            ✕
          </button>

          <div className="text-center text-white">
            <p className="text-xs uppercase tracking-widest opacity-80 font-mono mb-1">
              Número atómico
            </p>
            <p className="text-4xl font-bold mb-2">{elemento.numeroAtomico}</p>
            <p className="text-6xl font-bold mb-2 drop-shadow-lg">{elemento.simbolo}</p>
            <p className="text-xl font-semibold">{elemento.nombre}</p>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda: datos */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono font-bold mb-2">
                Datos del elemento
              </p>
              <DatoItem label="Tipo" valor={elemento.tipo} />
              <DatoItem label="Familia" valor={elemento.familia} />
              <div className="grid grid-cols-2 gap-3">
                <DatoItem label="Grupo" valor={elemento.grupo} />
                <DatoItem label="Periodo" valor={elemento.periodo} />
              </div>
              <DatoItem label="Masa atómica" valor={`${elemento.masaAtomica} u`} />
              <DatoItem
                label="Distribución de electrones"
                valor={distribucion.map((n, i) => `Capa ${i + 1}: ${n}`).join(' · ')}
              />
            </div>

            {/* Columna derecha: diagrama del átomo */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono font-bold mb-3">
                Diagrama atómico
              </p>
              <DiagramaAtomo
                numeroAtomico={elemento.numeroAtomico}
                distribucion={distribucion}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DatoItem({ label, valor }) {
  return (
    <div className="border-l-4 border-slate-300 dark:border-slate-600 pl-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono font-bold mb-0.5">
        {label}
      </p>
      <p className="text-slate-900 dark:text-white font-semibold text-sm">{valor}</p>
    </div>
  )
}

// ===== Diagrama animado del átomo =====
function DiagramaAtomo({ numeroAtomico, distribucion }) {
  const tamano = 240
  const centro = tamano / 2
  const radioNucleo = 20
  const capas = distribucion.length

  const radioBase = 40
  const separacion = (centro - radioBase - 12) / Math.max(capas, 1)

  // Protones y neutrones aproximados para el núcleo
  const protones = numeroAtomico
  const neutrones = Math.round(numeroAtomico * 1.2)

  const particulasNucleo = []
  const totalParticulas = Math.min(protones + neutrones, 20)
  for (let i = 0; i < totalParticulas; i++) {
    const angulo = (i / totalParticulas) * Math.PI * 2
    const radioPeq = i < protones ? 6 : 8
    particulasNucleo.push({
      x: centro + Math.cos(angulo) * radioPeq,
      y: centro + Math.sin(angulo) * radioPeq,
      esProton: i < Math.min(protones, totalParticulas / 2),
    })
  }

  return (
    <div className="relative">
      <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} className="drop-shadow-lg">
        {/* Órbitas */}
        {distribucion.map((electrones, i) => {
          const radio = radioBase + (i + 1) * separacion
          return (
            <g key={i}>
              <circle
                cx={centro}
                cy={centro}
                r={radio}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-300 dark:text-slate-600"
              />
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${centro} ${centro}`}
                  to={`360 ${centro} ${centro}`}
                  dur={`${8 + i * 2}s`}
                  repeatCount="indefinite"
                />
                {Array.from({ length: Math.min(electrones, 12) }).map((_, j) => {
                  const angulo = (j / Math.min(electrones, 12)) * Math.PI * 2
                  const x = centro + Math.cos(angulo) * radio
                  const y = centro + Math.sin(angulo) * radio
                  return (
                    <circle
                      key={j}
                      cx={x}
                      cy={y}
                      r="3.5"
                      className="fill-blue-500"
                    />
                  )
                })}
              </g>
            </g>
          )
        })}

        {/* Núcleo */}
        <circle
          cx={centro}
          cy={centro}
          r={radioNucleo}
          className="fill-red-500/20"
        />
        {particulasNucleo.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            className={p.esProton ? 'fill-red-500' : 'fill-slate-500 dark:fill-slate-400'}
          />
        ))}
        <circle
          cx={centro}
          cy={centro}
          r={radioNucleo}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-red-500/60"
        />
      </svg>

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap justify-center gap-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span className="text-slate-600 dark:text-slate-300">Protón</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 dark:bg-slate-400"></span>
          <span className="text-slate-600 dark:text-slate-300">Neutrón</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-slate-600 dark:text-slate-300">Electrón</span>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
        {protones} protones · {neutrones} neutrones (aprox.)
      </p>
    </div>
  )
}

export default ModalTablaPeriodica