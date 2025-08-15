const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/auth";

async function parseResponse(r){
  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json")) return r.json();
  const text = await r.text(); return { _raw: text };
}

export async function loginApi({ email, password }) {
  const r = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",              // <-- cookie httpOnly
    body: JSON.stringify({ email, password }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.mensaje || "Credenciales inválidas");
  return data; // puede o no traer accessToken
}

export async function getPerfil(token) {
  const r = await fetch(`${API_URL}/perfil`, {
    headers: { Authorization: `Bearer ${token}` },
    // credentials: "include",
  });
  const data = await parseResponse(r);
  if (!r.ok) throw new Error(data?.mensaje || data?._raw || "No autorizado");
  return data;
}
