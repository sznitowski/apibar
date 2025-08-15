// src/components/auth/SessionLoader.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { cargarSesion } from "../actions/authActions"; // ajustá ruta si difiere

export default function SessionLoader() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(cargarSesion()); }, [dispatch]);
  return null;
}
