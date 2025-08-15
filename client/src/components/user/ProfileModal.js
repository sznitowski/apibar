// src/components/user/ProfileModal.jsx
import { useEffect, useRef, useState } from "react";

export default function ProfileModal({ open, onClose, user, onSave, onChangeAvatar }) {
  const [nombre, setNombre] = useState(user?.nombre || user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setNombre(user?.nombre || user?.name || "");
      setAvatarUrl(user?.avatar || "");
    }
  }, [open, user]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-gray-900 border border-gray-700 text-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Editar perfil</h2>

        <div className="flex items-center gap-4 mb-4">
          <img
            src={avatarUrl || "https://i.pravatar.cc/100?img=3"}
            alt="avatar"
            className="w-16 h-16 rounded-full border"
          />
          <div className="space-x-2">
            <button
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
              onClick={() => fileRef.current?.click()}
            >
              Subir imagen
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
              onClick={() => setAvatarUrl("")}
            >
              Quitar
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onChangeAvatar(f);
              }}
            />
          </div>
        </div>

        <label className="block text-sm mb-1">Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full mb-3 rounded border border-gray-700 bg-gray-800 px-3 py-2"
          placeholder="Tu nombre"
        />

        <label className="block text-sm mb-1">Avatar (URL opcional)</label>
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full mb-6 rounded border border-gray-700 bg-gray-800 px-3 py-2"
          placeholder="https://..."
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700">
            Cancelar
          </button>
          <button
            onClick={() => onSave({ nombre, avatar: avatarUrl || undefined })}
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
