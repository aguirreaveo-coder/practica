function SlideActividad({ slide }) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 inline-block px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 text-sm font-mono uppercase tracking-wider font-medium">
        Actividad
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">
        {slide.titulo}
      </h2>

      <div className="p-6 rounded-lg border border-yellow-500/40 dark:border-yellow-500/30 bg-yellow-500/10 dark:bg-yellow-500/5">
        <p className="text-slate-800 dark:text-slate-100 text-lg leading-relaxed whitespace-pre-line mb-6">
          {slide.instrucciones}
        </p>

        {slide.preguntas && (
          <div className="flex flex-wrap gap-3">
            {slide.preguntas.map((num) => (
              <div
                key={num}
                className="w-16 h-16 rounded-lg border-2 border-yellow-500/50 bg-yellow-500/20 flex items-center justify-center"
              >
                <span className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                  {num}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SlideActividad