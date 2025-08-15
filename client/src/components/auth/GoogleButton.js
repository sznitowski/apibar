import { useEffect, useRef } from "react";

export default function GoogleButton({ onCredential }) {
  const btnRef = useRef(null);

  useEffect(() => {
    // Carga el SDK una sola vez
    const scriptId = "google-identity";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.id = scriptId;
      document.head.appendChild(s);
      s.onload = init;
    } else {
      init();
    }

    function init() {
      /* global google */
      if (!window.google || !btnRef.current) return;
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => {
          // resp.credential es el ID Token (JWT)
          onCredential(resp.credential);
        },
        ux_mode: "popup",
      });
      google.accounts.id.renderButton(btnRef.current, {
        theme: "filled_black",
        size: "large",
        text: "continue_with", // texto base
        locale: "es",          // idioma
        shape: "pill",
        width: 360,
      });
    }
  }, [onCredential]);

  return <div ref={btnRef} className="w-full flex justify-center" />;
}
