import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import { artefactosService } from '../services/artefactosService';
import { DIAS_SIN_AVANCE_POR_DEFECTO, validarDiasSinAvance } from '../utils/dias-sin-avance';
import {
  construirFiltros,
  ordenamientoDe,
  ORDEN_POR_DEFECTO,
  ORDENES,
  type FiltrosArtefactosSinAvance,
} from '../utils/filtros-artefactos-sin-avance';

const PAGE_SIZE = 10;

type DireccionOrden = 'ASC' | 'DESC';

export function useArtefactosSinAvanceAsesor() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const filtros: FiltrosArtefactosSinAvance = {
    texto: parametros.texto('q').trim(),
    estado: parametros.texto('estado').trim(),
  };
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [ordenCampo, ordenDireccion] = orden.split(':') as [string, DireccionOrden];
  const hayFiltros = filtros.texto !== '' || filtros.estado !== '';

  const [diasTexto, setDiasTexto] = useState(
    () => parametros.texto('dias') || String(DIAS_SIN_AVANCE_POR_DEFECTO),
  );
  const diasConsulta = useDebouncedValue(diasTexto);
  const { dias, error: errorDias } = validarDiasSinAvance(diasConsulta);

  function setDias(texto: string) {
    setDiasTexto(texto);
    const { dias: valido } = validarDiasSinAvance(texto);
    if (valido === null) return;
    parametros.cambiar({
      dias: valido === DIAS_SIN_AVANCE_POR_DEFECTO ? undefined : String(valido),
    });
  }

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor || undefined });
  }

  function setEstado(valor: string) {
    parametros.cambiar({ estado: valor || undefined });
  }

  function setOrden(campo: string, direccion: DireccionOrden) {
    const nuevo = `${campo}:${direccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined, estado: undefined });
  }

  const query = useQuery({
    queryKey: [
      'artefactos',
      'asesor',
      'sin-avance',
      page,
      dias,
      filtros.texto,
      filtros.estado,
      orden,
    ],
    queryFn: () =>
      artefactosService.consultarArtefactosSinAvanceAsesor({
        diasSinAvance: dias as number,
        criterio: {
          pagina: page,
          tamanio: PAGE_SIZE,
          ordenamiento: ordenamientoDe(orden),
          filtros: construirFiltros(filtros),
        },
      }),
    enabled: dias !== null,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    diasTexto,
    setDias,
    dias,
    errorDias,
    filtros,
    setTexto,
    setEstado,
    orden,
    ordenCampo,
    ordenDireccion,
    setOrden,
    hayFiltros,
    limpiarFiltros,
  };
}
