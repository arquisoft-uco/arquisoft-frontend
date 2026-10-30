import { useState } from 'react';
import { useLocation } from 'react-router';
import type { NavegacionVersionesRepositorio } from '../models/NavegacionVersionesRepositorio';

interface ResultadoContextoVersiones {
  nombre: string | null;
  search: string;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function leerNavegacion(
  state: unknown,
  repositorioId: string,
): NavegacionVersionesRepositorio | null {
  if (!esObjeto(state) || typeof state.search !== 'string') return null;
  const bruto = state.repositorio;
  if (!esObjeto(bruto) || bruto.id !== repositorioId || typeof bruto.nombre !== 'string') {
    return null;
  }
  return { search: state.search, repositorio: { id: repositorioId, nombre: bruto.nombre } };
}

export function useContextoVersionesRepositorio(repositorioId: string): ResultadoContextoVersiones {
  const location = useLocation();
  const [navegacion] = useState(() => leerNavegacion(location.state, repositorioId));

  return {
    nombre: navegacion?.repositorio.nombre ?? null,
    search: navegacion?.search ?? '',
  };
}
