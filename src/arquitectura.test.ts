import { describe, expect, it } from 'vitest';
import { BASELINE } from './test-utils/arquitectura.baseline';
import {
  bloquesJsdoc,
  ciclosEstaticos,
  coloresCrudos,
  compararConBaseline,
  componentesGrandes,
  configuracionProhibida,
  consolesLog,
  queryKeysFueraDeConvencion,
  tiposInseguros,
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
