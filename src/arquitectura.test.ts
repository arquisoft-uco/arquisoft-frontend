import { describe, expect, it } from 'vitest';
import { BASELINE } from './test-utils/arquitectura.baseline';
import {
  bloquesJsdoc,
  ciclosEstaticos,
  coloresCrudos,
  coloresSinToken,
  compararConBaseline,
  componentesGrandes,
  configuracionProhibida,
  consolesLog,
  contarColoresSinToken,
  contarSpinnersCopiados,
  contarTextosMenoresA12px,
  extraerTokensDeColor,
  queryKeysFueraDeConvencion,
  spinnersCopiados,
  textosMenoresA12px,
  tiposInseguros,
  tokensDeColorDeclarados,
  usosDeStorage,
  violacionesDeCapas,
  violacionesDeHooks,
  violacionesDeHttp,
  violacionesDeInfraestructura,
  violacionesDeModelos,
  violacionesDeServices,
  violacionesEntreFeatures,
} from './test-utils/arquitectura';

const AYUDA_BASELINE =
  'No agregues entradas a src/test-utils/arquitectura.baseline.ts ni subas un valor: corrige el código. ' +
  'Si un archivo ya cumple, elimina su entrada.';

function exigir(violaciones: string[], corregir: string) {
  expect(violaciones, `\n${corregir}\n`).toEqual([]);
}

describe('Arquitectura: dependencias entre capas', () => {
  it('cada capa de una feature importa solo de las que tiene debajo (models ← services ← hooks ← components)', () => {
    // Act
    const violaciones = violacionesDeCapas();

    // Assert
    exigir(
      violaciones,
      'La dirección es models ← services ← hooks ← components. Mueve la lógica a la capa correcta: ' +
        'una llamada HTTP baja a un service y se expone con un hook; un componente consume el hook.',
    );
  });

  it('una feature no importa de otra', () => {
    // Act
    const violaciones = violacionesEntreFeatures();

    // Assert
    exigir(
      violaciones,
      'Lo que dos features necesitan sube a src/shared/ (con dos consumidores) o se consume a través ' +
        'de un slice compartido; una feature nunca importa a otra.',
    );
  });

  it('la infraestructura (shared, api, auth, config) no importa de src/features', () => {
    // Act
    const violaciones = violacionesDeInfraestructura();

    // Assert
    exigir(
      violaciones,
      'La infraestructura la consumen las features, nunca al revés. Invierte la dependencia: ' +
        'la feature pasa el dato o la función que la infraestructura necesita.',
    );
  });

  it('no hay ciclos de imports estáticos', () => {
    // Act
    const ciclos = ciclosEstaticos();

    // Assert
    exigir(
      ciclos,
      'Rompe el ciclo con un import dinámico en el punto de salida (como api/axiosInstance.ts con el router) ' +
        'o extrae lo compartido a un tercer módulo.',
    );
  });
});

describe('Arquitectura: reglas por capa', () => {
  it('el cliente HTTP solo lo importan los services y la capa de auth, y axios solo vive en api/', () => {
    // Act
    const violaciones = violacionesDeHttp();

    // Assert
    exigir(
      violaciones,
      "Importa apiClient únicamente desde un service; no uses 'axios' directamente (se pierden el token, " +
        'el refresco del 401 y el ruteo del 403).',
    );
  });

  it('un service no importa React, React Query, stores, hooks ni componentes', () => {
    // Act
    const violaciones = violacionesDeServices();

    // Assert
    exigir(
      violaciones,
      'Un service es un objeto plano sobre apiClient. El estado y el refresco viven en el hook que lo consume.',
    );
  });

  it('un hook no importa componentes ni lucide-react', () => {
    // Act
    const violaciones = violacionesDeHooks();

    // Assert
    exigir(
      violaciones,
      'Un hook devuelve datos, banderas y funciones, nunca JSX. El icono o el componente se elige en la vista.',
    );
  });

  it('models/ solo contiene tipos, sin código de runtime', () => {
    // Act
    const violaciones = violacionesDeModelos();

    // Assert
    exigir(
      violaciones,
      'Un modelo es solo interface o type. Una constante o una función va en utils/, en un service o en shared/. ' +
        'Un catálogo del backend nunca es un enum del frontend.',
    );
  });

  it('el estado persistente (localStorage / sessionStorage) vive solo en el store del rol activo', () => {
    // Act
    const usos = usosDeStorage();

    // Assert
    exigir(
      usos,
      'Nada sensible se persiste en el navegador. Si el dato debe sobrevivir a un refresh y no es sensible, ' +
        'justifícalo en el plan y amplía la regla.',
    );
  });

  it('no hay console.log en código de producción', () => {
    // Act
    const archivos = consolesLog();

    // Assert
    exigir(
      archivos,
      'Usa captureError de shared/utils/monitoring.ts para errores y quita el resto de las trazas.',
    );
  });
});

