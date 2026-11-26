import { useReducer } from 'react'

const ESTADO_INICIAL = {
  pantalla: '0',
  expresion: '',
  acumulado: null,
  operador: null,
  esperaOperando: false,
  operadorRepetido: null,
  operandoRepetido: null,
  resultadoMostrado: false,
  raizReciente: false,
  prefijoRaiz: '',
}

const SIMBOLOS = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
}

function formatearNumero(numero) {
  if (!Number.isFinite(numero)) return null
  return String(Number(numero.toPrecision(12)))
}

function calcular(a, b, operador) {
  switch (operador) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': return b === 0 ? null : a / b
    default: return b
  }
}

function reducer(estado, accion) {
  if (accion.tipo === 'limpiar') return ESTADO_INICIAL

  if (accion.tipo === 'digito') {
    const digito = accion.valor
    if (estado.raizReciente) {
      return {
        ...estado,
        pantalla: digito,
        expresion: `${estado.prefijoRaiz}${digito}`,
        esperaOperando: false,
        operadorRepetido: null,
        operandoRepetido: null,
        raizReciente: false,
        prefijoRaiz: '',
      }
    }

    if (estado.resultadoMostrado || estado.pantalla === 'Error') {
      return {
        ...ESTADO_INICIAL,
        pantalla: digito,
        expresion: digito,
      }
    }

    if (estado.esperaOperando) {
      return {
        ...estado,
        pantalla: digito,
        expresion: `${estado.expresion} ${digito}`,
        esperaOperando: false,
        resultadoMostrado: false,
        operadorRepetido: null,
        operandoRepetido: null,
      }
    }

    const nuevaPantalla = estado.pantalla === '0'
      ? digito
      : estado.pantalla === '-0'
        ? `-${digito}`
      : `${estado.pantalla}${digito}`
    const nuevaExpresion = estado.expresion === ''
      ? nuevaPantalla
      : `${estado.expresion.slice(0, -estado.pantalla.length)}${nuevaPantalla}`

    return {
      ...estado,
      pantalla: nuevaPantalla,
      expresion: nuevaExpresion,
    }
  }

  if (accion.tipo === 'signo') {
    if (estado.pantalla === 'Error') return estado

    const nuevaPantalla = estado.pantalla.startsWith('-')
      ? estado.pantalla.slice(1)
      : `-${estado.pantalla}`
    const prefijo = estado.raizReciente
      ? estado.prefijoRaiz
      : estado.resultadoMostrado
        ? ''
        : estado.esperaOperando
          ? `${estado.expresion} `
          : estado.expresion.slice(0, -estado.pantalla.length)

    return {
      ...estado,
      pantalla: nuevaPantalla,
      expresion: `${prefijo}${nuevaPantalla}`,
      esperaOperando: false,
      operadorRepetido: null,
      operandoRepetido: null,
      raizReciente: false,
      prefijoRaiz: '',
    }
  }

  if (accion.tipo === 'decimal') {
    if (estado.raizReciente) {
      return {
        ...estado,
        pantalla: '0.',
        expresion: `${estado.prefijoRaiz}0.`,
        esperaOperando: false,
        operadorRepetido: null,
        operandoRepetido: null,
        raizReciente: false,
        prefijoRaiz: '',
      }
    }

    if (estado.resultadoMostrado || estado.pantalla === 'Error') {
      return {
        ...ESTADO_INICIAL,
        pantalla: '0.',
        expresion: '0.',
      }
    }

    if (estado.esperaOperando) {
      return {
        ...estado,
        pantalla: '0.',
        expresion: `${estado.expresion} 0.`,
        esperaOperando: false,
        resultadoMostrado: false,
        operadorRepetido: null,
        operandoRepetido: null,
      }
    }
    if (estado.pantalla.includes('.')) return estado

    const nuevaPantalla = `${estado.pantalla}.`
    const nuevaExpresion = estado.expresion === ''
      ? nuevaPantalla
      : `${estado.expresion.slice(0, -estado.pantalla.length)}${nuevaPantalla}`

    return {
      ...estado,
      pantalla: nuevaPantalla,
      expresion: nuevaExpresion,
      resultadoMostrado: false,
      operadorRepetido: null,
      operandoRepetido: null,
    }
  }

  if (accion.tipo === 'raiz') {
    if (estado.pantalla === 'Error') return estado

    const numero = Number(estado.pantalla)
    if (numero < 0) {
      return {
        ...ESTADO_INICIAL,
        pantalla: 'Error',
        expresion: 'Error: raíz de un número negativo',
      }
    }

    const resultado = formatearNumero(Math.sqrt(numero))
    if (resultado === null) {
      return {
        ...ESTADO_INICIAL,
        pantalla: 'Error',
        expresion: 'Error: resultado fuera de rango',
      }
    }

    const prefijo = estado.raizReciente
      ? estado.prefijoRaiz
      : estado.esperaOperando
        ? `${estado.expresion} `
        : estado.resultadoMostrado
          ? ''
          : estado.expresion.slice(0, -estado.pantalla.length)
    const operando = estado.raizReciente
      ? estado.expresion.slice(estado.prefijoRaiz.length)
      : estado.pantalla

    return {
      ...estado,
      pantalla: resultado,
      expresion: `${prefijo}√(${operando})`,
      esperaOperando: false,
      operadorRepetido: null,
      operandoRepetido: null,
      resultadoMostrado: false,
      raizReciente: true,
      prefijoRaiz: prefijo,
    }
  }

  if (accion.tipo === 'operador') {
    if (estado.pantalla === 'Error') return estado
    const nuevoOperador = accion.valor
    const simbolo = SIMBOLOS[nuevoOperador]

    if (estado.operador && !estado.esperaOperando) {
      const resultado = formatearNumero(
        calcular(estado.acumulado, Number(estado.pantalla), estado.operador)
      )
      if (resultado === null) {
        const mensaje = estado.operador === '/' && Number(estado.pantalla) === 0
          ? 'Error: división entre cero'
          : 'Error: resultado fuera de rango'
        return { ...ESTADO_INICIAL, pantalla: 'Error', expresion: mensaje }
      }

      return {
        ...estado,
        pantalla: resultado,
        expresion: `${estado.expresion} = ${resultado} ${simbolo}`,
        acumulado: Number(resultado),
        operador: nuevoOperador,
        esperaOperando: true,
        operadorRepetido: null,
        operandoRepetido: null,
        resultadoMostrado: false,
        raizReciente: false,
        prefijoRaiz: '',
      }
    }

    if (estado.esperaOperando && estado.operador) {
      return {
        ...estado,
        expresion: `${estado.expresion.slice(0, -SIMBOLOS[estado.operador].length)}${simbolo}`,
        operador: nuevoOperador,
      }
    }

    const expresionBase = estado.resultadoMostrado ? estado.pantalla : estado.expresion || estado.pantalla
    return {
      ...estado,
      expresion: `${expresionBase} ${simbolo}`,
      acumulado: Number(estado.pantalla),
      operador: nuevoOperador,
      esperaOperando: true,
      operadorRepetido: null,
      operandoRepetido: null,
      resultadoMostrado: false,
      raizReciente: false,
      prefijoRaiz: '',
    }
  }

  if (accion.tipo === 'igual') {
    let operador = estado.operador
    let a = estado.acumulado
    let b = Number(estado.pantalla)
    let expresionBase = estado.expresion

    if (!operador && estado.resultadoMostrado && estado.operadorRepetido) {
      operador = estado.operadorRepetido
      a = Number(estado.pantalla)
      b = estado.operandoRepetido
      expresionBase = estado.pantalla
    } else if (estado.esperaOperando && operador) {
      b = a
    }

    if (!operador || a === null) return estado

    const resultado = formatearNumero(calcular(a, b, operador))
    if (resultado === null) {
      const mensaje = operador === '/' && b === 0
        ? 'Error: división entre cero'
        : 'Error: resultado fuera de rango'
      return {
        ...ESTADO_INICIAL,
        pantalla: 'Error',
        expresion: mensaje,
      }
    }
    const expresionFinal = estado.resultadoMostrado
      ? `${expresionBase} ${SIMBOLOS[operador]} ${String(b)} = ${resultado}`
      : estado.esperaOperando
        ? `${expresionBase} ${String(b)} = ${resultado}`
        : `${expresionBase} = ${resultado}`

    return {
      ...estado,
      pantalla: resultado,
      expresion: expresionFinal,
      acumulado: null,
      operador: null,
      esperaOperando: true,
      operadorRepetido: operador,
      operandoRepetido: b,
      resultadoMostrado: true,
      raizReciente: false,
      prefijoRaiz: '',
    }
  }

  return estado
}

