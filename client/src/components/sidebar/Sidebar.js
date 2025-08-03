import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Grid, Table, Menu, X, Moon, Sun } from "react-feather";

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const sidebar = document.getElementById("sidebar");
      if (isMobile && sidebar && !sidebar.contains(e.target) && !collapsed) {
        setCollapsed(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [collapsed, isMobile]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { label: "Productos", to: "/Productos", icon: Grid },
    { label: "Mesas", to: "/Mesas", icon: Table },
  ];

  return (
    <>
      {/* Navbar superior */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-gray-300 dark:bg-gray-900 border-b border-gray-400 dark:border-gray-700 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <button onClick={toggleSidebar} className="text-gray-800 dark:text-gray-100">
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <h1 className="text-lg font-bold text-inherit">Api Bar</h1>
        </div>
        <button
          onClick={toggleTheme}
          className="text-sm px-3 py-1 rounded bg-gray-400 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-500 dark:hover:bg-gray-700"
        >
          <span className="flex items-center gap-2">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? "Light" : "Dark"}
          </span>
        </button>
      </div>

      {/* Overlay en mobile */}
      {!collapsed && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30"></div>
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`${
          collapsed ? "w-16" : "w-60"
        } pt-12 fixed top-0 left-0 h-screen bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300 shadow-lg z-40 flex flex-col`}
      >
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              onClick={() => {
                if (isMobile) setCollapsed(true);
              }}
              className={`group flex items-center ${
                collapsed ? "justify-center" : ""
              } px-2 py-2 rounded-md text-sm font-medium text-inherit hover:bg-gray-300 dark:hover:bg-gray-700 transition ${
                location.pathname === to ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center ${
                  collapsed ? "w-10 h-10" : "mr-2"
                }`}
              >
                <Icon className="text-gray-800 dark:text-gray-100" size={18} />
              </div>
              {!collapsed && label}
            </Link>
          ))}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-gray-300 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
            Versión 1.0.0
            <br />
            Desarrollado por: vsznitowski@gmail.com
          </div>
        )}
      </aside>
    </>
  );
}
