// src/components/user/UserMenu.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiUser } from "react-icons/fi";

const API_HOST = process.env.REACT_APP_API_HOST || "http://localhost:5000";

// Fuerza recarga del avatar cuando cambia (evita caché del navegador)
const avatarSrc = (raw) => {
  const fallback =
    "https://api.dicebear.com/7.x/notionists/svg?seed=Usuario&radius=50";
  if (!raw) return fallback;
  const url = /^https?:\/\//i.test(raw) ? raw : `${API_HOST}${raw}`;
  return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
};

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ref = useRef(null);

  // src se recalcula cuando cambia user?.avatar
  const src = useMemo(() => avatarSrc(user?.avatar), [user?.avatar]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const goPerfil = () => {
    setOpen(false);
    nav("/perfil");
  };

  return (
    <div className="relative" ref={ref}>
      <img
        key={user?.avatar} // ayuda a “forzar” rerender del <img>
        src={src}
        alt="avatar"
        className="w-10 h-10 rounded-full border-2 border-white cursor-pointer object-cover bg-gray-800"
        onClick={() => setOpen((v) => !v)}
      />

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-gray-900 border border-gray-700 z-50">
          <div className="p-4 flex items-center space-x-3 border-b border-gray-700">
            <img
              src={src}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover bg-gray-800"
            />
            <div>
              <p className="font-semibold text-white">
                {user?.nombre || "Usuario"}
              </p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={goPerfil}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded"
            >
              <FiUser className="mr-2" /> Perfil
            </button>

            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded"
            >
              <FiLogOut className="mr-2" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