function Calculadora({ onCerrar }) {
  const [estado, dispatch] = useReducer(reducer, ESTADO_INICIAL)
  const botones = [
    ['C', 'limpiar'], ['±', 'signo'], ['√', 'raiz'], ['÷', '/'],
    ['7', '7'], ['8', '8'], ['9', '9'], ['×', '*'],
    ['4', '4'], ['5', '5'], ['6', '6'], ['−', '-'],
    ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+'],
    ['0', '0'], ['.', 'decimal'], ['=', 'igual'],
  ]

  const manejarBoton = (valor) => {
    if (valor === 'limpiar' || valor === 'igual' || valor === 'decimal') {
      dispatch({ tipo: valor })
    } else if (valor === 'signo') {
      dispatch({ tipo: 'signo' })
    } else if (valor === 'raiz') {
      dispatch({ tipo: 'raiz' })
    } else if (['+', '-', '*', '/'].includes(valor)) {
      dispatch({ tipo: 'operador', valor })
    } else {
      dispatch({ tipo: 'digito', valor })
    }
  }

  return (
    <div className="absolute bottom-12 left-4 z-30 w-64 rounded-xl border border-slate-300 bg-white p-3 shadow-2xl dark:border-white/15 dark:bg-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Calculadora
        </span>
        <button
          type="button"
          onClick={onCerrar}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
          aria-label="Cerrar calculadora"
        >
          ×
        </button>
      </div>
      <div className="mb-3 min-h-[4.5rem] overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 text-right text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="min-h-5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
          {estado.expresion || '0'}
        </div>
        <div className="mt-1 min-h-8 whitespace-nowrap font-mono text-2xl font-bold" aria-live="polite">
          {estado.pantalla}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {botones.map(([etiqueta, valor]) => (
          <button
            key={etiqueta}
            type="button"
            onClick={() => manejarBoton(valor)}
            aria-label={
              valor === 'raiz'
                ? 'Raíz cuadrada'
                : valor === 'signo'
                  ? 'Cambiar signo'
                  : etiqueta
            }
            title={
              valor === 'raiz'
                ? 'Raíz cuadrada'
                : valor === 'signo'
                  ? 'Cambiar signo'
                  : undefined
            }
            className={`h-10 ${etiqueta === '0' ? 'col-span-2' : ''} rounded-lg text-base font-semibold transition-colors ${
              ['+', '−', '×', '÷', '√', '±'].includes(etiqueta)
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : etiqueta === '='
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : etiqueta === 'C'
                    ? 'bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:text-red-300'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Calculadora
