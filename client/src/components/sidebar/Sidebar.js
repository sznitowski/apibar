// src/components/sidebar/Sidebar.jsx
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Grid,
  Table as TableIcon, // alias para evitar conflictos
  DollarSign,
  Menu,
  X,
  Info,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
} from "react-feather";
import Alert from "../alert/Alert";
import LoadingSpinner from "../loading/LoadingSpinner";

export default function Sidebar({
  collapsed,
  setCollapsed,
  darkMode,
  setDarkMode,
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");
  const [openVentas, setOpenVentas] = useState(true); // submenú abierto por defecto

  // resize -> mobile
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // cerrar al click fuera (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const el = document.getElementById("sidebar");
      if (isMobile && el && !el.contains(e.target) && !collapsed) {
        setCollapsed(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [collapsed, isMobile, setCollapsed]);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    setAlertType(next ? "warning" : "success");
    setAlertMessage(next ? "Sidebar oculto" : "Sidebar visible");
    setTimeout(() => setAlertMessage(null), 1200);
  };

  const toggleTheme = () => {
    setLoading(true);
    setDarkMode((v) => !v);
    setTimeout(() => {
      setLoading(false);
      setAlertType("success");
      setAlertMessage("Tema actualizado");
      setTimeout(() => setAlertMessage(null), 1200);
    }, 300);
  };

  const Item = ({ to, label, Icon, className = "" }) => {
    if (!Icon) return null;
    return (
      <NavLink
        to={to}
        onClick={() => {
          if (isMobile) setCollapsed(true);
        }}
        className={({ isActive }) =>
          `group flex items-center ${collapsed ? "justify-center" : ""} px-2 py-2
           rounded-md text-sm font-medium transition hover:bg-gray-300 dark:hover:bg-gray-700
           ${isActive ? "bg-gray-300 dark:bg-gray-700" : ""} text-gray-900 dark:text-gray-100 ${className}`
        }
      >
        <div className={`flex items-center justify-center ${collapsed ? "w-10 h-10" : "mr-2"}`}>
          <Icon size={18} />
        </div>
        {!collapsed && label}
      </NavLink>
    );
  };

  return (
    <>
      {/* Topbar fijo */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-gray-300 dark:bg-gray-900 border-b border-gray-400 dark:border-gray-700 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <button onClick={toggleSidebar} className="text-gray-800 dark:text-gray-100">
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <h1 className="text-lg font-bold">Api Bar</h1>
        </div>
        <button
          onClick={toggleTheme}
          className="text-gray-800 dark:text-gray-100 flex items-center gap-2"
          title="Cambiar tema"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span className="text-sm">{darkMode ? "Light" : "Dark"}</span>}
        </button>
      </div>

      {/* overlays */}
      {loading && (
        <div className="fixed top-12 left-4 z-50">
          <LoadingSpinner message="Cambiando tema..." />
        </div>
      )}
      {alertMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50">
          <Alert type={alertType} message={alertMessage} />
        </div>
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed top-0 left-0 h-screen pt-12 transition-all duration-300 z-40 shadow-lg
        ${collapsed ? "w-16" : "w-60"}
        bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col`}
      >
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {/* Menú principal */}
          <Item to="/Productos" label="Productos" Icon={Grid} />
          <Item to="/Mesas" label="Mesas" Icon={TableIcon} />

          <hr className="my-2 border-gray-400 dark:border-gray-700" />

          {/* Grupo: Ventas */}
          <button
            type="button"
            onClick={() => setOpenVentas((v) => !v)}
            className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-between"}
              px-2 py-2 rounded-md text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-700`}
          >
            <div className="flex items-center">
              <DollarSign size={18} className={collapsed ? "" : "mr-2"} />
              {!collapsed && <span>Ventas</span>}
            </div>
            {!collapsed && (openVentas ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </button>

          {/* Submenú Ventas */}
          {openVentas && !collapsed && (
            <div className="ml-6 space-y-1">
              <Item to="/Ventas/Stock"   label="Stock"   Icon={ChevronRight} className="!py-1" />
              <Item to="/Ventas/Dashboard"   label="Ventas"   Icon={ChevronRight} className="!py-1" />
              
            </div>
          )}
        </nav>

        {/* Footer info */}
        <div className="mt-auto border-t border-gray-300 dark:border-gray-700">
          {!collapsed ? (
            <div className="p-4 text-xs text-gray-600 dark:text-gray-300">
              <p>Versión 1.0.0</p>
              <p>vsznitowski@gmail.com</p>
            </div>
          ) : (
            <div className="p-4 flex justify-center">
              <div className="relative group">
                <Info className="text-gray-600 dark:text-gray-300" size={20} />
                <div className="absolute bottom-full mb-2 w-40 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                  <p>Versión 1.0.0</p>
                  <p>vsznitowski@gmail.com</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
