import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const args = process.argv.slice(2)
const opcion = (nombre, porDefecto) => {
  const i = args.indexOf(`--${nombre}`)
  return i >= 0 ? args[i + 1] : porDefecto
}
const bandera = (nombre) => args.includes(`--${nombre}`)

const UMBRAL_ATENCION = 40
const UMBRAL_CRITICO = 70

const carpetaMetricas = opcion('metricas', join('.workspace', 'metricas'))
const rutaVentanas = join(carpetaMetricas, 'ventanas.json')
const rutaHistorial = join(carpetaMetricas, 'agentes.jsonl')
const ventanaManual = opcion('ventana') ? Number(opcion('ventana')) : null

const carpetaProyecto = join(homedir(), '.claude', 'projects', process.cwd().replace(/[^a-zA-Z0-9]/g, '-'))

const sesionMasReciente = () =>
  readdirSync(carpetaProyecto)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => ({ id: f.replace('.jsonl', ''), t: statSync(join(carpetaProyecto, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0]?.id

const sesion = opcion('sesion', sesionMasReciente())
if (!sesion) {
  console.error(`Sin sesiones en ${carpetaProyecto}`)
  process.exit(1)
}

const salida = opcion('salida', join('.workspace', 'contexto', `flujo-${sesion.slice(0, 8)}.html`))

const leerJsonl = (ruta) =>
  readFileSync(ruta, 'utf8')
    .split('\n')
    .filter(Boolean)
    .flatMap((linea) => {
      try {
        return [JSON.parse(linea)]
      } catch {
        return []
      }
    })

const leerJson = (ruta, porDefecto) => (existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : porDefecto)

const versionClaude = () => execFileSync('claude', ['--version'], { encoding: 'utf8' }).trim()

const sondearVentanas = (modelo) => {
  const resultado = JSON.parse(
    execFileSync(
      'claude',
      ['-p', 'responde solo: ok', '--model', modelo, '--output-format', 'json', '--no-session-persistence', '--tools', ''],
      { cwd: tmpdir(), encoding: 'utf8', timeout: 180_000 },
    ),
  )
  const version = versionClaude()
  return Object.entries(resultado.modelUsage ?? {})
    .filter(([, uso]) => uso.contextWindow)
    .map(([id, uso]) => [
      id,
      {
        ventana: uso.contextWindow,
        maxSalida: uso.maxOutputTokens ?? null,
        fuente: 'claude -p --output-format json → modelUsage[modelo].contextWindow',
        capturadoEn: new Date().toISOString(),
        claudeVersion: version,
        costoSondeoUSD: resultado.total_cost_usd ?? null,
      },
    ])
}

const analizar = (ruta, base) => {
  const peticiones = new Map()
  const lanzadas = new Set()
  const porHerramienta = {}
  let inicio = ''
  let fin = ''
  let costoSesion = null

  for (const fila of leerJsonl(ruta)) {
    if (fila.timestamp) {
      inicio ||= fila.timestamp
      fin = fila.timestamp
    }
    if (fila.type === 'cost-state') costoSesion = fila.modelUsage ?? costoSesion
    const msg = fila.message
    if (msg?.role !== 'assistant') continue
    for (const bloque of Array.isArray(msg.content) ? msg.content : []) {
      if (bloque.type === 'tool_use') {
        lanzadas.add(bloque.id)
        porHerramienta[bloque.name] = (porHerramienta[bloque.name] ?? 0) + 1
      }
    }
    const u = msg.usage
    if (!u) continue
    const contexto = (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0)
    if (contexto === 0) continue
    peticiones.set(fila.requestId ?? fila.uuid, {
      modelo: msg.model ?? '',
      contexto,
      entrada: u.input_tokens ?? 0,
      cacheCreacion: u.cache_creation_input_tokens ?? 0,
      cacheLectura: u.cache_read_input_tokens ?? 0,
      salida: u.output_tokens ?? 0,
    })
  }

  const serie = [...peticiones.values()]
  const suma = (campo) => serie.reduce((s, p) => s + p[campo], 0)
  return {
    ...base,
    modelos: [...new Set(serie.map((p) => p.modelo).filter(Boolean))],
    serie: serie.map((p) => ({ contexto: p.contexto, modelo: p.modelo })),
    picoTokens: Math.max(0, ...serie.map((p) => p.contexto)),
    finalTokens: serie.at(-1)?.contexto ?? 0,
    baseTokens: serie[0]?.contexto ?? 0,
    turnos: serie.length,
    consumo: { entrada: suma('entrada'), cacheCreacion: suma('cacheCreacion'), cacheLectura: suma('cacheLectura'), salida: suma('salida') },
    herramientas: Object.values(porHerramienta).reduce((s, n) => s + n, 0),
    porHerramienta,
    inicio,
    fin,
    duracionMs: inicio && fin ? new Date(fin) - new Date(inicio) : 0,
    lanzadas,
    costoSesion,
    hijos: [],
  }
}

const nodos = [
  analizar(join(carpetaProyecto, `${sesion}.jsonl`), { id: 'principal', tipo: 'Agente principal', descripcion: '', profundidad: 0 }),
]

const carpetaSub = join(carpetaProyecto, sesion, 'subagents')
if (existsSync(carpetaSub)) {
  for (const archivo of readdirSync(carpetaSub).filter((f) => f.endsWith('.jsonl'))) {
    const id = archivo.replace('.jsonl', '')
    const meta = leerJson(join(carpetaSub, `${id}.meta.json`), {})
    nodos.push(
      analizar(join(carpetaSub, archivo), {
        id,
        tipo: meta.agentType ?? 'subagente',
        descripcion: meta.description ?? '',
        profundidad: meta.spawnDepth ?? 1,
        lanzadoPor: meta.toolUseId,
      }),
    )
  }
}

const raiz = nodos[0]
for (const nodo of nodos.slice(1)) {
  const padre = nodos.find((n) => n !== nodo && nodo.lanzadoPor && n.lanzadas.has(nodo.lanzadoPor)) ?? raiz
  nodo.padre = padre.id
  padre.hijos.push(nodo)
}
for (const nodo of nodos) nodo.hijos.sort((a, b) => a.inicio.localeCompare(b.inicio))

let ventanas = leerJson(rutaVentanas, {})
const modelosSinVentana = [...new Set(nodos.flatMap((n) => n.modelos))].filter((m) => !ventanas[m] && !ventanaManual)

if (modelosSinVentana.length && bandera('sondear')) {
  for (const modelo of modelosSinVentana) {
    console.error(`Sondeando ${modelo} con una llamada real a claude -p (tiene costo)…`)
    for (const [id, datos] of sondearVentanas(modelo)) ventanas[id] = datos
  }
  mkdirSync(carpetaMetricas, { recursive: true })
  writeFileSync(rutaVentanas, JSON.stringify(ventanas, null, 2))
}

const ventanaDe = (modelo) =>
  ventanaManual ? { ventana: ventanaManual, fuente: 'manual (--ventana)' } : ventanas[modelo] ? { ventana: ventanas[modelo].ventana, fuente: ventanas[modelo].fuente } : null

for (const nodo of nodos) {
  nodo.serie = nodo.serie.map((t) => ({ ...t, ventana: ventanaDe(t.modelo)?.ventana ?? null }))
  const completa = nodo.serie.length > 0 && nodo.serie.every((t) => t.ventana)
  const critico = completa ? nodo.serie.reduce((m, t) => (t.contexto / t.ventana > m.contexto / m.ventana ? t : m)) : null
  nodo.ventana = critico?.ventana ?? null
  nodo.fuenteVentana = critico ? ventanaDe(critico.modelo).fuente : null
  nodo.picoPct = critico ? (critico.contexto / critico.ventana) * 100 : null
}

const registro = (n) => ({
  sesion,
  agenteId: n.id,
  padre: n.padre ?? null,
  tipo: n.tipo,
  descripcion: n.descripcion,
  profundidad: n.profundidad,
  modelos: n.modelos,
  ventana: n.ventana,
  fuenteVentana: n.fuenteVentana,
  picoTokens: n.picoTokens,
  picoPct: n.picoPct,
  baseTokens: n.baseTokens,
  finalTokens: n.finalTokens,
  turnos: n.turnos,
  consumo: n.consumo,
  herramientas: n.herramientas,
  porHerramienta: n.porHerramienta,
  inicio: n.inicio,
  fin: n.fin,
  duracionMs: n.duracionMs,
})

mkdirSync(carpetaMetricas, { recursive: true })
writeFileSync(
  join(carpetaMetricas, `sesion-${sesion.slice(0, 8)}.json`),
  JSON.stringify({ sesion, generadoEn: new Date().toISOString(), consumoPorModelo: raiz.costoSesion, agentes: nodos.map(registro) }, null, 2),
)
const previos = existsSync(rutaHistorial)
  ? readFileSync(rutaHistorial, 'utf8').split('\n').filter(Boolean).filter((l) => JSON.parse(l).sesion !== sesion)
  : []
writeFileSync(rutaHistorial, [...previos, ...nodos.map((n) => JSON.stringify(registro(n)))].join('\n') + '\n')

const clase = (p) => (p === null ? 'desconocida' : p >= UMBRAL_CRITICO ? 'critico' : p >= UMBRAL_ATENCION ? 'atencion' : 'ok')
const etiqueta = { ok: 'holgado', atencion: 'atención', critico: 'saturado', desconocida: 'ventana desconocida' }
const miles = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n))
const duracion = (ms) => {
  const minutos = Math.floor(ms / 60000)
  if (minutos >= 60) return `${Math.floor(minutos / 60)}h ${String(minutos % 60).padStart(2, '0')}m`
  return `${minutos}m ${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}s`
}
const escapar = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const sparkline = (nodo) => {
  const ancho = 140
  const alto = 30
  const y = (p) => alto - Math.min(p, 100) * (alto / 100)
  const puntos = nodo.serie.map((t, i) => `${nodo.serie.length === 1 ? ancho / 2 : (i / (nodo.serie.length - 1)) * ancho},${y((t.contexto / t.ventana) * 100).toFixed(1)}`)
  return `<svg class="spark" viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="Evolución del contexto por turno">
    <line class="ref" x1="0" x2="${ancho}" y1="${y(UMBRAL_ATENCION)}" y2="${y(UMBRAL_ATENCION)}"/>
    <line class="ref" x1="0" x2="${ancho}" y1="${y(UMBRAL_CRITICO)}" y2="${y(UMBRAL_CRITICO)}"/>
    <polyline points="${puntos.join(' ')}"/>
  </svg>`
}

const caja = (nodo) => {
  const c = clase(nodo.picoPct)
  const p = nodo.picoPct
  const hijos = nodo.hijos.length ? `<ul>${nodo.hijos.map(caja).join('')}</ul>` : ''
  const barra = p === null ? '' : `<div class="barra" role="img" aria-label="${p.toFixed(1)}% de la ventana"><i style="width:${Math.min(p, 100).toFixed(1)}%"></i></div>`
  const detalle =
    p === null
      ? `${miles(nodo.picoTokens)} tokens · <b>${etiqueta[c]}</b> (${escapar(nodo.modelos.join(' + ') || 'modelo sin identificar')})`
      : `${miles(nodo.picoTokens)} / ${miles(nodo.ventana)} · <b>${etiqueta[c]}</b>`
  return `<li>
  <div class="caja ${c}">
    <div class="cabecera">
      <strong>${escapar(nodo.tipo)}</strong>
      <span class="pct">${p === null ? '—' : `${p.toFixed(1)}%`}</span>
    </div>
    ${nodo.descripcion ? `<div class="desc">${escapar(nodo.descripcion)}</div>` : ''}
    ${barra}
    <div class="fila">
      <span>${detalle}</span>
      ${p === null ? '' : sparkline(nodo)}
    </div>
    <div class="meta">${nodo.turnos} turnos · ${nodo.herramientas} herramientas · ${duracion(nodo.duracionMs)} · base ${miles(nodo.baseTokens)}${nodo.finalTokens !== nodo.picoTokens ? ` · final ${miles(nodo.finalTokens)}` : ''}</div>
    <div class="meta">${escapar(nodo.modelos.join(' + '))} · salida ${miles(nodo.consumo.salida)} · caché leída ${miles(nodo.consumo.cacheLectura)}</div>
  </div>${hijos}
</li>`
}

const subagentes = nodos.slice(1)
const conPorcentaje = subagentes.filter((n) => n.picoPct !== null)
const masCargado = conPorcentaje.reduce((m, n) => (n.picoPct > (m?.picoPct ?? -1) ? n : m), null)
const sumaSubagentes = subagentes.reduce((s, n) => s + n.picoTokens, 0)
const modelosUsados = [...new Set(nodos.flatMap((n) => n.modelos))]

const filaVentana = (modelo) => {
  const v = ventanaDe(modelo)
  const captura = ventanas[modelo]?.capturadoEn?.slice(0, 10)
  return `<li><code>${escapar(modelo)}</code>: ${v ? `${v.ventana.toLocaleString('es-CO')} tokens · ${escapar(v.fuente)}${captura && !ventanaManual ? ` · capturada ${captura}` : ''}` : '<b>sin ventana registrada</b>; ejecuta con <code>--sondear</code>'}</li>`
}

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Contexto del flujo de agentes</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #ffffff; --surface: #f7f8f9; --fg: #14181c; --fg-muted: #5c6670; --border: #d9dee3;
    --ok: #0f766e; --atencion: #b45309; --critico: #b91c1c;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #101417; --surface: #181d21; --fg: #e8ecef; --fg-muted: #9aa5b0; --border: #2e373f;
      --ok: #5eead4; --atencion: #fbbf24; --critico: #fca5a5;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.5 system-ui, sans-serif; }
  .wrap { max-width: 900px; margin: 0 auto; padding: 32px 16px 64px; }
  h1 { font-size: 24px; margin: 0 0 6px; }
  p.sub { color: var(--fg-muted); margin: 0 0 24px; font-size: 14px; }
  .resumen { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin-bottom: 20px; }
  .dato { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; }
  .dato b { display: block; font-size: 20px; }
  .dato span { color: var(--fg-muted); font-size: 13px; }
  .leyenda { display: flex; flex-wrap: wrap; gap: 14px; font-size: 13px; color: var(--fg-muted); margin-bottom: 20px; }
  .leyenda i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 5px; }
  ul { list-style: none; margin: 0; padding: 0; }
  ul ul { padding-left: 28px; margin-left: 12px; border-left: 2px solid var(--border); }
  li { margin-top: 12px; position: relative; }
  ul ul > li::before { content: ''; position: absolute; left: -28px; top: 26px; width: 28px; border-top: 2px solid var(--border); }
  .caja { background: var(--surface); border: 1px solid var(--border); border-left-width: 5px; border-radius: 8px; padding: 10px 14px; max-width: 560px; }
  .caja.ok { border-left-color: var(--ok); }
  .caja.atencion { border-left-color: var(--atencion); }
  .caja.critico { border-left-color: var(--critico); }
  .caja.desconocida { border-left-color: var(--border); border-left-style: dashed; }
  .cabecera { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .pct { font-size: 20px; font-weight: 700; }
  .ok .pct { color: var(--ok); } .atencion .pct { color: var(--atencion); } .critico .pct { color: var(--critico); }
  .desc { color: var(--fg-muted); font-size: 13px; }
  .barra { height: 10px; border-radius: 5px; background: var(--border); margin: 8px 0 6px; overflow: hidden; }
  .barra i { display: block; height: 100%; }
  .ok .barra i { background: var(--ok); } .atencion .barra i { background: var(--atencion); } .critico .barra i { background: var(--critico); }
  .fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 13px; margin-top: 6px; }
  .spark { width: 140px; height: 30px; flex: none; }
  .spark polyline { fill: none; stroke-width: 1.8; stroke-linejoin: round; }
  .ok .spark polyline { stroke: var(--ok); } .atencion .spark polyline { stroke: var(--atencion); } .critico .spark polyline { stroke: var(--critico); }
  .spark .ref { stroke: var(--border); stroke-dasharray: 3 3; }
  .meta { color: var(--fg-muted); font-size: 12.5px; margin-top: 4px; overflow-wrap: anywhere; }
  footer { margin-top: 32px; color: var(--fg-muted); font-size: 13px; display: grid; gap: 8px; }
  footer ul { list-style: disc; padding-left: 20px; }
  footer li { margin-top: 4px; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Contexto del flujo de agentes</h1>
  <p class="sub">Sesión <code>${escapar(sesion)}</code> · pico de contexto de cada agente sobre la ventana de su modelo</p>

  <div class="resumen">
    <div class="dato"><b>${nodos.length}</b><span>agentes (1 principal + ${subagentes.length} subagentes)</span></div>
    <div class="dato"><b>${raiz.picoPct === null ? `${miles(raiz.picoTokens)} tok` : `${raiz.picoPct.toFixed(1)}%`}</b><span>pico del agente principal</span></div>
    <div class="dato"><b>${masCargado ? `${masCargado.picoPct.toFixed(1)}%` : '—'}</b><span>subagente más cargado${masCargado ? `: ${escapar(masCargado.tipo)}` : ''}</span></div>
    <div class="dato"><b>${miles(sumaSubagentes)}</b><span>suma de picos de los subagentes, fuera del contexto principal</span></div>
  </div>

  <div class="leyenda" aria-label="Leyenda">
    <span><i style="background:var(--ok)"></i>holgado &lt; ${UMBRAL_ATENCION}%</span>
    <span><i style="background:var(--atencion)"></i>atención ${UMBRAL_ATENCION}–${UMBRAL_CRITICO}%</span>
    <span><i style="background:var(--critico)"></i>saturado ≥ ${UMBRAL_CRITICO}%</span>
    <span><i style="background:var(--border)"></i>ventana desconocida</span>
  </div>

  <ul>${caja(raiz)}</ul>

  <footer>
    <p>Contexto de un turno = input + caché creada + caché leída, tomado de <code>usage</code> en el transcript de cada agente. Pico = el turno de mayor tamaño; base = el primer turno (prompt del sistema, herramientas, skills y la tarea).</p>
    <div>Ventanas usadas:<ul>${modelosUsados.map(filaVentana).join('')}</ul></div>
  </footer>
</div>
</body>
</html>
`

mkdirSync(dirname(salida), { recursive: true })
writeFileSync(salida, html)
const faltan = modelosUsados.filter((m) => !ventanaDe(m))
console.log(
  `${salida} · métricas en ${carpetaMetricas} · principal ${raiz.picoPct === null ? 'sin ventana' : `${raiz.picoPct.toFixed(1)}%`}` +
    (faltan.length ? ` · SIN VENTANA: ${faltan.join(', ')} (usa --sondear)` : ''),
)
