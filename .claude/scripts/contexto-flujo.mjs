import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const args = process.argv.slice(2)
const opcion = (nombre, porDefecto) => {
  const i = args.indexOf(`--${nombre}`)
  return i >= 0 ? args[i + 1] : porDefecto
}

const VENTANA = Number(opcion('ventana', 1_000_000))
const UMBRAL_ATENCION = 40
const UMBRAL_CRITICO = 70

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

const analizar = (ruta, base) => {
  const turnos = new Map()
  const lanzadas = new Set()
  let herramientas = 0
  let modelo = ''
  let inicio = ''
  let fin = ''

  for (const fila of leerJsonl(ruta)) {
    if (fila.timestamp) {
      inicio ||= fila.timestamp
      fin = fila.timestamp
    }
    const msg = fila.message
    if (msg?.role !== 'assistant') continue
    for (const bloque of Array.isArray(msg.content) ? msg.content : []) {
      if (bloque.type === 'tool_use') {
        lanzadas.add(bloque.id)
        herramientas++
      }
    }
    const u = msg.usage
    if (!u) continue
    const tokens = (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0)
    if (tokens === 0) continue
    modelo = msg.model ?? modelo
    turnos.set(fila.requestId ?? fila.uuid, tokens)
  }

  const serie = [...turnos.values()]
  return {
    ...base,
    modelo,
    serie,
    pico: Math.max(0, ...serie),
    final: serie.at(-1) ?? 0,
    herramientas,
    lanzadas,
    duracionMs: inicio && fin ? new Date(fin) - new Date(inicio) : 0,
    inicio,
    hijos: [],
  }
}

const nodos = [analizar(join(carpetaProyecto, `${sesion}.jsonl`), { id: 'principal', tipo: 'Agente principal', descripcion: '', profundidad: 0 })]

