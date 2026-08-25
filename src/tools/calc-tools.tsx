import { useEffect, useState } from 'react'
import { CopyButton } from '../components/ui'

/* ---------------- Calculator (Apple-style + scientific + history) ---------------- */

type Op = '+' | '-' | '×' | '÷' | '^'

function evalOp(a: number, b: number, op: Op): number {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '×': return a * b
    case '÷': return b === 0 ? NaN : a / b
    case '^': return Math.pow(a, b)
  }
}

function fmtNum(n: number): string {
  if (isNaN(n)) return 'Error'
  if (!isFinite(n)) return '∞'
  if (n !== 0 && (Math.abs(n) >= 1e12 || Math.abs(n) < 1e-9)) return n.toExponential(6).replace(/\.?0+e/, 'e')
  const rounded = Math.round(n * 1e10) / 1e10
  return String(rounded).length > 14 ? String(parseFloat(n.toPrecision(10))) : String(rounded)
}

export function Calculator() {
  const [display, setDisplay] = useState('0')
  const [acc, setAcc] = useState<number | null>(null)
  const [op, setOp] = useState<Op | null>(null)
  const [waiting, setWaiting] = useState(true)
  const [error, setError] = useState(false)
  const [sci, setSci] = useState(false)
  const [deg, setDeg] = useState(true)
  const [history, setHistory] = useState<{ expr: string; val: string }[]>([])

  const current = () => parseFloat(display) || 0

  function digit(d: string) {
    if (error) clearAll()
    if (waiting) {
      setDisplay(d)
      setWaiting(false)
    } else if (display.replace(/[-.]/g, '').length < 12) {
      setDisplay(display === '0' ? d : display + d)
    }
  }

  function dot() {
    if (error) clearAll()
    if (waiting) { setDisplay('0.'); setWaiting(false) }
    else if (!display.includes('.')) setDisplay(display + '.')
  }

  function clearAll() {
    setDisplay('0'); setAcc(null); setOp(null); setWaiting(true); setError(false)
  }

  function negate() {
    if (display !== '0' && !error) setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display)
  }

  function percent() {
    setDisplay(fmtNum(current() / 100)); setWaiting(false)
  }

  function chooseOp(next: Op) {
    if (error) return
    const val = current()
    if (op !== null && acc !== null && !waiting) {
      const r = evalOp(acc, val, op)
      if (isNaN(r)) { setError(true); setDisplay('Error'); return }
      setAcc(r); setDisplay(fmtNum(r))
    } else if (acc === null || op === null) {
      setAcc(val)
    }
    setOp(next)
    setWaiting(true)
  }

  function equals() {
    if (error || op === null || acc === null) return
    const val = current()
    const r = evalOp(acc, val, op)
    if (isNaN(r)) { setError(true); setDisplay('Error'); return }
    setHistory((h) => [{ expr: `${fmtNum(acc)} ${op} ${fmtNum(val)}`, val: fmtNum(r) }, ...h].slice(0, 20))
    setDisplay(fmtNum(r)); setAcc(null); setOp(null); setWaiting(true)
  }

  function unary(label: string) {
    if (error) return
    let v = current()
    const rad = deg ? (v * Math.PI) / 180 : v
    switch (label) {
      case 'sin': v = Math.sin(rad); break
      case 'cos': v = Math.cos(rad); break
      case 'tan': v = Math.tan(rad); break
      case 'ln': v = v > 0 ? Math.log(v) : NaN; break
      case 'log': v = v > 0 ? Math.log10(v) : NaN; break
      case '√': v = v >= 0 ? Math.sqrt(v) : NaN; break
      case 'x²': v = v * v; break
      case '1/x': v = v === 0 ? NaN : 1 / v; break
      case 'π': setDisplay(fmtNum(Math.PI)); setWaiting(false); return
      case 'e': setDisplay(fmtNum(Math.E)); setWaiting(false); return
      case 'n!': {
        if (v < 0 || v !== Math.round(v) || v > 170) { setError(true); setDisplay('Error'); return }
        let f = 1
        for (let i = 2; i <= v; i++) f *= i
        v = f
        break
      }
    }
    if (isNaN(v)) { setError(true); setDisplay('Error'); return }
    setDisplay(fmtNum(v)); setWaiting(false)
  }

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key
      if (/^[0-9]$/.test(k)) digit(k)
      else if (k === '.') dot()
      else if (k === '+') chooseOp('+')
      else if (k === '-') chooseOp('-')
      else if (k === '*') chooseOp('×')
      else if (k === '/') { e.preventDefault(); chooseOp('÷') }
      else if (k === '^') chooseOp('^')
      else if (k === 'Enter' || k === '=') equals()
      else if (k === 'Escape') clearAll()
      else if (k === '%') percent()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const fnKey = 'flex h-14 items-center justify-center rounded-full bg-zinc-200 text-lg font-medium text-zinc-900 transition active:brightness-90 dark:bg-zinc-700 dark:text-white'
  const numKey = 'flex h-14 items-center justify-center rounded-full bg-zinc-300 text-xl font-semibold text-zinc-900 transition hover:bg-zinc-200 active:brightness-90 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'
  const opKey = (active: boolean) =>
    `flex h-14 items-center justify-center rounded-full text-xl font-semibold text-white transition active:brightness-125 ${active ? 'bg-white text-orange-500' : 'bg-orange-500'}`
  const sciKey = 'rounded-lg bg-zinc-100 px-2 py-2.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'

  return (
    <div className="flex flex-col items-start gap-6 lg:flex-row">
      <div className="mx-auto w-full max-w-xs">
        {/* Display */}
        <div className="mb-4 flex min-h-24 items-end justify-end overflow-hidden rounded-2xl bg-zinc-900 px-5 pb-3 pt-6 dark:bg-black">
          <span className={`truncate font-light tabular-nums ${display.length > 9 ? 'text-4xl' : 'text-5xl'} ${error ? 'text-red-400' : 'text-white'}${op && waiting && acc !== null && !error ? ' text-orange-300' : ''}`}>
            {display}{op && waiting && acc !== null && !error ? ` ${op}` : ''}
          </span>
        </div>

        {/* Scientific panel */}
        {sci && (
          <div className="mb-3 grid grid-cols-4 gap-1.5">
            <button className={`${sciKey} ${deg ? '!bg-indigo-100 !text-indigo-600 dark:!bg-indigo-950 dark:!text-indigo-400' : ''}`} onClick={() => setDeg(!deg)}>{deg ? 'DEG' : 'RAD'}</button>
            {['sin', 'cos', 'tan', 'π', 'ln', 'log', 'e', '1/x', '√', 'x²', 'xʸ', 'n!'].map((f) =>
              f === 'xʸ'
                ? <button key={f} className={sciKey} onClick={() => chooseOp('^')}>{f}</button>
                : <button key={f} className={sciKey} onClick={() => unary(f)}>{f}</button>,
            )}
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2">
          <button className={fnKey} onClick={clearAll}>AC</button>
          <button className={fnKey} onClick={negate}>±</button>
          <button className={fnKey} onClick={percent}>%</button>
          <button className={opKey(op === '÷')} onClick={() => chooseOp('÷')}>÷</button>
          {[['7'], ['8'], ['9']].map(([d]) => <button key={d} className={numKey} onClick={() => digit(d)}>{d}</button>)}
          <button className={opKey(op === '×')} onClick={() => chooseOp('×')}>×</button>
          {[['4'], ['5'], ['6']].map(([d]) => <button key={d} className={numKey} onClick={() => digit(d)}>{d}</button>)}
          <button className={opKey(op === '-')} onClick={() => chooseOp('-')}>−</button>
          {[['1'], ['2'], ['3']].map(([d]) => <button key={d} className={numKey} onClick={() => digit(d)}>{d}</button>)}
          <button className={opKey(op === '+')} onClick={() => chooseOp('+')}>+</button>
          <button className={`${numKey} col-span-2`} onClick={() => digit('0')}>
            <span className="pl-5">0</span>
          </button>
          <button className={numKey} onClick={dot}>.</button>
          <button className={opKey(false)} onClick={equals}>=</button>
        </div>

        <div className="mt-3 flex gap-2">
          <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setSci(!sci)}>{sci ? 'Hide scientific' : 'Scientific mode'}</button>
          {!error && display !== '0' && !waiting && (
            <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setDisplay(display.length > 1 ? display.slice(0, -1) : '0')}>⌫ Delete</button>
          )}
        </div>
      </div>

      {/* History tape */}
      <div className="w-full lg:w-64">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">History</h3>
          {history.length > 0 && (
            <button className="text-xs text-zinc-400 underline" onClick={() => setHistory([])}>Clear</button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="card p-4 text-xs text-zinc-400">Your calculations appear here. Click any result to reuse it.</p>
        ) : (
          <ul className="card max-h-80 divide-y divide-zinc-100 overflow-auto dark:divide-zinc-800">
            {history.map((h, i) => (
              <li key={i}>
                <button className="w-full px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => { setDisplay(h.val); setWaiting(false); setError(false) }}>
                  <span className="block text-[11px] text-zinc-400">{h.expr}</span>
                  <span className="block font-mono text-sm font-semibold">{h.val}</span>
                </button>
              </li>
            ))
            }
          </ul>
        )}
      </div>
    </div>
  )
}

