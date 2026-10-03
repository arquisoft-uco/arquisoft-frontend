# Protocolo de traspaso entre agentes

Fuente única. Lo usan `@0-orquestador` y todo agente que delegue en un subagente.

## Regla de oro

Quien delega conserva **estado y rutas**, no el trabajo del delegado. Prohibido traer a tu contexto
lo que el delegado leyó o hizo: de él solo importa **si terminó bien** y **dónde quedó su salida**.
Lees de un `.out.md` únicamente lo que tu agente declara que necesita.

## Archivos

Todo vive en `.workspace/handoff/{HU|HT}-{ID}/` (ignorado por git). Nombre: `{NN}-{quien}.in.md` y
`{NN}-{quien}.out.md`. Un delegado anida con el prefijo de su padre: `02.1-models`, `02.2-services`.

| Archivo | Lo escribe | Contenido |
|---|---|---|
| `estado.md` | El orquestador | Tabla `paso · agente · estado · ruta out` |
| `*.in.md` | Quien delega | Instrucciones, con la plantilla de abajo |
| `*.out.md` | El delegado | Resultado, con el formato de abajo |

## `.in.md`

```markdown
# {quien} · {HU|HT}-{ID} · {NN}

Rol: orquestado | worker
Salida: {ruta .out.md}

## Tarea
{una o dos frases}

## Entradas
{rutas, nunca contenido}

## Decisiones
{respuestas y aprobaciones del usuario, tal cual}
```

- **`orquestado`**: te invocó el orquestador. Puedes delegar.
- **`worker`**: haces solo tu tarea y **no delegas**. La profundidad máxima es un nivel bajo el agente.
- En ambos no hay usuario en el canal: no esperes aprobaciones ni conversaciones. Lo ya aprobado está
  en «Decisiones»; si necesitas una decisión, detente y devuelve `PREGUNTA`.

## `.out.md`

```markdown
ESTADO: OK|PREGUNTA|RECHAZADO|ERROR|EN CURSO · {máx. 15 palabras}

## Resumen
{máx. 10 líneas}

## Preguntas
{solo si PREGUNTA; cada una con sus opciones}

## Salidas
{rutas de lo producido, y de qué archivo de entrada debe leer el siguiente}
```

La primera línea es el estado: para saber si un paso terminó basta leerla (`Read` con `limit: 1`).

**Excepción — `@4a`:** su entregable es un texto largo, así que el cuerpo de su `.out.md` **es** el
reporte completo (`# Reporte de Validación — {ID}`, con las secciones de `VALIDATOR.md`), precedido por
la línea `ESTADO`; no lleva `## Resumen` ni `## Salidas`. `@4b` lo persiste desde ahí. Es el único
archivo que `@4a` escribe.

**Nadie transcribe lo que produjo un delegado.** Si un delegado entregó su contenido en el mensaje sin
escribir su `.out.md`, quien lo invocó se lo pide con `SendMessage` o lo trata como `ERROR`; copiarlo a
mano trae el trabajo del delegado al contexto de quien delega y rompe la regla de oro.

## Cómo delegas

Prompt del `Agent`, siempre igual y corto: `Lee {ruta .in.md} y ejecútalo.`

El delegado responde **una sola línea**: `ESTADO: … · {ruta .out.md} · {máx. 15 palabras}`. Si no la
trae, trátalo como `ERROR`.

| Estado | Qué haces |
|---|---|
| `OK` | Siguiente paso |
| `EN CURSO` | Solo lo emite quien delegó y aún espera a un subagente en segundo plano: termina su turno sin seguir, y el aviso del subagente lo despierta. Quien lo invocó espera; no es un fallo ni un resultado final |
| `PREGUNTA` | Copia su `## Preguntas` a tu propio `.out.md` y devuelve `PREGUNTA`. Si hablas con el usuario, pregúntale tú. Al recibir la respuesta, guárdala en «Decisiones» de un `.in.md` nuevo y relanza |
| `RECHAZADO` | Solo lo emite `@4a`. Lo maneja el orquestador |
| `ERROR` | Detente y devuelve `ERROR` con la ruta del `.out.md`. No reintentes solo, salvo una auto-corrección que tu propio agente ya prevea |

**Reanudar:** un paso cuyo `.out.md` ya dice `ESTADO: OK` no se repite. Tras un corte, reanuda al mismo
delegado con `SendMessage` si lo tienes: conserva su contexto y no repaga el arranque (~35k tokens por
agente nuevo). Sin `SendMessage`, un `.in.md` nuevo que diga "reanuda", con la respuesta en «Decisiones».

**Con `SendMessage`, escribe antes la respuesta del usuario**, textual, en «Decisiones» del `.in.md` del
delegado, y en el mensaje cita esa ruta: queda escrito qué aprobó el usuario y cuándo. `@4c` ya no pide
autorización (la orden de entregar basta; el usuario revisa el PR en GitHub), así que no hay nada que
registrar para él.

**Tu respuesta final** es la línea `ESTADO`, la ruta y una frase corta. El contenido (preguntas, planes,
reportes) va en el `.out.md`, nunca en el mensaje: quien te invocó lo lee del archivo.

Delegados en paralelo solo si sus entradas son independientes y ninguno escribe archivos que otro lee.
