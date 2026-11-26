function SlideEjemplo({ slide }) {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">
        {slide.titulo}
      </h2>

      {/* Grid 2 columnas: ejemplo (izq) y espacio de trabajo (der) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Columna izquierda: enunciado del ejemplo */}
        <div className="p-6 rounded-lg border border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/5">
          <p className="text-slate-800 dark:text-slate-100 text-lg leading-relaxed whitespace-pre-line">
            {slide.enunciado}
          </p>

          {slide.html && (
            <div
              className="mt-4"
              dangerouslySetInnerHTML={{ __html: slide.html }}
            />
          )}

          {slide.datos && (
            <div className="mt-4 pt-4 border-t border-emerald-500/20">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2 uppercase tracking-wide">
                Datos
              </p>
              <ul className="text-slate-800 dark:text-slate-100 text-lg leading-relaxed space-y-1">
                {slide.datos.map((dato, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">•</span>
                    <span>{dato}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Columna derecha: espacio en blanco para resolver en el pizarrón */}
        <div className="rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.02] min-h-[280px]" />
      </div>
    </div>
  )
}

export default SlideEjemplo