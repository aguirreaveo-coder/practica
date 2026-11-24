import { useState } from 'react'
import ModalTablaPeriodica from './ModalTablaPeriodica'

function SlideContenido({ slide }) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [imagenAmpliada, setImagenAmpliada] = useState(null)
  const tieneModalTabla = slide.modal === 'tabla-periodica'
  const imagenes = [...(slide.html.matchAll(/<img\b[^>]*>/gi))].map(([etiqueta]) => ({
    src: etiqueta.match(/\bsrc=['"]([^'"]+)['"]/i)?.[1],
    alt: etiqueta.match(/\balt=['"]([^'"]*)['"]/i)?.[1] || slide.titulo,
  })).filter((imagen) => imagen.src)
  const htmlSinImagenes = slide.html.replace(/<img\b[^>]*>/gi, '')

  return (
    <div className={`mx-auto ${imagenes.length ? 'max-w-6xl' : 'max-w-3xl'}`}>
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 dark:text-white tracking-tight">
        {slide.titulo}
      </h2>
      <div className={imagenes.length ? 'grid grid-cols-1 md:grid-cols-[70%_28%] md:gap-[2%] items-start' : ''}>
        <div
          className="prose prose-slate dark:prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlSinImagenes }}
        />

        {imagenes.length > 0 && (
          <div className="flex flex-col gap-4 md:sticky md:top-4">
            {imagenes.map((imagen) => (
              <button
                key={imagen.src}
                type="button"
                onClick={() => setImagenAmpliada(imagen)}
                className="group rounded-lg border border-slate-300 dark:border-white/15 bg-white/70 dark:bg-white/5 p-2 hover:border-blue-400 dark:hover:border-blue-400 transition-colors cursor-zoom-in"
                title="Ampliar imagen"
              >
                <img
                  src={imagen.src}
                  alt={imagen.alt}
                  className="w-full max-h-[32rem] object-contain rounded-md"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {tieneModalTabla && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
          >
            Consultar tabla periódica
          </button>
        </div>
      )}

      {modalAbierto && <ModalTablaPeriodica onCerrar={() => setModalAbierto(false)} />}

      {imagenAmpliada && (
        <div
          className="fixed inset-0 z-50 bg-black/80 p-4 md:p-8 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={() => setImagenAmpliada(null)}
        >
          <button
            type="button"
            onClick={() => setImagenAmpliada(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 px-3 py-1 text-2xl text-white hover:bg-white/20"
            aria-label="Cerrar imagen ampliada"
          >
            ×
          </button>
          <img
            src={imagenAmpliada.src}
            alt={imagenAmpliada.alt}
            className="max-h-full max-w-full object-contain rounded-lg"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default SlideContenido