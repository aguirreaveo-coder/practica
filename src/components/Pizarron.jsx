import { useRef, useState, useEffect } from 'react'

function Pizarron({ abierto, onCerrar, slideId }) {
  const canvasFondoRef = useRef(null)
  const canvasDibujoRef = useRef(null)
  const [dibujando, setDibujando] = useState(false)
  const [color, setColor] = useState('#000000')
  const [grosor, setGrosor] = useState(3)
  const [borrador, setBorrador] = useState(false)
  const [ultimoPunto, setUltimoPunto] = useState(null)

  const claveGuardado = `pizarron-${slideId || 'general'}`

  // Inicializar los canvas al abrir
  useEffect(() => {
    if (!abierto) return

    const canvasFondo = canvasFondoRef.current
    const canvasDibujo = canvasDibujoRef.current
    if (!canvasFondo || !canvasDibujo) return

    const ctxFondo = canvasFondo.getContext('2d')
    const ctxDibujo = canvasDibujo.getContext('2d')

    // Ajustar tamaño de ambos canvas al contenedor
    const rect = canvasFondo.parentElement.getBoundingClientRect()
    canvasFondo.width = rect.width
    canvasFondo.height = rect.height
    canvasDibujo.width = rect.width
    canvasDibujo.height = rect.height

    // Dibujar la cuadrícula en el canvas de fondo (no se borra nunca)
    dibujarCuadricula(ctxFondo, canvasFondo.width, canvasFondo.height)

    // Cargar dibujo guardado en el canvas de dibujo
    const guardado = localStorage.getItem(claveGuardado)
    if (guardado) {
      const img = new Image()
      img.onload = () => {
        ctxDibujo.drawImage(img, 0, 0)
      }
      img.src = guardado
    } else {
      ctxDibujo.clearRect(0, 0, canvasDibujo.width, canvasDibujo.height)
    }
  }, [abierto, claveGuardado])

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return
    const manejar = (e) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', manejar)
    return () => window.removeEventListener('keydown', manejar)
  }, [abierto, onCerrar])

  const dibujarCuadricula = (ctx, ancho, alto) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, ancho, alto)

    ctx.strokeStyle = 'rgba(100, 116, 139, 0.16)'
    ctx.lineWidth = 1
    const paso = 18

    for (let x = 0; x <= ancho; x += paso) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, alto)
      ctx.stroke()
    }

    for (let y = 0; y <= alto; y += paso) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(ancho, y)
      ctx.stroke()
    }
  }

  const obtenerPunto = (e) => {
    const canvas = canvasDibujoRef.current
    const rect = canvas.getBoundingClientRect()
    const clienteX = e.touches ? e.touches[0].clientX : e.clientX
    const clienteY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clienteX - rect.left,
      y: clienteY - rect.top,
    }
  }

  const empezarDibujo = (e) => {
    e.preventDefault()
    setDibujando(true)
    setUltimoPunto(obtenerPunto(e))
  }

  const dibujar = (e) => {
    if (!dibujando) return
    e.preventDefault()

    const canvas = canvasDibujoRef.current
    const ctx = canvas.getContext('2d')
    const punto = obtenerPunto(e)

    if (borrador) {
      // Borrador real: elimina píxeles del canvas de dibujo
      // La cuadrícula del canvas de fondo permanece intacta
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = grosor * 6
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = grosor
    }

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(ultimoPunto.x, ultimoPunto.y)
    ctx.lineTo(punto.x, punto.y)
    ctx.stroke()

    setUltimoPunto(punto)
  }

  const terminarDibujo = () => {
    if (!dibujando) return
    setDibujando(false)
    setUltimoPunto(null)
    // Resetear modo por si acaso
    const canvas = canvasDibujoRef.current
    const ctx = canvas.getContext('2d')
    ctx.globalCompositeOperation = 'source-over'
    guardar()
  }

  const guardar = () => {
    const canvas = canvasDibujoRef.current
    if (!canvas) return
    try {
      const dataURL = canvas.toDataURL('image/png')
      localStorage.setItem(claveGuardado, dataURL)
    } catch (err) {
      console.warn('No se pudo guardar el pizarrón:', err)
    }
  }

  const limpiar = () => {
    const canvas = canvasDibujoRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    localStorage.removeItem(claveGuardado)
  }

  if (!abierto) return null

  const colores = [
    { valor: '#000000', nombre: 'Negro' },
    { valor: '#dc2626', nombre: 'Rojo' },
    { valor: '#2563eb', nombre: 'Azul' },
    { valor: '#16a34a', nombre: 'Verde' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl shadow-slate-950/30 ring-1 ring-slate-900/10 w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de herramientas */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-1.5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Colores (desactivados si borrador está activo) */}
            <div className={`flex items-center gap-1 p-0.5 rounded-md bg-slate-100 ${borrador ? 'opacity-40 pointer-events-none' : ''}`}>
              {colores.map((c) => (
                <button
                  key={c.valor}
                  onClick={() => setColor(c.valor)}
                  aria-label={`Color ${c.nombre}`}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    color === c.valor
                      ? 'border-blue-600 scale-110 ring-2 ring-blue-500/20'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.valor }}
                  title={c.nombre}
                />
              ))}
            </div>

            {/* Grosores */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-slate-100">
              {[2, 4, 8].map((g) => (
                <button
                  key={g}
                  onClick={() => setGrosor(g)}
                  aria-label={`Grosor ${g}`}
                  className={`w-7 h-6 rounded-md flex items-center justify-center transition-all ${
                    grosor === g
                      ? 'bg-white shadow-sm ring-1 ring-slate-300'
                      : 'hover:bg-white/80'
                  }`}
                  title={`Grosor ${g}`}
                >
                  <span
                    className={`rounded-full ${
                      grosor === g ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                    style={{ width: `${g + 4}px`, height: `${g + 4}px` }}
                  />
                </button>
              ))}
            </div>

            {/* Borrador */}
            <button
              onClick={() => setBorrador(!borrador)}
              aria-pressed={borrador}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 border ${
                borrador
                  ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-500'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
              title="Modo borrador"
            >
              Borrador {borrador ? 'activo' : ''}
            </button>

            {/* Limpiar */}
            <button
              onClick={limpiar}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
            >
              Limpiar
            </button>
          </div>

          {/* Cerrar */}
          <button
            onClick={onCerrar}
            aria-label="Cerrar pizarrón"
            className="w-7 h-7 rounded-md border border-slate-200 bg-slate-100 hover:bg-red-500 hover:border-red-500 hover:text-white text-slate-700 text-sm font-bold transition-colors flex items-center justify-center"
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Área de dibujo: dos canvas superpuestos */}
        <div className="flex-1 relative bg-white overflow-hidden">
          {/* Canvas de fondo: solo cuadrícula, nunca se borra */}
          <canvas
            ref={canvasFondoRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
          {/* Canvas de dibujo: encima, donde se dibuja/borra */}
          <canvas
            ref={canvasDibujoRef}
            className={`absolute inset-0 w-full h-full touch-none ${
              borrador ? 'cursor-cell' : 'cursor-crosshair'
            }`}
            onMouseDown={empezarDibujo}
            onMouseMove={dibujar}
            onMouseUp={terminarDibujo}
            onMouseLeave={terminarDibujo}
            onTouchStart={empezarDibujo}
            onTouchMove={dibujar}
            onTouchEnd={terminarDibujo}
          />
        </div>

      </div>
    </div>
  )
}

export default Pizarron