import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    // Leer preferencia guardada, o 'dark' por defecto
    const guardado = localStorage.getItem('sandbox-tema')
    return guardado || 'dark'
  })

  // Aplicar/quitar la clase 'dark' del <html> y guardar en localStorage
  useEffect(() => {
    const root = document.documentElement
    if (tema === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('sandbox-tema', tema)
  }, [tema])

  const alternarTema = () => {
    setTema((actual) => (actual === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}