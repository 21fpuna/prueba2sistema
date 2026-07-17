/**
 * =====================================================================
 *  lib/api.ts
 * =====================================================================
 * Cliente HTTP centralizado para hablar con el backend Express.
 * Todas las respuestas del backend tienen la forma:
 *   { exito: true/false, mensaje: "...", datos: {...} }
 * =====================================================================
 */

export interface ApiRespuesta<T> {
  exito: boolean;
  mensaje: string;
  datos: T | null;
}

const BASE = "/api";

async function llamar<T>(
  metodo: string,
  ruta: string,
  body?: unknown
): Promise<ApiRespuesta<T>> {
  try {
    const opciones: RequestInit = {
      method: metodo,
      headers: { "Content-Type": "application/json" },
    };
    if (body !== undefined) opciones.body = JSON.stringify(body);

    const respuesta = await fetch(BASE + ruta, opciones);
    const data = (await respuesta.json()) as ApiRespuesta<T>;
    return data;
  } catch {
    return {
      exito: false,
      mensaje:
        'No se pudo conectar con el servidor. ¿Está corriendo "npm start"?',
      datos: null,
    };
  }
}

export const api = {
  get: <T>(ruta: string) => llamar<T>("GET", ruta),
  post: <T>(ruta: string, body: unknown) => llamar<T>("POST", ruta, body),
  put: <T>(ruta: string, body: unknown) => llamar<T>("PUT", ruta, body),
  delete: <T>(ruta: string) => llamar<T>("DELETE", ruta),
};

/** Arma un query string ignorando valores vacíos. Ej: {a: "1", b: ""} -> "?a=1" */
export function armarQuery(params: Record<string, string | number | undefined>) {
  const partes = Object.entries(params).filter(
    ([, v]) => v !== "" && v !== null && v !== undefined
  );
  return partes.length
    ? "?" + partes.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
    : "";
}

/* ------------------------- Tipos del dominio ------------------------- */

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  numeroDocumento: string;
  tipoDocumento: string;
  nacionalidad: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
}

export interface Concepto {
  id: number;
  descripcion: string;
  puntosRequeridos: number;
}

export interface Regla {
  id: number;
  limiteInferior: number;
  limiteSuperior: number | null;
  montoEquivalencia: number;
}

export interface Vencimiento {
  id: number;
  fechaInicioValidez: string;
  fechaFinValidez: string;
  diasDuracion: number;
}

export interface Bolsa {
  id: number;
  clienteId: number;
  fechaAsignacion: string;
  fechaCaducidad: string;
  puntajeAsignado: number;
  puntajeUtilizado: number;
  saldo: number;
  montoOperacion: number;
  estado: "vigente" | "vencido";
}

export interface UsoCabecera {
  id: number;
  clienteId: number;
  puntajeUtilizado: number;
  fecha: string;
  conceptoId: number;
}

export interface UsoDetalle {
  id: number;
  cabeceraId: number;
  puntajeUtilizado: number;
  bolsaId: number;
}


export interface Nivel {
  id: number;
  nombre: string;
  puntosMinimos: number;
  beneficios: string;
}

export interface NivelCliente {
  cliente: { id: number; nombre: string; apellido: string };
  puntosAcumulados: number;
  nivelActual: Nivel | null;
  nivelSiguiente: Nivel | null;
  puntosParaSiguienteNivel: number;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  puntosNecesarios: number;
}

export interface Canje {
  id: number;
  clienteId: number;
  productoId: number;
  cantidad: number;
  puntosUtilizados: number;
  fecha: string;
}

export interface Promocion {
  id: number;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  multiplicador: number;
  productoId: number | null;
  activa: boolean;
}

export interface Desafio {
  id: number;
  nombre: string;
  descripcion: string;
  metaPuntos: number;
  puntosRecompensa: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface DesafioProgreso extends Desafio {
  puntosAcumulados: number;
  porcentaje: number;
  completado: boolean;
  reclamado: boolean;
}

export interface Insignia {
  codigo: string;
  nombre: string;
  descripcion: string;
  obtenida: boolean;
}

export interface RankingFila {
  posicion: number;
  clienteId: number;
  nombre: string;
  apellido: string;
  puntosAcumulados: number;
}

export interface Encuesta {
  id: number;
  clienteId: number;
  puntuacion: number;
  comentario: string;
  fecha: string;
}

export interface EncuestaResumen {
  totalRespuestas: number;
  promedio: number;
  distribucion: Record<string, number>;
}

/* ------------------------- Utilidades de formato ------------------------- */

export function formatFecha(fecha: string | null | undefined) {
  if (!fecha) return "—";
  const d = new Date(fecha + (fecha.length === 10 ? "T00:00:00" : ""));
  return isNaN(d.getTime()) ? fecha : d.toLocaleDateString("es-PY");
}

export function formatMonto(monto: number | null | undefined) {
  if (monto === null || monto === undefined) return "—";
  return monto.toLocaleString("es-PY") + " Gs.";
}

export function nombreCompleto(cliente: Cliente | undefined | null) {
  return cliente ? `${cliente.nombre} ${cliente.apellido}` : "—";
}