/* ---------------- Percentage Calculator ---------------- */

export function PercentageCalculator() {
  const [mode, setMode] = useState<'of' | 'share' | 'change'>('of')
  const [x, setX] = useState('15')
  const [y, setY] = useState('200')

  const nx = parseFloat(x)
  const ny = parseFloat(y)
  const valid = !isNaN(nx) && !isNaN(ny)

  let result: string
  if (!valid) result = '—'
  else if (mode === 'of') result = fmt((nx * ny) / 100)
  else if (mode === 'share') result = ny === 0 ? '—' : `${fmt((nx / ny) * 100)}%`
  else result = nx === 0 ? '—' : `${fmt(((ny - nx) / Math.abs(nx)) * 100)}%`

  const labels = {
    of: ['Percentage (%)', 'Of value'],
    share: ['Value', 'Out of'],
    change: ['From', 'To'],
  } as const

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(
          [
            ['of', 'X% of Y'],
            ['share', 'X is what % of Y'],
            ['change', '% change X → Y'],
          ] as const
        ).map(([m, label]) => (
          <button key={m} className={mode === m ? 'btn-primary px-3 py-1.5 text-xs sm:text-sm' : 'btn-secondary px-3 py-1.5 text-xs sm:text-sm'} onClick={() => setMode(m)}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="label">{labels[mode][0]}</span>
          <input type="number" className="input" value={x} onChange={(e) => setX(e.target.value)} />
        </div>
        <div>
          <span className="label">{labels[mode][1]}</span>
          <input type="number" className="input" value={y} onChange={(e) => setY(e.target.value)} />
        </div>
      </div>
      <div className="card p-8 text-center">
        <span className="text-sm text-zinc-500">Result</span>
        <p className="mt-1 text-5xl font-extrabold tabular-nums text-indigo-600 dark:text-indigo-400">{result}</p>
      </div>
    </div>
  )
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

/* ---------------- Loan / EMI Calculator ---------------- */

const money = (n: number) =>
  '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })

export function LoanCalculator() {
  const [amount, setAmount] = useState(25000)
  const [rate, setRate] = useState(7.5)
  const [years, setYears] = useState(5)

  const i = rate / 1200
  const n = years * 12
  const emi =
    n === 0 ? 0 : i === 0 ? amount / n : (amount * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1)
  const totalPay = emi * n
  const totalInterest = totalPay - amount

  // yearly schedule
  const schedule: { year: number; interest: number; principal: number; balance: number }[] = []
  if (n > 0 && emi > 0) {
    let balance = amount
    for (let y = 1; y <= years; y++) {
      let yi = 0
      let yp = 0
      for (let m = 0; m < 12 && balance > 0; m++) {
        const int = balance * i
        const prin = Math.min(emi - int, balance)
        yi += int
        yp += prin
        balance -= prin
      }
      schedule.push({ year: y, interest: yi, principal: yp, balance: Math.max(0, balance) })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <span className="label">Loan amount ($)</span>
          <input type="number" min={0} className="input" value={amount} onChange={(e) => setAmount(Math.max(0, +e.target.value))} />
        </div>
        <div>
          <span className="label">Annual rate (%)</span>
          <input type="number" min={0} step="0.1" className="input" value={rate} onChange={(e) => setRate(Math.max(0, +e.target.value))} />
        </div>
        <div>
          <span className="label">Term (years)</span>
          <input type="number" min={1} max={40} className="input" value={years} onChange={(e) => setYears(Math.min(40, Math.max(1, +e.target.value)))} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/50">
          <div className="text-xl font-bold tabular-nums text-indigo-700 dark:text-indigo-300">{money(emi)}</div>
          <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-500">Monthly payment</div>
        </div>
        <div className="card p-4">
          <div className="text-xl font-bold tabular-nums">{money(totalInterest)}</div>
          <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Total interest</div>
        </div>
        <div className="card p-4">
          <div className="text-xl font-bold tabular-nums">{money(totalPay)}</div>
          <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Total paid</div>
        </div>
      </div>

      <details className="card p-4">
        <summary className="cursor-pointer font-semibold text-sm">Year-by-year amortization schedule</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-right text-xs tabular-nums">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700">
                <th className="py-2 text-left">Year</th>
                <th className="py-2">Principal paid</th>
                <th className="py-2">Interest paid</th>
                <th className="py-2">Remaining balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.year} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  <td className="py-2 text-left font-medium">{row.year}</td>
                  <td className="py-2">{money(row.principal)}</td>
                  <td className="py-2">{money(row.interest)}</td>
                  <td className="py-2">{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}

/* ---------------- BMI Calculator ---------------- */

type BmiCat = { label: string; cls: string }

function bmiCategory(bmi: number): BmiCat {
  if (bmi < 18.5) return { label: 'Underweight', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' }
  if (bmi < 25) return { label: 'Normal weight', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' }
  if (bmi < 30) return { label: 'Overweight', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' }
  return { label: 'Obese', cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' }
}

export function BmiCalculator() {
  const [imperial, setImperial] = useState(false)
  const [cm, setCm] = useState(175)
  const [ft, setFt] = useState(5)
  const [inch, setInch] = useState(9)
  const [kg, setKg] = useState(72)
  const [lb, setLb] = useState(160)

  const heightM = imperial ? ((ft * 12 + inch) * 2.54) / 100 : cm / 100
  const weightKg = imperial ? lb * 0.453592 : kg
  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 0
  const cat = bmi > 0 ? bmiCategory(bmi) : null
  const healthyLow = 18.5 * heightM * heightM
  const healthyHigh = 24.9 * heightM * heightM

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={!imperial ? 'btn-primary px-4 py-1.5' : 'btn-secondary px-4 py-1.5'} onClick={() => setImperial(false)}>Metric</button>
        <button className={imperial ? 'btn-primary px-4 py-1.5' : 'btn-secondary px-4 py-1.5'} onClick={() => setImperial(true)}>Imperial</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {imperial ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="label">Height (ft)</span>
                <input type="number" className="input" value={ft} onChange={(e) => setFt(+e.target.value)} />
              </div>
              <div>
                <span className="label">Height (in)</span>
                <input type="number" className="input" value={inch} onChange={(e) => setInch(+e.target.value)} />
              </div>
            </div>
            <div>
              <span className="label">Weight (lb)</span>
              <input type="number" className="input" value={lb} onChange={(e) => setLb(+e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="label">Height (cm)</span>
              <input type="number" className="input" value={cm} onChange={(e) => setCm(+e.target.value)} />
            </div>
            <div>
              <span className="label">Weight (kg)</span>
              <input type="number" className="input" value={kg} onChange={(e) => setKg(+e.target.value)} />
            </div>
          </>
        )}
      </div>

      {cat && (
        <div className="card p-8 text-center">
          <p className="text-5xl font-extrabold tabular-nums">{bmi.toFixed(1)}</p>
          <span className={`mt-3 inline-block rounded-full px-4 py-1 text-sm font-semibold ${cat.cls}`}>{cat.label}</span>
          <p className="mt-3 text-sm text-zinc-500">
            Healthy range for your height: {healthyLow.toFixed(0)}–{healthyHigh.toFixed(0)} kg ({(healthyLow * 2.20462).toFixed(0)}–{(healthyHigh * 2.20462).toFixed(0)} lb)
          </p>
        </div>
      )}
      <p className="text-center text-xs text-zinc-400">BMI is a rough screening tool, not a medical diagnosis.</p>
    </div>
  )
}

/* ---------------- Age Calculator ---------------- */

export function AgeCalculator() {
  const today = new Date().toISOString().slice(0, 10)
  const [dob, setDob] = useState('')
  const [asOf, setAsOf] = useState(today)

  function diff(birthStr: string, atStr: string) {
    const b = new Date(birthStr + 'T00:00:00')
    const a = new Date(atStr + 'T00:00:00')
    if (isNaN(b.getTime()) || isNaN(a.getTime()) || a < b) return null
    let y = a.getFullYear() - b.getFullYear()
    let mo = a.getMonth() - b.getMonth()
    let d = a.getDate() - b.getDate()
    if (d < 0) {
      mo--
      d += new Date(a.getFullYear(), a.getMonth(), 0).getDate()
    }
    if (mo < 0) {
      y--
      mo += 12
    }
    const days = Math.floor((a.getTime() - b.getTime()) / 86400000)

    // next birthday
    const nextB = new Date(a.getFullYear(), b.getMonth(), b.getDate())
    if (nextB <= a) nextB.setFullYear(nextB.getFullYear() + 1)
    const toBirthday = Math.ceil((nextB.getTime() - a.getTime()) / 86400000)

    return { y, mo, d, days, toBirthday }
  }

  const r = dob ? diff(dob, asOf) : null

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label">Date of birth</span>
          <input type="date" className="input" value={dob} max={today} onChange={(e) => setDob(e.target.value)} />
        </div>
        <div>
          <span className="label">Age at date (default: today)</span>
          <input type="date" className="input" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </div>
      </div>

      {r && (
        <div className="card p-8 text-center">
          <p className="text-4xl font-extrabold tabular-nums">
            {r.y} <span className="text-lg font-medium text-zinc-500">years</span>{' '}
            {r.mo} <span className="text-lg font-medium text-zinc-500">months</span>{' '}
            {r.d} <span className="text-lg font-medium text-zinc-500">days</span>
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span>🎂 Total days lived: <strong className="text-zinc-900 dark:text-white">{r.days.toLocaleString()}</strong></span>
            <span>⏱️ ≈ {(r.days * 24).toLocaleString()} hours</span>
            <span>🎉 Next birthday in <strong className="text-indigo-500">{r.toBirthday}</strong> days</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Unit Converter ---------------- */

interface UnitCat {
  id: string
  label: string
  units: [string, number][] // name -> factor to base
  defaults: [string, string]
}

const UNIT_CATS: UnitCat[] = [
  { id: 'length', label: 'Length', units: [['mm', 0.001], ['cm', 0.01], ['m', 1], ['km', 1000], ['in', 0.0254], ['ft', 0.3048], ['yd', 0.9144], ['mi', 1609.344]], defaults: ['m', 'ft'] },
  { id: 'mass', label: 'Mass', units: [['mg', 0.000001], ['g', 0.001], ['kg', 1], ['t', 1000], ['oz', 0.02834952], ['lb', 0.453592]], defaults: ['kg', 'lb'] },
  { id: 'temp', label: 'Temperature', units: [['°C', 1], ['°F', 1], ['K', 1]], defaults: ['°C', '°F'] },
  { id: 'data', label: 'Data', units: [['bit', 0.125], ['B', 1], ['KB', 1024], ['MB', 1048576], ['GB', 1073741824], ['TB', 1099511627776]], defaults: ['MB', 'GB'] },
  { id: 'speed', label: 'Speed', units: [['m/s', 1], ['km/h', 0.2777778], ['mph', 0.44704], ['kn', 0.5144444]], defaults: ['km/h', 'mph'] },
  { id: 'area', label: 'Area', units: [['cm²', 0.0001], ['m²', 1], ['ha', 10000], ['km²', 1000000], ['sq ft', 0.09290304], ['acre', 4046.856]], defaults: ['m²', 'sq ft'] },
  { id: 'volume', label: 'Volume', units: [['ml', 0.001], ['l', 1], ['m³', 1000], ['gal (US)', 3.785412], ['cup (US)', 0.2365882], ['fl oz (US)', 0.02957353]], defaults: ['l', 'gal (US)'] },
]

function tempConvert(v: number, from: string, to: string): number {
  let c = v
  if (from === '°F') c = ((v - 32) * 5) / 9
  if (from === 'K') c = v - 273.15
  if (to === '°C') return c
  if (to === '°F') return (c * 9) / 5 + 32
  return c + 273.15
}

export function UnitConverter() {
  const [catId, setCatId] = useState('length')
  const cat = UNIT_CATS.find((c) => c.id === catId)!
  const [from, setFrom] = useState(cat.defaults[0])
  const [to, setTo] = useState(cat.defaults[1])
  const [value, setValue] = useState('1')

  function changeCat(id: string) {
    const next = UNIT_CATS.find((c) => c.id === id)!
    setCatId(id)
    setFrom(next.defaults[0])
    setTo(next.defaults[1])
  }

  const nv = parseFloat(value)
  let out: number | null = null
  if (!isNaN(nv)) {
    if (catId === 'temp') out = tempConvert(nv, from, to)
    else {
      const f = cat.units.find((u) => u[0] === from)?.[1]
      const t = cat.units.find((u) => u[0] === to)?.[1]
      if (f !== undefined && t !== undefined) out = (nv * f) / t
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {UNIT_CATS.map((c) => (
          <button key={c.id} className={catId === c.id ? 'btn-primary px-3 py-1.5' : 'btn-secondary px-3 py-1.5'} onClick={() => changeCat(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <span className="label">Value</span>
          <input type="number" className="input" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div className="w-28">
          <span className="label">From</span>
          <select className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
            {cat.units.map(([u]) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <button
          className="btn-secondary mb-0.5 px-3 py-2"
          title="Swap"
          onClick={() => { setFrom(to); setTo(from) }}
        >
          ⇄
        </button>
        <div className="w-28">
          <span className="label">To</span>
          <select className="input" value={to} onChange={(e) => setTo(e.target.value)}>
            {cat.units.map(([u]) => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="card p-8 text-center">
        <span className="text-sm text-zinc-500">{nv || 0} {from} equals</span>
        <p className="mt-1 text-4xl font-extrabold tabular-nums text-indigo-600 dark:text-indigo-400">
          {out === null ? '—' : Number(out.toPrecision(8)).toLocaleString()} {to}
        </p>
        {out !== null && (
          <div className="mt-4"><CopyButton text={`${out}`} label="Copy result" className="btn-secondary" /></div>
        )}
      </div>
    </div>
  )
}
