import { useState, useRef, useEffect } from "react";
import { FiLogOut, FiUser, FiSettings } from "react-icons/fi";

const UserMenu = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar */}
      <img
        src="https://i.pravatar.cc/40?img=3"
        alt="avatar"
        className="w-10 h-10 rounded-full border-2 border-white cursor-pointer"
        onClick={() => setOpen(!open)}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-gray-900 border border-gray-700 z-50">
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
              <FiUser className="mr-2" /> Profile
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
              <FiSettings className="mr-2" /> Security
            </button>
            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
