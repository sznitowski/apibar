// src/components/views/ventas/VentasDashboardView.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVentasDetalladas } from "../../actions/ventaActions";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

import DatePicker, { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("es", es);

const fmt   = (n=0)=>Number(n).toLocaleString("es-AR");
const money = (n=0)=>Number(n).toLocaleString("es-AR",{style:"currency",currency:"ARS"});
const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#14b8a6","#a78bfa","#fb7185","#06b6d4","#eab308"];

// helper para YYYY-MM-DD en hora local
const ymd = (d) => (d ? format(d, "yyyy-MM-dd") : "");

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
// endpoint unificado del back para meta de stock
const STOCK_META = `${API}/api/ventas/stock`; // ?meta=categories | ?meta=products&q=...&limit=20

function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-200 px-2 py-1 rounded-full text-xs">
      {children}
      <button className="text-gray-400 hover:text-white" onClick={onRemove}>×</button>
    </span>
  );
}

export default function VentasDashboardView() {
  const dispatch = useDispatch();
  const { ventasDet, loading, error } = useSelector(s=>s.ventas);

  // ====== Filtros ======
  const [from, setFrom] = useState(null); // Date | null
  const [to,   setTo]   = useState(null); // Date | null
  const [pago, setPago] = useState("");
  const [q, setQ]       = useState("");   // búsqueda por nombre

  // Categorías (multi + buscador)
  const [allCats,  setAllCats]  = useState([]);
  const [catOpen,  setCatOpen]  = useState(false);
  const [catQuery, setCatQuery] = useState("");
  const [catsSel,  setCatsSel]  = useState([]); // array<string>

  // Productos (multi + sug. asíncronas)
  const [prodOpen,  setProdOpen]  = useState(false);
  const [prodQuery, setProdQuery] = useState("");
  const [prodSug,   setProdSug]   = useState([]);   // [{id,name,category}]
  const [prodsSel,  setProdsSel]  = useState([]);   // [{id,name,category}]

  // refs para cerrar dropdown al hacer click afuera
  const catBoxRef  = useRef(null);
  const prodBoxRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (catBoxRef.current && !catBoxRef.current.contains(e.target)) setCatOpen(false);
      if (prodBoxRef.current && !prodBoxRef.current.contains(e.target)) setProdOpen(false);
    };
    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, []);

  // Cargar categorías al montar
  useEffect(() => {
    let on = true;
    fetch(`${STOCK_META}?meta=categories`)
      .then(r => r.json())
      .then(arr => { if (on) setAllCats(Array.isArray(arr) ? arr : []); })
      .catch(()=>{});
    return () => { on = false; };
  }, []);

  // Sugerencias asíncronas de productos (debounce simple)
  useEffect(() => {
    const q2 = prodQuery.trim();
    if (q2.length < 2) { setProdSug([]); return; }
    const id = setTimeout(() => {
      fetch(`${STOCK_META}?meta=products&q=${encodeURIComponent(q2)}&limit=20`)
        .then(r => r.json())
        .then(arr => setProdSug(Array.isArray(arr) ? arr : []))
        .catch(()=>{});
    }, 300);
    return () => clearTimeout(id);
  }, [prodQuery]);

  // Aplicar filtros -> back
  const apply = () => {
    dispatch(fetchVentasDetalladas({
      from: ymd(from) || undefined,
      to:   ymd(to)   || undefined,
      pago: pago      || undefined,
      q:    q.trim()  || undefined,
      categorias: catsSel.length ? catsSel : undefined,
      productos:  prodsSel.length ? prodsSel.map(p => p.id) : undefined,
    }));
  };

  // ====== KPIs ======
  const kpis = useMemo(()=>{
    const arr = ventasDet || [];
    const importe  = arr.reduce((a,b)=>a + Number(b.subtotal_item||0), 0);
    const tickets  = new Set(arr.map(x=>x.id_venta)).size;
    const unidades = arr.reduce((a,b)=>a + Number(b.cantidad||0), 0);
    return { importe, tickets, unidades, tktProm: tickets? importe/tickets : 0 };
  }, [ventasDet]);

  // ====== Series ======
  const porDia = useMemo(()=>{
    const map = new Map();
    (ventasDet || []).forEach(r=>{
      const d = r.fecha; // YYYY-MM-DD
      const v = Number(r.subtotal_item||0);
      map.set(d, (map.get(d)||0)+v);
    });
    return Array.from(map.entries())
      .sort(([a],[b])=>a.localeCompare(b))
      .map(([fecha, importe])=>({fecha, importe}));
  }, [ventasDet]);

  const topProductos = useMemo(()=>{
    const map = new Map();
    (ventasDet || []).forEach(r=>{
      map.set(r.nombre_producto, (map.get(r.nombre_producto)||0)+Number(r.subtotal_item||0));
    });
    return Array.from(map.entries())
      .map(([name, vendido])=>({name, vendido}))
      .sort((a,b)=>b.vendido-a.vendido)
      .slice(0,12);
  }, [ventasDet]);

  const porPago = useMemo(()=>{
    const map = new Map();
    (ventasDet || []).forEach(r=>{
      map.set(r.tipo_pago || "—", (map.get(r.tipo_pago || "—")||0)+Number(r.subtotal_item||0));
    });
    return Array.from(map.entries()).map(([name, value])=>({name, value}));
  }, [ventasDet]);

  const porMesa = useMemo(()=>{
    const map = new Map();
    (ventasDet || []).forEach(r=>{
      map.set(r.id_mesa, (map.get(r.id_mesa)||0)+Number(r.subtotal_item||0));
    });
    return Array.from(map.entries())
      .map(([name, vendido])=>({name: `Mesa ${name}`, vendido}))
      .sort((a,b)=>b.vendido-a.vendido).slice(0,10);
  }, [ventasDet]);

  // Filtrado local de categorías en el dropdown
  const catsFiltered = useMemo(()=>{
    const qn = catQuery.trim().toLowerCase();
    return !qn ? allCats : allCats.filter(c => (c || "").toLowerCase().includes(qn));
  }, [allCats, catQuery]);

  return (
    <div className="p-4 text-gray-100">
      <h1 className="text-2xl font-bold mb-4">Ventas – Dashboard</h1>

      {/* FILTROS – 100% RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        {/* Desde */}
        <div className="relative">
          <DatePicker
            selected={from}
            onChange={(d)=>setFrom(d)}
            selectsStart
            startDate={from}
            endDate={to}
            maxDate={to || undefined}
            locale="es"
            dateFormat="dd/MM/yyyy"
            placeholderText="Desde"
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 w-full text-white"
            popperClassName="z-[9999]"
          />
        </div>

        {/* Hasta */}
        <div className="relative">
          <DatePicker
            selected={to}
            onChange={(d)=>setTo(d)}
            selectsEnd
            startDate={from}
            endDate={to}
            minDate={from || undefined}
            locale="es"
            dateFormat="dd/MM/yyyy"
            placeholderText="Hasta"
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 w-full text-white"
            popperClassName="z-[9999]"
          />
        </div>

        {/* Pago */}
        <select
          value={pago}
          onChange={e=>setPago(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 w-full"
        >
          <option value="">Pago (todos)</option>
          <option value="efectivo">efectivo</option>
          <option value="tarjeta">tarjeta</option>
          <option value="mercado pago">mercado pago</option>
        </select>

        {/* Buscador por nombre */}
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Buscar por nombre de producto…"
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 w-full"
        />

        {/* Categorías: multiselect con buscador */}
        <div className="relative" ref={catBoxRef}>
          <button
            type="button"
            onClick={()=>setCatOpen(o=>!o)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-left"
          >
            <div className="text-xs text-gray-400">Categorías</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {catsSel.length ? catsSel.map(c=>(
                <Chip key={c} onRemove={()=>setCatsSel(prev=>prev.filter(x=>x!==c))}>{c}</Chip>
              )) : <span className="text-gray-400 text-sm">Filtrar categorías…</span>}
            </div>
          </button>
          {catOpen && (
            <div className="absolute z-40 mt-2 w-full bg-gray-900 border border-gray-800 rounded-xl p-3 shadow-xl">
              <input
                value={catQuery}
                onChange={e=>setCatQuery(e.target.value)}
                placeholder="Buscar categoría…"
                className="w-full bg-gray-800 rounded-lg px-2 py-1 text-sm mb-2"
              />
              <div className="max-h-56 overflow-auto space-y-1 pr-1">
                {catsFiltered.length ? catsFiltered.map(c => {
                  const checked = catsSel.includes(c);
                  return (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={()=>setCatsSel(prev =>
                          checked ? prev.filter(x=>x!==c) : [...prev, c]
                        )}
                      />
                      <span>{c}</span>
                    </label>
                  );
                }) : <div className="text-xs text-gray-400">Sin coincidencias</div>}
              </div>
            </div>
          )}
        </div>

        {/* Productos: multiselect asíncrono */}
        <div className="relative" ref={prodBoxRef}>
          <button
            type="button"
            onClick={()=>setProdOpen(o=>!o)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-left"
          >
            <div className="text-xs text-gray-400">Productos</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {prodsSel.length ? prodsSel.map(p=>(
                <Chip key={p.id} onRemove={()=>setProdsSel(prev=>prev.filter(x=>x.id!==p.id))}>
                  {p.name}
                </Chip>
              )) : <span className="text-gray-400 text-sm">Buscar producto… (2+ letras)</span>}
            </div>
          </button>
          {prodOpen && (
            <div className="absolute z-40 mt-2 w-full bg-gray-900 border border-gray-800 rounded-xl p-3 shadow-xl">
              <input
                value={prodQuery}
                onChange={e=>setProdQuery(e.target.value)}
                placeholder="Escribí al menos 2 letras…"
                className="w-full bg-gray-800 rounded-lg px-2 py-1 text-sm mb-2"
              />
              <div className="max-h-56 overflow-auto pr-1">
                {prodQuery.trim().length < 2
                  ? <div className="text-xs text-gray-400">Empezá a escribir…</div>
                  : (prodSug.length
                      ? prodSug.map(p => {
                          const added = prodsSel.some(x=>x.id===p.id);
                          return (
                            <button
                              key={p.id}
                              className={`w-full text-left text-sm px-2 py-1 rounded ${added ? "bg-gray-800 text-gray-400" : "hover:bg-gray-800"}`}
                              disabled={added}
                              onClick={()=>setProdsSel(prev => added ? prev : [...prev, p])}
                            >
                              {p.name} <span className="text-xs text-gray-400">· {p.category||"—"}</span>
                            </button>
                          );
                        })
                      : <div className="text-xs text-gray-400">Sin resultados</div>
                    )
                }
              </div>
            </div>
          )}
        </div>

        {/* Botón aplicar */}
        <div className="lg:col-span-1 sm:col-span-2">
          <button
            onClick={apply}
            className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl px-3 py-2 h-full"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-xs text-gray-400">Importe</div>
          <div className="text-xl font-semibold">{money(kpis.importe)}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-xs text-gray-400">Tickets</div>
          <div className="text-xl font-semibold">{fmt(kpis.tickets)}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-xs text-gray-400">Unidades</div>
          <div className="text-xl font-semibold">{fmt(kpis.unidades)}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-xs text-gray-400">Ticket Prom.</div>
          <div className="text-xl font-semibold">{money(kpis.tktProm)}</div>
        </div>
      </div>

      {loading?.ventasDet && <div className="text-sm text-gray-400">Cargando...</div>}
      {error && <div className="text-sm text-red-400">Error: {error}</div>}

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-2">Importe por día</div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={porDia}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                <XAxis dataKey="fecha"/>
                <YAxis/>
                <Tooltip formatter={(v)=>money(v)}/>
                <Line type="monotone" dataKey="importe" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-2">Top productos (importe)</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={topProductos}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                <XAxis dataKey="name" hide/>
                <YAxis/>
                <Tooltip formatter={(v)=>money(v)}/>
                <Bar dataKey="vendido"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-2">Participación por medio de pago</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={porPago} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {porPago.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Legend/>
                <Tooltip formatter={(v)=>money(v)}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-2">Top mesas (importe)</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={porMesa}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip formatter={(v)=>money(v)}/>
                <Bar dataKey="vendido"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