describe('Arquitectura: convenciones con deuda conocida', () => {
  it('las query keys empiezan por el nombre de su feature', () => {
    // Act
    const problemas = compararConBaseline(
      queryKeysFueraDeConvencion(),
      BASELINE.queryKeysFueraDeConvencion,
    );

    // Assert
    exigir(
      problemas,
      `Una clave jerárquica empieza por la feature (['fichas-perfil', id, 'recurso']) para poder invalidar ` +
        `por prefijo. ${AYUDA_BASELINE}`,
    );
  });

  it('no hay any, @ts-ignore, @ts-expect-error ni as unknown as', () => {
    // Act
    const problemas = compararConBaseline(tiposInseguros(), BASELINE.tiposInseguros);

    // Assert
    exigir(
      problemas,
      `Un tipo que no cuadra significa que el modelo o el contrato están mal. En un mock, tipa el retorno ` +
        `con el tipo real (satisfies) o mockea el service en lugar del hook. ${AYUDA_BASELINE}`,
    );
  });

  it('ningún componente nuevo supera 150 líneas ni uno existente crece', () => {
    // Act
    const problemas = compararConBaseline(componentesGrandes(), BASELINE.componentesGrandes);

    // Assert
    exigir(
      problemas,
      `Pasadas ~150 líneas, extrae sub-componentes ({Rol}View → {Concepto}Panel|Table|Form); si lo que ` +
        `sobra es fetch o transformación, extrae un hook. ${AYUDA_BASELINE}`,
    );
  });

  it('no se agregan colores crudos de Tailwind', () => {
    // Act
    const problemas = compararConBaseline(coloresCrudos(), BASELINE.coloresCrudos);

    // Assert
    exigir(
      problemas,
      `Usa solo tokens semánticos (bg-surface, text-on-surface, text-danger…) declarados en @theme de ` +
        `src/tailwind.css. ${AYUDA_BASELINE}`,
    );
  });

  it('toda utilidad de color con nombre de convención shadcn tiene su --color-* en @theme', () => {
    // Act
    const problemas = compararConBaseline(coloresSinToken(), BASELINE.coloresSinToken);

    // Assert
    exigir(
      problemas,
      `Define el token en @theme de src/tailwind.css o usa uno existente: Tailwind descarta en silencio ` +
        `una utilidad cuya variable no existe. ${AYUDA_BASELINE}`,
    );
  });

  it('el spinner solo vive en shared/components/ui', () => {
    // Act
    const problemas = compararConBaseline(spinnersCopiados(), BASELINE.spinnersCopiados);

    // Assert
    exigir(
      problemas,
      `Usa LoadingState (carga sin forma conocida), Skeleton (forma conocida) o el prop cargando de ` +
        `Button: el único spinner vive en src/shared/components/ui/. ${AYUDA_BASELINE}`,
    );
  });

  it('ningún texto usa menos de 12 px', () => {
    // Act
    const problemas = compararConBaseline(textosMenoresA12px(), BASELINE.textosMenoresA12px);

    // Assert
    exigir(
      problemas,
      `Usa text-xs (12 px) como mínimo: el piso tipográfico es 12 px (tokens.md §4 de ` +
        `arquisoft-frontend-ui-ux). ${AYUDA_BASELINE}`,
    );
  });

  it('no se agregan bloques JSDoc', () => {
    // Act
    const problemas = compararConBaseline(bloquesJsdoc(), BASELINE.bloquesJsdoc);

    // Assert
    exigir(
      problemas,
      `El código se autodocumenta con el naming; un comentario de una línea solo cuando explica un porqué. ` +
        AYUDA_BASELINE,
    );
  });
});

