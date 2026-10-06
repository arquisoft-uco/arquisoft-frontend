import { describe, it, expect } from 'vitest';
import { Rol } from '../shared/models/rol';
import {
  NAV_ITEMS,
  ROLES_POR_RUTA,
  agruparNavItems,
  estaDisponible,
  navItemsDelRol,
  type NavItem,
} from './nav-items';

const icono = NAV_ITEMS[0].icon;

function item(partes: Partial<NavItem> & Pick<NavItem, 'path' | 'order'>): NavItem {
  return { label: partes.path, icon: icono, ...partes };
}

describe('nav-items', () => {
  it('estaDisponible es verdadero por defecto y falso solo con disponible: false', () => {
    expect(estaDisponible(item({ path: '/a', order: 1 }))).toBe(true);
    expect(estaDisponible(item({ path: '/a', order: 1, disponible: true }))).toBe(true);
    expect(estaDisponible(item({ path: '/a', order: 1, disponible: false }))).toBe(false);
  });

  it('navItemsDelRol filtra por rol, ordena por order y con rol nulo deja solo los ítems sin roles', () => {
    // Arrange
    const items = [
      item({ path: '/c', order: 3, roles: [Rol.Estudiante] }),
      item({ path: '/a', order: 1 }),
      item({ path: '/b', order: 2, roles: [Rol.Administrador] }),
    ];

    // Act / Assert
    expect(navItemsDelRol(Rol.Estudiante, items).map((i) => i.path)).toEqual(['/a', '/c']);
    expect(navItemsDelRol(null, items).map((i) => i.path)).toEqual(['/a']);
  });

  it('agruparNavItems separa trabajo y próximamente, y deja próximamente vacío si no hay', () => {
    const disponible = item({ path: '/a', order: 1 });
    const pendiente = item({ path: '/b', order: 2, disponible: false });

    expect(agruparNavItems([disponible, pendiente])).toEqual({
      trabajo: [disponible],
      proximamente: [pendiente],
    });
    expect(agruparNavItems([disponible]).proximamente).toEqual([]);
  });

  it('ROLES_POR_RUTA conserva la restricción de los módulos aún no disponibles', () => {
    const noDisponibles = NAV_ITEMS.filter((i) => !estaDisponible(i) && i.roles);

    expect(noDisponibles.length).toBeGreaterThan(0);
    noDisponibles.forEach((i) => {
      expect(ROLES_POR_RUTA[i.path.slice(1)]).toEqual(i.roles);
    });
  });
});
