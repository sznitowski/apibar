// src/pages/ProfilePage.jsx
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState, useMemo } from "react";
import AvatarGallery from "../components/user/AvatarGallery";
import { updatePerfil, updateAvatar } from "../components/actions/authActions";

const API_HOST = process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000";

const normalize = (raw) => {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${API_HOST}${raw}`; // ej.: /uploads/avatars/xxx.png
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.usuario);
  const saving = useSelector((s) => s.auth.loading);

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const fileRef = useRef(null);

  useEffect(() => {
    setNombre(user?.nombre || "");
    setAvatarUrl(user?.avatar || "");
  }, [user?.nombre, user?.avatar]);

  const preview = useMemo(() => {
    const u = normalize(avatarUrl) || normalize(user?.avatar);
    return (
      u ||
      "https://api.dicebear.com/7.x/notionists/svg?seed=Usuario&radius=50&backgroundColor=d1d4f9,ffd5dc&backgroundType=gradientLinear"
    );
  }, [avatarUrl, user?.avatar]);

  const guardar = async () => {
    setMsg("");
    setErr("");
    try {
      await dispatch(
        updatePerfil({
          nombre: (nombre || "").trim(),
          avatar: (avatarUrl || "").trim() || undefined,
        })
      );
      setMsg("Perfil actualizado.");
    } catch (e) {
      setErr(e?.message || "No se pudo actualizar el perfil");
    }
  };

  const subirArchivo = async (f) => {
    if (!f) return;
    setMsg("");
    setErr("");
    try {
      const updated = await dispatch(updateAvatar(f)); // el thunk devuelve el usuario
      if (updated?.avatar) setAvatarUrl(updated.avatar);
      setMsg("Imagen actualizada.");
    } catch (e) {
      setErr(e?.message || "No se pudo subir la imagen");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold text-white">Mi perfil</h1>

      <div className="rounded-xl border border-white/10 bg-slate-900 p-5 space-y-5">
        <div className="flex items-center gap-3">
          <img
            src={preview}
            alt="avatar"
            className="w-16 h-16 rounded-full border border-white/10 bg-slate-800 object-cover"
          />
          <div className="text-slate-300">
            <div className="text-sm">{user?.email}</div>
            <div className="text-xs opacity-70">Tu imagen pública en la app</div>
          </div>
        </div>

        {/* Acciones de imagen */}
        <div className="flex gap-2">
          <button type="button" className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white">
            Galería
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
            onClick={() => fileRef.current?.click()}
          >
            Subir imagen
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => subirArchivo(e.target.files?.[0])}
          />
        </div>

        {/* Galería (Hombres/Mujeres/Animales) */}
        <div className="border border-white/10 rounded-xl p-3">
          <AvatarGallery value={avatarUrl} onChange={setAvatarUrl} />
        </div>

        {/* URL opcional */}
        <div>
          <label className="block text-sm mb-1 text-slate-300">Avatar (URL opcional)</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm mb-1 text-slate-300">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
          />
        </div>

        {/* Feedback */}
        {(msg || err) && (
          <div
            className={`text-sm ${
              err ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {err || msg}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={guardar}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
