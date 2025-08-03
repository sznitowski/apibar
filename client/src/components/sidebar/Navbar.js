import { useState, useRef, useEffect } from "react";
import { FiLogOut, FiUser, FiSettings, FiBell, FiSun, FiMoon } from "react-icons/fi";

const Navbar = ({ collapsed, darkMode, toggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    console.log("Cerrando sesión...");
  };

  return (
    <nav
      className={`fixed top-0 h-12 z-50 right-0 transition-all duration-300
      ${collapsed ? "left-16" : "left-60"}
      bg-gray-900 text-white px-4 flex items-center justify-end border-b border-gray-700`}
    >
      {/* Botón Tema */}
      <button
        onClick={toggleTheme}
        className="flex items-center text-sm px-3 py-1 mr-4 rounded bg-gray-800 hover:bg-gray-700"
      >
        {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
        <span className="ml-2">{darkMode ? "Light" : "Dark"}</span>
      </button>

      {/* Notificación */}
      <div className="relative mr-4">
        <FiBell className="w-6 h-6 text-gray-300 cursor-pointer" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></span>
      </div>

      {/* Menú de usuario */}
      <div className="relative" ref={menuRef}>
        <img
          src="https://i.pravatar.cc/40?img=3"
          alt="avatar"
          className="w-10 h-10 rounded-full border-2 border-white cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        />
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-4 flex items-center space-x-3 border-b border-gray-700">
              <img
                src="https://i.pravatar.cc/40?img=3"
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold text-white">Rene Wells</p>
                <p className="text-sm text-gray-400">rene@devias.io</p>
              </div>
            </div>
            <div className="p-2">
              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
                <FiUser className="mr-2" /> Perfil
              </button>
              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
                <FiSettings className="mr-2" /> Seguridad
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded"
              >
                <FiLogOut className="mr-2" /> Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
