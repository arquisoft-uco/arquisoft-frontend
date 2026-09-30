import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';

interface Props {
  items: ItemCualitativoJurado[];
}

export default function ItemsCualitativosJuradoTable({ items }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
      <table className="w-full text-left text-sm" aria-label="Ítems cualitativos del jurado">
        <thead className="bg-surface-secondary text-on-surface-secondary">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Nombre
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Descripción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-4 py-6 text-center text-on-surface-secondary">
                No hay ítems cualitativos registrados.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 align-top font-medium text-on-surface">{item.nombre}</td>
                <td className="px-4 py-3 align-top text-on-surface-secondary">{item.descripcion}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
