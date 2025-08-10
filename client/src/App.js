// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";

import ProductOperations from "./components/views/ProductOperations";
import MesaOperations from "./components/views/MesaOperations";

import VentasDashboardView from "./components/views/ventas/VentasDashboardView"; // ventas (nuevo)
import StockResumen from "./components/views/ventas/StockResumen";                // stock (tu dashboard de stock)

import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Básicos */}
          <Route path="/Productos" element={<ProductOperations />} />
          <Route path="/Mesas" element={<MesaOperations />} />

          {/* Ventas */}
          <Route path="/Ventas/Dashboard" element={<VentasDashboardView />} />
          <Route path="/Ventas/Stock" element={<StockResumen />} />

          {/* Home -> redirige a Ventas/Stock */}
          <Route path="/" element={<Navigate to="/Ventas/Stock" replace />} />
          {/* 404 -> redirige a home */}
          <Route path="*" element={<Navigate to="/Ventas/Stock" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
