// src/components/layout/Layout.jsx
import { useState, useEffect } from "react";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../sidebar/Navbar";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    // antes: h-screen overflow-hidden
    <div className="flex min-h-screen overflow-x-hidden bg-gray-100 dark:bg-gray-950">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* clave: permitir que el hijo haga scroll */}
      <div className="flex-1 flex flex-col min-h-0">
        <Navbar
          collapsed={collapsed}
          darkMode={darkMode}
          toggleTheme={() => setDarkMode(!darkMode)}
        />

        {/* este main ahora scrollea verticalmente */}
        <main
          className={`flex-1 overflow-y-auto pt-12 pb-16 px-4 transition-all duration-300 ${
            collapsed ? "ml-16" : "ml-60"
          }`}
        >
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