describe('Arquitectura: la regla de colores sin token', () => {
  it('acepta una utilidad cuyo token está declarado, con variante y con opacidad', () => {
    // Arrange
    const declarados = new Set(['muted', 'muted-foreground']);
    const clases = 'hover:bg-muted bg-muted/50 text-muted-foreground';

    // Act
    const sinToken = contarColoresSinToken(clases, declarados);

    // Assert
    expect(sinToken).toBe(0);
  });

  it('marca cada utilidad vigilada cuyo token no está declarado', () => {
    // Arrange
    const declarados = new Set(['muted']);
    // muted-foreground se resuelve aparte de muted: declarar uno no cubre al otro.
    const clases = 'text-warning bg-card text-muted-foreground data-[state=open]:bg-accent';

    // Act
    const sinToken = contarColoresSinToken(clases, declarados);

    // Assert
    expect(sinToken).toBe(4);
  });

  it('no confunde border-border-input con border-input', () => {
    // Arrange
    const sinTokens = new Set<string>();

    // Act
    const propio = contarColoresSinToken('border-border-input', sinTokens);
    const conConvencion = contarColoresSinToken('border-border-input border-input', sinTokens);

    // Assert
    expect(propio).toBe(0);
    expect(conConvencion).toBe(1);
  });

  it('no marca los tokens propios ni lo que no vigila', () => {
    // Arrange
    const sinTokens = new Set<string>();
    // bg-card-elevated solo empieza por un nombre vigilado (card): no se lee como bg-card.
    const clases =
      'bg-surface text-on-surface bg-primary-muted text-primary-muted-foreground ' +
      'border-border-strong text-sm border-b bg-black/40 bg-card-elevated';

    // Act
    const sinToken = contarColoresSinToken(clases, sinTokens);

    // Assert
    expect(sinToken).toBe(0);
  });

  it('extrae solo las declaraciones y no las referencias con var()', () => {
    // Arrange
    const css = [
      '--color-muted: oklch(95% 0.01 230);',
      '--color-border-input : oklch(62% 0.02 230);',
      'color: var(--color-primary);',
    ].join('\n');

    // Act
    const tokens = extraerTokensDeColor(css);

    // Assert
    expect(tokens).toEqual(new Set(['muted', 'border-input']));
  });

  it('lee los tokens reales de src/tailwind.css', () => {
    // Act
    const tokens = tokensDeColorDeclarados();

    // Assert
    expect(
      [...tokens],
      'Si falla, revisa test.css.include en vite.config.ts: sin esa opción Vitest vacía ' +
        'src/tailwind.css y no se lee ningún token.',
    ).toEqual(expect.arrayContaining(['primary', 'muted']));
  });
});

describe('Arquitectura: las reglas de spinner y de tamaño de texto', () => {
  it('cuenta el spinner copiado y no el animate-spin suelto', () => {
    // Arrange
    const clases = 'h-8 animate-spin rounded-full border-4 animate-pulse animate-spin';

    // Act
    const spinners = contarSpinnersCopiados(clases);

    // Assert
    expect(spinners).toBe(1);
  });

  it('cuenta los textos de 9, 10 y 11 px y no los de 12 px o más', () => {
    // Arrange
    const clases = 'text-[9px] text-[10px] text-[11px] text-[12px] text-xs text-[13px]';

    // Act
    const textosPequenos = contarTextosMenoresA12px(clases);

    // Assert
    expect(textosPequenos).toBe(3);
  });
});

describe('Arquitectura: archivos de configuración', () => {
  it('no existen tailwind.config.*, postcss.config.* ni vitest.config.*', () => {
    // Act
    const archivos = configuracionProhibida();

    // Assert
    exigir(
      archivos,
      'Tailwind 4 declara sus tokens en @theme de src/tailwind.css y la configuración de Vitest vive en ' +
        'la clave test de vite.config.ts.',
    );
  });
});
