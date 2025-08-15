import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  clearAuthError,
  loginWithGoogle,
} from "../components/actions/authActions";
import { useNavigate } from "react-router-dom";
import GoogleButton from "../components/auth/GoogleButton";

export default function Login() {
  // ---- lógica que ya usabas
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [keep, setKeep] = useState(false);
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) navigate("/ventas/stock", { replace: true });
  }, [isAuthenticated, navigate]);
  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password: pass, keep }));
  };

  const onGoogle = (credential) => {
    // keep = respeta tu checkbox “Mantener sesión”
    dispatch(loginWithGoogle(credential, keep));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* ==== Fondo con blobs + preview borroso de la app ==== */}
      <BackgroundPreview />

      {/* ==== Capa de oscurecido sutil por encima del fondo ==== */}
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

      {/* ==== Tarjeta de Login (glass) ==== */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl">
          <div className="px-6 py-7">
            {/* Título + icon */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/90 shadow ring-1 ring-white/20" />
              <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
            </div>

            {/* Mensaje arriba del form (si querés poner algo) */}
            {/* <p className="mb-4 text-sm text-slate-300/80">Accedé para continuar</p> */}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-lg bg-slate-900/60 text-slate-100 placeholder-slate-400
                             border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/70
                             px-3 py-2.5"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    autoComplete="current-password"
                    className="w-full rounded-lg bg-slate-900/60 text-slate-100 placeholder-slate-400
                               border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/70
                               px-3 py-2.5 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 text-slate-300/80 hover:text-slate-100"
                    aria-label={
                      show ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {show ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={keep}
                    onChange={(e) => setKeep(e.target.checked)}
                    className="rounded border-white/20 bg-slate-900/60 text-indigo-500 focus:ring-indigo-500/70"
                  />
                  <span className="text-slate-300">Keep me signed in</span>
                </label>
                <a href="/forgot" className="text-slate-300 hover:text-white">
                  Forgot Password?
                </a>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg bg-indigo-600 hover:bg-indigo-500
                           text-white font-medium py-2.5 transition disabled:opacity-60
                           ring-1 ring-inset ring-white/10 shadow-lg"
              >
                {loading ? "Ingresando..." : "Login"}
              </button>
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-slate-400">o continuá con</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <GoogleButton onCredential={onGoogle} />
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-slate-400">
              <span>Terms</span> · <span>Privacy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Fondo: blobs + preview de la app borroso */
function BackgroundPreview() {
  return (
    <div className="absolute inset-0 -z-0">
      {/* Blobs */}
      <div className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-fuchsia-600/25 blur-[130px]" />

      {/* Mock de la app */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="scale-105 opacity-60 blur-xl">
          <AppMock />
        </div>
      </div>
    </div>
  );
}

/** Mini “screenshot” dinámico de tu app (sidebar + navbar + cards) */
function AppMock() {
  return (
    <div className="mx-auto h-[420px] w-[920px] rounded-2xl bg-slate-900/80 ring-1 ring-white/10 shadow-2xl overflow-hidden">
      {/* Navbar mock */}
      <div className="h-12 w-full bg-slate-800/80 border-b border-white/10" />
      <div className="flex h-[calc(420px-48px)]">
        {/* Sidebar mock */}
        <div className="w-52 bg-slate-850/80 border-r border-white/10" />
        {/* Content mock */}
        <div className="flex-1 p-6 grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-800/70 ring-1 ring-white/10"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
