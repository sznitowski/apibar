// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import PrivateRoute from "./components/layout/PrivateRoute";
import Login from "./pages/Login";

import ProductOperations from "./components/views/ProductOperations";
import MesaOperations from "./components/views/MesaOperations";
import VentasDashboardView from "./components/views/ventas/VentasDashboardView";
import StockResumen from "./components/views/ventas/StockResumen";

import SessionLoader from "./components/auth/SessionLoader"; // <— hidrata sesión
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <SessionLoader />

      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Privadas */}
        <Route
          path="/productos"
          element={
            <PrivateRoute>
              <Layout><ProductOperations /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/mesas"
          element={
            <PrivateRoute>
              <Layout><MesaOperations /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/ventas/dashboard"
          element={
            <PrivateRoute>
              <Layout><VentasDashboardView /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/ventas/stock"
          element={
            <PrivateRoute>
              <Layout><StockResumen /></Layout>
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Navigate to="/ventas/stock" replace />} />
        <Route path="*" element={<Navigate to="/ventas/stock" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
