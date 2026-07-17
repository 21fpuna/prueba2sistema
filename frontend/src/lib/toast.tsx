/**
 * Sistema de notificaciones (toasts) liviano, con la misma API que usa el
 * diseño original (toast.success / toast.error de sonner).
 */
import { useEffect, useState, type ReactNode } from "react";

export interface ToastOpciones {
  description?: string;
  icon?: ReactNode;
}

interface ToastItem {
  id: number;
  tipo: "success" | "error";
  mensaje: string;
  opciones?: ToastOpciones;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let listeners: Listener[] = [];
let siguienteId = 1;

function emitir() {
  listeners.forEach((l) => l([...toasts]));
}

function agregar(tipo: "success" | "error", mensaje: string, opciones?: ToastOpciones) {
  const id = siguienteId++;
  toasts = [...toasts, { id, tipo, mensaje, opciones }];
  emitir();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emitir();
  }, 4500);
}

export const toast = {
  success: (mensaje: string, opciones?: ToastOpciones) =>
    agregar("success", mensaje, opciones),
  error: (mensaje: string, opciones?: ToastOpciones) =>
    agregar("error", mensaje, opciones),
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: Listener = (t) => setItems(t);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="toaster">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.tipo}`}>
          <div className="toast-titulo">
            {t.opciones?.icon}
            <span>{t.mensaje}</span>
          </div>
          {t.opciones?.description && (
            <p className="toast-descripcion">{t.opciones.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
