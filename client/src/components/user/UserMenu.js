// src/components/user/UserMenu.jsx
import { useState, useRef, useEffect } from "react";
import { FiLogOut, FiUser, FiSettings, FiEdit } from "react-icons/fi";
import ProfileModal from "./ProfileModal";

export default function UserMenu({ user, onLogout, onSaveProfile, onChangeAvatar }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const avatar = user?.avatar || "https://i.pravatar.cc/100?img=3";
  const nombre = user?.nombre || user?.name || "Usuario";
  const email = user?.email || "-";

  return (
    <div className="relative" ref={menuRef}>
      <img
        src={avatar}
        alt="avatar"
        className="w-10 h-10 rounded-full border-2 border-white cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      />

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-gray-900 border border-gray-700 z-50">
          <div className="p-4 flex items-center space-x-3 border-b border-gray-700">
            <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-semibold text-white">{nombre}</p>
              <p className="text-sm text-gray-400">{email}</p>
            </div>
          </div>
          <div className="p-2">
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded"
              onClick={() => { setEditOpen(true); setOpen(false); }}
            >
              <FiEdit className="mr-2" /> Editar perfil
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
              <FiSettings className="mr-2" /> Seguridad
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

      <ProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        onSave={(payload) => onSaveProfile(payload)}
        onChangeAvatar={(file) => onChangeAvatar(file)}
      />
    </div>
  );
}
