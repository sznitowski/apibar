import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductOperations from "./components/views/ProductOperations";
import MesaOperations from "./components/views/MesaOperations";
import Sidebar from "./components/sidebar/Sidebar";
import Navbar from "./components/sidebar/Navbar";
import "./index.css";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} darkMode={darkMode} />
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar collapsed={collapsed} darkMode={darkMode} toggleTheme={toggleTheme} />
          <main
            className={`transition-all duration-300 p-4 pt-16 overflow-auto w-full ${
              collapsed ? "ml-16" : "ml-60"
            }`}
          >
            <Routes>
              <Route path="/Productos" element={<ProductOperations />} />
              <Route path="/Mesas" element={<MesaOperations />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
