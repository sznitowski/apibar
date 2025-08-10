import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVentas, fetchConsumo, fetchStock } from "../../actions/ventaActions";

export default function VentasView() {
  const dispatch = useDispatch();
  const { ventas, consumo, stock, loading, error } = useSelector((s) => s.ventas);

  useEffect(() => {
    dispatch(fetchVentas());
    dispatch(fetchConsumo());
    dispatch(fetchStock());
  }, [dispatch]);

  // ✅ Si loading es un objeto: combiná los flags
  const isLoading = loading?.ventas || loading?.consumo || loading?.stock;

  if (isLoading) return <p className="text-white p-4">Cargando datos...</p>;
  if (error) return <p className="text-red-500 p-4">Error: {error}</p>;

  return (
    <div className="text-white p-4">
      <h1 className="text-xl font-bold mb-4">Ventas</h1>
      {(ventas || []).map((v) => (
        <div key={v.id_venta} className="mb-2 border-b border-gray-700 pb-2">
          <p>
            ID Venta: {v.id_venta} - Mesa: {v.id_mesa}
            {v.costo_total != null ? ` - Total: $${v.costo_total}` : null}
          </p>
        </div>
      ))}

      <h2 className="text-lg font-bold mt-6">Consumo Detallado</h2>
      {(consumo || []).map((c, i) => (
        <div key={i} className="text-sm">
          <p>#{c.id_venta} - {c.nombre_producto} x{c.cantidad} = ${c.subtotal}</p>
        </div>
      ))}

      <h2 className="text-lg font-bold mt-6">Stock</h2>
      {(stock || []).map((s) => (
        <div key={s.id} className="text-sm">
          <p>{s.producto}: Stock actual: {s.stock}, Vendido: {s.total_vendido}</p>
        </div>
      ))}
    </div>
  );
}