const carpetaSub = join(carpetaProyecto, sesion, 'subagents')
if (existsSync(carpetaSub)) {
  for (const archivo of readdirSync(carpetaSub).filter((f) => f.endsWith('.jsonl'))) {
    const id = archivo.replace('.jsonl', '')
    const rutaMeta = join(carpetaSub, `${id}.meta.json`)
    const meta = existsSync(rutaMeta) ? JSON.parse(readFileSync(rutaMeta, 'utf8')) : {}
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
  padre.hijos.push(nodo)
}
for (const nodo of nodos) nodo.hijos.sort((a, b) => a.inicio.localeCompare(b.inicio))

const pct = (tokens) => (tokens / VENTANA) * 100
const clase = (p) => (p >= UMBRAL_CRITICO ? 'critico' : p >= UMBRAL_ATENCION ? 'atencion' : 'ok')
const etiqueta = { ok: 'holgado', atencion: 'atención', critico: 'saturado' }
const miles = (n) => `${Math.round(n / 1000)}k`
const duracion = (ms) => {
  const minutos = Math.floor(ms / 60000)
  if (minutos >= 60) return `${Math.floor(minutos / 60)}h ${String(minutos % 60).padStart(2, '0')}m`
  return `${minutos}m ${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}s`
}
const escapar = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const sparkline = (serie) => {
  const ancho = 140
  const alto = 30
  const y = (p) => alto - Math.min(p, 100) * (alto / 100)
  const puntos = serie.map((t, i) => `${serie.length === 1 ? ancho / 2 : (i / (serie.length - 1)) * ancho},${y(pct(t)).toFixed(1)}`)
  return `<svg class="spark" viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="Evolución del contexto por turno">
    <line class="ref" x1="0" x2="${ancho}" y1="${y(UMBRAL_ATENCION)}" y2="${y(UMBRAL_ATENCION)}"/>
    <line class="ref" x1="0" x2="${ancho}" y1="${y(UMBRAL_CRITICO)}" y2="${y(UMBRAL_CRITICO)}"/>
    <polyline points="${puntos.join(' ')}"/>
  </svg>`
}

const caja = (nodo) => {
  const p = pct(nodo.pico)
  const c = clase(p)
  const hijos = nodo.hijos.length ? `<ul>${nodo.hijos.map(caja).join('')}</ul>` : ''
  return `<li>
  <div class="caja ${c}">
    <div class="cabecera">
      <strong>${escapar(nodo.tipo)}</strong>
      <span class="pct">${p.toFixed(1)}%</span>
    </div>
    ${nodo.descripcion ? `<div class="desc">${escapar(nodo.descripcion)}</div>` : ''}
    <div class="barra" role="img" aria-label="${p.toFixed(1)}% de la ventana"><i style="width:${Math.min(p, 100).toFixed(1)}%"></i></div>
    <div class="fila">
      <span>${miles(nodo.pico)} / ${miles(VENTANA)} · <b>${etiqueta[c]}</b></span>
      ${sparkline(nodo.serie)}
    </div>
    <div class="meta">${nodo.serie.length} turnos · ${nodo.herramientas} herramientas · ${duracion(nodo.duracionMs)}${nodo.final !== nodo.pico ? ` · final ${miles(nodo.final)}` : ''}</div>
  </div>${hijos}
</li>`
}

const subagentes = nodos.slice(1)
const masCargado = subagentes.reduce((m, n) => (n.pico > (m?.pico ?? 0) ? n : m), null)
const sumaSubagentes = subagentes.reduce((s, n) => s + n.pico, 0)

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
    --ok-soft: #ccfbf1; --atencion-soft: #fef3c7; --critico-soft: #fee2e2;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #101417; --surface: #181d21; --fg: #e8ecef; --fg-muted: #9aa5b0; --border: #2e373f;
      --ok: #5eead4; --atencion: #fbbf24; --critico: #fca5a5;
      --ok-soft: #0f3d38; --atencion-soft: #45330f; --critico-soft: #45201f;
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
  .cabecera { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .pct { font-size: 20px; font-weight: 700; }
  .ok .pct { color: var(--ok); } .atencion .pct { color: var(--atencion); } .critico .pct { color: var(--critico); }
  .desc { color: var(--fg-muted); font-size: 13px; }
  .barra { height: 10px; border-radius: 5px; background: var(--border); margin: 8px 0 6px; overflow: hidden; }
  .barra i { display: block; height: 100%; }
  .ok .barra i { background: var(--ok); } .atencion .barra i { background: var(--atencion); } .critico .barra i { background: var(--critico); }
  .fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 13px; }
  .spark { width: 140px; height: 30px; flex: none; }
  .spark polyline { fill: none; stroke-width: 1.8; stroke-linejoin: round; }
  .ok .spark polyline { stroke: var(--ok); } .atencion .spark polyline { stroke: var(--atencion); } .critico .spark polyline { stroke: var(--critico); }
  .spark .ref { stroke: var(--border); stroke-dasharray: 3 3; }
  .meta { color: var(--fg-muted); font-size: 12.5px; margin-top: 4px; }
  footer { margin-top: 32px; color: var(--fg-muted); font-size: 13px; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Contexto del flujo de agentes</h1>
  <p class="sub">Sesión <code>${escapar(sesion)}</code> · pico de contexto de cada agente sobre una ventana de ${miles(VENTANA)} tokens</p>

  <div class="resumen">
    <div class="dato"><b>${nodos.length}</b><span>agentes (1 principal + ${subagentes.length} subagentes)</span></div>
    <div class="dato"><b>${pct(raiz.pico).toFixed(1)}%</b><span>pico del agente principal</span></div>
    <div class="dato"><b>${masCargado ? `${pct(masCargado.pico).toFixed(1)}%` : '—'}</b><span>subagente más cargado${masCargado ? `: ${escapar(masCargado.tipo)}` : ''}</span></div>
    <div class="dato"><b>${miles(sumaSubagentes)}</b><span>suma de picos de los subagentes, fuera del contexto principal</span></div>
  </div>

  <div class="leyenda" aria-label="Leyenda">
    <span><i style="background:var(--ok)"></i>holgado &lt; ${UMBRAL_ATENCION}%</span>
    <span><i style="background:var(--atencion)"></i>atención ${UMBRAL_ATENCION}–${UMBRAL_CRITICO}%</span>
    <span><i style="background:var(--critico)"></i>saturado ≥ ${UMBRAL_CRITICO}%</span>
    <span>Línea punteada de la gráfica: umbrales</span>
  </div>

  <ul>${caja(raiz)}</ul>

  <footer>Contexto = input + caché creada + caché leída del último turno de mayor tamaño. Ventana asumida: ${VENTANA.toLocaleString('es-CO')} tokens (<code>--ventana</code>).</footer>
</div>
</body>
</html>
`

mkdirSync(dirname(salida), { recursive: true })
writeFileSync(salida, html)
console.log(`${salida} · principal ${pct(raiz.pico).toFixed(1)}% · máx. subagente ${masCargado ? pct(masCargado.pico).toFixed(1) : 0}%`)
