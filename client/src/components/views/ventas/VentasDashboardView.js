import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVentasDetalladas } from "../../actions/ventaActions";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

const fmt = (n=0)=>Number(n).toLocaleString("es-AR");
const money = (n=0)=>Number(n).toLocaleString("es-AR",{style:"currency",currency:"ARS"});
const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#14b8a6","#a78bfa","#fb7185","#06b6d4","#eab308"];

export default function VentasDashboardView() {
  const dispatch = useDispatch();
  const { ventasDet, loading, error } = useSelector(s=>s.ventas);

  // filtros básicos
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mesa, setMesa] = useState("");
  const [categoria, setCategoria] = useState("");
  const [pago, setPago] = useState("");

  useEffect(()=>{ dispatch(fetchVentasDetalladas({ from, to, mesa: mesa===""?undefined:Number(mesa), categoria, pago })); },
    [dispatch, from, to, mesa, categoria, pago]);

  const kpis = useMemo(()=>{
    const importe = ventasDet.reduce((a,b)=>a + Number(b.subtotal_item||0), 0);
    const tickets = new Set(ventasDet.map(x=>x.id_venta)).size;
    const unidades = ventasDet.reduce((a,b)=>a + Number(b.cantidad||0), 0);
    return { importe, tickets, unidades, tktProm: tickets? importe/tickets : 0 };
  }, [ventasDet]);

  // series
  const porDia = useMemo(()=>{
    const map = new Map();
    ventasDet.forEach(r=>{
      const d = r.fecha; // YYYY-MM-DD desde el model
      const v = Number(r.subtotal_item||0);
      map.set(d, (map.get(d)||0)+v);
    });
    return Array.from(map.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([fecha, importe])=>({fecha, importe}));
  }, [ventasDet]);

  const topProductos = useMemo(()=>{
    const map = new Map();
    ventasDet.forEach(r=>{
      const key = r.nombre_producto;
      map.set(key, (map.get(key)||0)+Number(r.subtotal_item||0));
    });
    return Array.from(map.entries())
      .map(([name, vendido])=>({name, vendido}))
      .sort((a,b)=>b.vendido-a.vendido)
      .slice(0,12);
  }, [ventasDet]);

  const porPago = useMemo(()=>{
    const map = new Map();
    ventasDet.forEach(r=>{
      map.set(r.tipo_pago, (map.get(r.tipo_pago)||0)+Number(r.subtotal_item||0));
    });
    return Array.from(map.entries()).map(([name, value])=>({name, value}));
  }, [ventasDet]);

  const porMesa = useMemo(()=>{
    const map = new Map();
    ventasDet.forEach(r=>{
      map.set(r.id_mesa, (map.get(r.id_mesa)||0)+Number(r.subtotal_item||0));
    });
    return Array.from(map.entries()).map(([name, vendido])=>({name: `Mesa ${name}`, vendido}))
      .sort((a,b)=>b.vendido-a.vendido).slice(0,10);
  }, [ventasDet]);

  return (
    <div className="p-4 text-gray-100">
      <h1 className="text-2xl font-bold mb-4">Ventas – Dashboard</h1>

      {/* Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2"/>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2"/>
        <input type="number" min="1" placeholder="Mesa" value={mesa} onChange={e=>setMesa(e.target.value)} className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2"/>
        <input placeholder="Categoría (ej: alcohol)" value={categoria} onChange={e=>setCategoria(e.target.value)} className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2"/>
        <select value={pago} onChange={e=>setPago(e.target.value)} className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
          <option value="">Pago (todos)</option>
          <option value="efectivo">efectivo</option>
          <option value="tarjeta">tarjeta</option>
          <option value="mercado pago">mercado pago</option>
        </select>
        <button onClick={()=>dispatch(fetchVentasDetalladas({ from, to, mesa: mesa===""?undefined:Number(mesa), categoria, pago }))}
                className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-3 py-2">Aplicar</button>
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
