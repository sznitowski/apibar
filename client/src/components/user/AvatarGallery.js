import { useMemo, useState } from "react";

// arma una URL de DiceBear v7
const makeUrl = (style, seed) =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(
    seed
  )}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc&backgroundType=gradientLinear`;

// seeds (podés cambiar nombres)
const MEN = ["Alejo","Benjamín","Bruno","Diego","Facundo","Iván","Julián","Leo","Matías","Nicolás","Santiago","Tomás"];
const WOMEN = ["Agustina","Camila","Carolina","Daniela","Florencia","Lucía","María","Paula","Rocío","Sofía","Valentina","Ximena"];
const ANIMALS = ["Zorro","Panda","Tigre","Gato","Perro","Lobo","Búho","Koala","Zebra","Delfín","Tortuga","León"];

// estilos con mejor look
const TABS = [
  { id: "men",     label: "Hombres",  style: "notionists",         seeds: MEN },
  { id: "women",   label: "Mujeres",  style: "notionists-neutral", seeds: WOMEN },
  { id: "animals", label: "Animales", style: "fun-emoji",          seeds: ANIMALS },
];

export default function AvatarGallery({ value, onChange }) {
  const [tab, setTab] = useState("men");

  const urls = useMemo(() => {
    const t = TABS.find(x => x.id === tab) || TABS[0];
    return t.seeds.map(seed => makeUrl(t.style, seed));
  }, [tab]);

  return (
    <div className="space-y-3">
      {/* pestañas */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition
              ${tab === t.id ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* grilla */}
      <div className="grid grid-cols-6 gap-3">
        {urls.map(url => {
          const selected = value === url;
          return (
            <button
              key={url}
              type="button"
              onClick={() => onChange?.(url)}
              className={`relative aspect-square rounded-xl overflow-hidden ring-1 transition
                ${selected ? "ring-2 ring-indigo-500" : "ring-white/10 hover:ring-white/30"}`}
              aria-label="Elegir avatar"
            >
              <img
                src={url}
                alt="avatar"
                className="w-full h-full object-cover bg-slate-800"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
