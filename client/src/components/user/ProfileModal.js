import { useEffect, useRef, useState } from "react";
import AvatarGallery from "./AvatarGallery";

export default function ProfileModal({
  open,
  onClose,
  user,
  onSave,             // (payload: { nombre: string, avatar?: string }) => void
  onUpload,           // (file: File) => Promise<string> | void  -> debe devolver URL o actualizar solo
  loading = false,
}) {
  const [nombre, setNombre] = useState(user?.nombre || user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [tab, setTab] = useState("galeria"); // 'galeria' | 'subir' | 'url'
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setNombre(user?.nombre || user?.name || "");
      setAvatarUrl(user?.avatar || "");
      setTab("galeria");
    }
  }, [open, user]);

  if (!open) return null;

  const preview =
    avatarUrl ||
    user?.avatar ||
    "https://api.dicebear.com/7.x/notionists/svg?seed=Usuario&radius=50&backgroundColor=d1d4f9,ffd5dc&backgroundType=gradientLinear";

  const handleSave = async () => {
    onSave?.({
      nombre: (nombre || "").trim(),
      avatar: avatarUrl || undefined,
    });
  };

  const handleUpload = async (file) => {
    if (!file) return;
    // si te devuelven URL desde el backend, usala; si no, el backend actualizará y luego refrescás el perfil
    const maybeUrl = await onUpload?.(file);
    if (typeof maybeUrl === "string") setAvatarUrl(maybeUrl);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0f172a] text-slate-100 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Editar perfil</h2>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6 space-y-5">
          {/* Vista previa */}
          <div className="flex items-center gap-3">
            <img
              src={preview}
              alt="avatar"
              className="w-14 h-14 rounded-full border border-white/10 bg-slate-800"
            />
            <span className="text-sm text-slate-300">Vista previa del avatar</span>
          </div>

          {/* Tabs del selector */}
          <div className="flex gap-2">
            {[
              { id: "galeria", label: "Galería" },
              { id: "subir",   label: "Subir imagen" },
              { id: "url",     label: "Usar URL" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition
                  ${tab === t.id ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Contenido por tab */}
          {tab === "galeria" && (
            <div className="border border-white/10 rounded-xl p-3">
              <AvatarGallery value={avatarUrl} onChange={setAvatarUrl} />
            </div>
          )}

          {tab === "subir" && (
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Subí una imagen (JPG/PNG/SVG)</p>
              <div className="flex items-center gap-3">
                <button
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700"
                  onClick={() => fileRef.current?.click()}
                >
                  Elegir archivo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
                <span className="text-xs text-slate-400">Se guardará al subir.</span>
              </div>
            </div>
          )}

          {tab === "url" && (
            <div>
              <label className="block text-sm mb-1">Avatar (URL)</label>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                placeholder="https://…"
              />
            </div>
          )}

          {/* ÚNICO input: Nombre */}
          <div>
            <label className="block text-sm mb-1">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
              placeholder="Tu nombre"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-4 border-t border-white/10 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
