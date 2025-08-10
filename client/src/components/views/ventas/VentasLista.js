import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVentas } from "../../actions/ventaActions";

export default function VentasLista() {
  const dispatch = useDispatch();
  const { ventas, loading, error } = useSelector(s => s.ventas);

  useEffect(() => { dispatch(fetchVentas()); }, [dispatch]);

  if (loading?.ventas) return <p className="text-white p-4">Cargando resumen...</p>;
  if (error) return <p className="text-red-500 p-4">Error: {error}</p>;

  return (
    <div className="text-white p-4">
      <h1 className="text-xl font-bold mb-4">Ventas - Lista</h1>
      {(ventas || []).map(v => (
        <div key={v.id_venta} className="mb-2 border-b border-gray-700 pb-2">
          ID Venta: {v.id_venta} — Mesa: {v.id_mesa} — Total: ${v.costo_total}
        </div>
      ))}
    </div>
  );
}
