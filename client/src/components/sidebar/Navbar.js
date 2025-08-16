import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiBell, FiSun, FiMoon } from "react-icons/fi";
import UserMenu from "../user/UserMenu";
import { logout } from "../actions/authActions";

export default function Navbar({ collapsed, darkMode, toggleTheme }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.usuario);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <nav className={`fixed top-0 h-12 z-50 right-0 transition-all duration-300
      ${collapsed ? "left-16" : "left-60"}
      bg-gray-900 text-white px-4 flex items-center justify-end border-b border-gray-700`}>
      <button
        onClick={toggleTheme}
        className="flex items-center text-sm px-3 py-1 mr-4 rounded bg-gray-800 hover:bg-gray-700"
      >
        {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
        <span className="ml-2">{darkMode ? "Light" : "Dark"}</span>
      </button>

      <div className="relative mr-4">
        <FiBell className="w-6 h-6 text-gray-300 cursor-pointer" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></span>
      </div>

      <UserMenu user={user} onLogout={handleLogout} />
    </nav>
  );
}
