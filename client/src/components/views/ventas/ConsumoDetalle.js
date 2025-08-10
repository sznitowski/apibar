import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConsumo } from "../../actions/ventaActions";

export default function ConsumoDetalle() {
  const dispatch = useDispatch();
  const { consumo, loading, error } = useSelector(s => s.ventas);

  useEffect(() => { dispatch(fetchConsumo()); }, [dispatch]);

  if (loading?.consumo) return <p className="text-white p-4">Cargando consumo...</p>;
  if (error) return <p className="text-red-500 p-4">Error: {error}</p>;

  return (
    <div className="text-white p-4">
      <h1 className="text-xl font-bold mb-4">Ventas - Consumo</h1>
      {(consumo || []).map((c, i) => (
        <div key={i} className="text-sm border-b border-gray-700 py-1">
          #{c.id_venta} — {c.nombre_producto} x{c.cantidad} = ${c.subtotal}
        </div>
      ))}
    </div>
  );
}
