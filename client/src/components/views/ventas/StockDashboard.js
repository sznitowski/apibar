// src/components/views/ventas/StockDashboard.js
import { useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

const fmt = (n = 0) => Number(n).toLocaleString("es-AR");
const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#14b8a6","#a78bfa","#fb7185","#06b6d4","#eab308"];

/* ---------- Leyenda custom scrollable ---------- */
function ScrollLegend({ payload = [], max = 18 }) {
  const items = payload.slice(0, max);
  return (
    <div className="overflow-y-auto max-h-40 pr-2 text-xs">
      {items.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: entry.color }} />
          <span className="truncate" title={entry.value}>{entry.value}</span>
        </div>
      ))}
      {payload.length > max && (
        <div className="text-[11px] text-gray-400 mt-1">+{payload.length - max} más…</div>
      )}
    </div>
  );
}

/* ---------- Tooltips custom (siempre muestran el nombre) ---------- */
function CustomXYTooltip({ active, label, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 text-white text-xs rounded-md px-3 py-2 shadow max-w-[260px]">
      <div className="font-semibold mb-1 truncate">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: p.color }} />
          <span className="capitalize">{p.name ?? p.dataKey}</span>: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}
function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-gray-800 text-white text-xs rounded-md px-3 py-2 shadow max-w-[260px]">
      <div className="font-semibold mb-1 truncate">{p.name}</div>
      <div>valor: {fmt(p.value)}</div>
    </div>
  );
}

/* ---------- Card de gráfico ---------- */
function ChartCard({ id, title, children, onFullscreen }) {
  return (
    <div className="rounded-xl border border-gray-800 p-3 relative w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-400 font-medium">{title}</div>
        <button
          onClick={() => onFullscreen(id)}
          className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
        >
          Pantalla completa
        </button>
      </div>
      {children}
    </div>
  );
}

export default function StockDashboard({ data = [], title = "Dashboard", mode = "normal" }) {
  const [fs, setFs] = useState(null);
  const lineRef = useRef(null);
  const barRef  = useRef(null);
  const pieRef  = useRef(null);

  const hasData = Array.isArray(data) && data.length > 0;

  /* ---------- datos ---------- */
  const lineData = useMemo(
    () => data.map(d => ({ name: d.name, stock: +d.stock_actual || 0, vendido: +d.total_vendido || 0 })),
    [data]
  );

  const barData = useMemo(
    () => data
      .slice()
      .sort((a,b)=>(+b.total_vendido||0)-(+a.total_vendido||0))
      .slice(0, 20) // Top 20
      .map(d => ({ name: d.name, vendido: +d.total_vendido || 0 })),
    [data]
  );

  const pieData = useMemo(
    () => data.slice(0, 24).map(d => ({ name: d.name, value: +d.stock_actual || 0 })),
    [data]
  );

  const compareBars = useMemo(
    () => data.map(d => ({ name: d.name, Stock: +d.stock_actual || 0, Vendido: +d.total_vendido || 0 })),
    [data]
  );
  const comparePie = useMemo(
    () => data.map(d => ({ name: d.name, value: +d.total_vendido || 0 })),
    [data]
  );

  /* ---------- Fullscreen modal con scroll ---------- */
  const Fullscreen = ({ children }) => (
    <div className="fixed inset-0 z-50 bg-black/80 p-4 overflow-auto" onClick={()=>setFs(null)}>
      <div
        className="min-h-[80vh] w-full bg-gray-900 rounded-2xl border border-gray-800 p-4"
        onClick={(e)=>e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="text-white font-semibold">{title}</div>
          <button className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700" onClick={()=>setFs(null)}>
            Cerrar
          </button>
        </div>
        <div className="h-[75vh]">{children}</div>
      </div>
    </div>
  );

  if (!hasData) return <div className="text-sm text-gray-400">No hay datos para graficar.</div>;

  /* ---------- MODO COMPARACIÓN ---------- */
  if (mode === "compare" && data.length >= 2) {
    return (
      <div className="space-y-4">
        <div className="text-sm font-semibold">{title}</div>

        {/* Barras: mostrar nombres en eje X */}
        <ChartCard id="bar" title="Comparación: Stock vs Vendido (por producto)" onFullscreen={setFs}>
          <div ref={barRef} className="h-64 md:h-72 xl:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={compareBars}
                margin={{ top: 10, right: 10, bottom: 40, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={{ fontSize: 11, fill: "#d1d5db" }}
                  angle={-20}
                  textAnchor="end"
                  height={36}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomXYTooltip />} />
                <Legend />
                <Bar dataKey="Stock" />
                <Bar dataKey="Vendido" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard id="pie" title="Participación del Vendido (seleccionados)" onFullscreen={setFs}>
          <div ref={pieRef} className="h-64 md:h-72 xl:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={comparePie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                  {comparePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend content={<div className="hidden md:block"><ScrollLegend max={18} /></div>} />
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Fullscreen compare bar (con nombres también) */}
        {fs === 'bar' && (
          <Fullscreen>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={compareBars}
                margin={{ top: 10, right: 10, bottom: 50, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                  angle={-25}
                  textAnchor="end"
                  height={48}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomXYTooltip />} />
                <Legend />
                <Bar dataKey="Stock" />
                <Bar dataKey="Vendido" />
              </BarChart>
            </ResponsiveContainer>
          </Fullscreen>
        )}

        {fs === 'pie' && (
          <Fullscreen>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={comparePie} dataKey="value" nameKey="name" innerRadius={120} outerRadius={180}>
                  {comparePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend content={<ScrollLegend max={24} />} />
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Fullscreen>
        )}
      </div>
    );
  }

  /* ---------- MODO NORMAL ---------- */
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">{title}</div>

      <ChartCard id="line" title="Stock vs Vendido" onFullscreen={setFs}>
        <div ref={lineRef} className="h-56 md:h-64 xl:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomXYTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="stock" strokeWidth={2} dot />
              <Line type="monotone" dataKey="vendido" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard id="bar" title="Vendido por producto (Top 20)" onFullscreen={setFs}>
        <div className="h-56 md:h-64 xl:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomXYTooltip />} />
              {/* una sola serie, sin Legend */}
              <Bar dataKey="vendido" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard id="pie" title="Distribución de stock" onFullscreen={setFs}>
        <div className="h-56 md:h-64 xl:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend content={<div className="hidden md:block"><ScrollLegend max={18} /></div>} />
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {fs && (
        <Fullscreen>
          {fs === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomXYTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="stock" strokeWidth={3} dot />
                <Line type="monotone" dataKey="vendido" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
          {fs === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomXYTooltip />} />
                <Bar dataKey="vendido" />
              </BarChart>
            </ResponsiveContainer>
          )}
          {fs === 'pie' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={120} outerRadius={180}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend content={<ScrollLegend max={28} />} />
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Fullscreen>
      )}
    </div>
  );
}
