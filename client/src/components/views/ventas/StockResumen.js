// src/components/views/ventas/StockResumen.js
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStock } from "../../actions/ventaActions";
import StockDashboard from "./StockDashboard";

export default function StockResumen() {
  const dispatch = useDispatch();
  const sel = useSelector((s) => s.ventas);
  const stock = sel?.stock || [];
  const loading = sel?.loading || {};
  // si ya migraste a errors por slice:
  const errorStock = sel?.errors?.stock ?? sel?.error;

  // filtros
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("TODAS");

  // paginación
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // selección para comparar
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    dispatch(fetchStock());
  }, [dispatch]);

  // categorías
  const categories = useMemo(() => {
    const set = new Set((stock || []).map((r) => r.category || "Sin categoría"));
    return ["TODAS", ...Array.from(set)];
  }, [stock]);

  // filtrar
  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return (stock || []).filter((r) => {
      const okQ = qn ? (r.name || "").toLowerCase().includes(qn) : true;
      const okCat = cat === "TODAS" ? true : (r.category || "Sin categoría") === cat;
      return okQ && okCat;
    });
  }, [stock, q, cat]);

  // reset página/selección cuando cambian filtros
  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [q, cat]);

  // paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const i = (page - 1) * PAGE_SIZE;
    return filtered.slice(i, i + PAGE_SIZE);
  }, [filtered, page]);

  // selección
  const toggleOne = (row) => {
    setSelected((prev) =>
      prev.some((x) => x.id === row.id)
        ? prev.filter((x) => x.id !== row.id)
        : [...prev, row]
    );
  };
  const allCheckedOnPage =
    pageItems.length && pageItems.every((r) => selected.some((x) => x.id === r.id));
  const togglePage = () => {
    if (allCheckedOnPage) {
      setSelected((s) => s.filter((x) => !pageItems.find((r) => r.id === x.id)));
    } else {
      setSelected((s) => [...s, ...pageItems.filter((r) => !s.find((x) => x.id === r.id))]);
    }
  };

  if (loading?.stock) return <p className="text-white p-4">Cargando stock…</p>;
  if (errorStock) return <p className="text-red-500 p-4">Error: {String(errorStock)}</p>;

  const inCompare = selected.length >= 2;

  return (
    <div className="p-4 md:p-6 text-gray-100">
      <div className="max-w-screen-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Stock</h1>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto…"
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 outline-none w-full"
          />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 w-full"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="flex items-center text-sm text-gray-400">
            {filtered.length} resultados
          </div>
        </div>

        {/* Tabla + Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tabla */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden w-full">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <div className="font-semibold">Productos</div>
              <div className="text-xs text-gray-400">
                Seleccionados: {selected.length}
              </div>
            </div>

            {/* wrapper horizontal + alto responsivo */}
            <div className="overflow-x-auto">
              <div className="max-h-[50vh] md:max-h-[60vh] xl:max-h-[65vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-900">
                    <tr className="[&>th]:text-left [&>th]:px-4 [&>th]:py-2 text-gray-400">
                      <th className="w-10">
                        <input
                          type="checkbox"
                          checked={!!allCheckedOnPage}
                          onChange={togglePage}
                        />
                      </th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th className="text-right">Precio</th>
                      <th className="text-right">Stock</th>
                      <th className="text-right">Vendido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((r) => {
                      const checked = selected.some((x) => x.id === r.id);
                      return (
                        <tr
                          key={r.id}
                          className="border-t border-gray-800 hover:bg-gray-800/40 cursor-pointer"
                          onClick={() => toggleOne(r)}             // click fila tilda
                        >
                          <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleOne(r)}
                            />
                          </td>
                          <td className="px-4 py-2">{r.name}</td>
                          <td className="px-4 py-2 text-gray-400">
                            {r.category || "Sin categoría"}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {Number(r.price).toLocaleString("es-AR", {
                              style: "currency",
                              currency: "ARS",
                            })}
                          </td>
                          <td className="px-4 py-2 text-right">{r.stock_actual}</td>
                          <td className="px-4 py-2 text-right">{r.total_vendido}</td>
                        </tr>
                      );
                    })}
                    {!pageItems.length && (
                      <tr>
                        <td className="px-4 py-4 text-gray-400" colSpan={6}>
                          Sin datos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 text-sm">
              <span>
                Página {page} de {totalPages}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                  disabled={page === 1}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                  disabled={page === totalPages}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 w-full">
            <StockDashboard
              data={inCompare ? selected : filtered}
              mode={inCompare ? "compare" : "normal"}
              title={
                inCompare
                  ? `Comparación (${selected.length} productos)`
                  : cat !== "TODAS" || q
                  ? `Dashboard – ${cat !== "TODAS" ? `Categoría: ${cat}` : ""} ${q ? `| "${q}"` : ""}`
                  : "Dashboard (aplicá filtros o seleccioná productos)"
              }
            />
            {!inCompare && selected.length === 1 && (
              <div className="mt-2 text-xs text-yellow-400">
                Seleccioná al menos dos productos para comparar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
