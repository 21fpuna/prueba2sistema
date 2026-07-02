// Capa de servicios HTTP — invoca el backend REST en /api/*
// Si el servidor no está disponible, lanza error (los componentes tienen fallback a localStorage)

const BASE = "/api";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
  return data as T;
}

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface Cliente {
  id: number; nombre: string; apellido: string; documento: string;
  tipoDocumento: string; nacionalidad: string; email: string;
  telefono: string; fechaNacimiento: string; puntos: number;
}

export interface Concepto { id: number; descripcion: string; puntosRequeridos: number; }
export interface Regla { id: number; limiteInferior: number; limiteSuperior: number | null; montoEquivalencia: number; }
export interface Vencimiento { id: number; fechaInicioValidez: string; fechaFinValidez: string; diasDuracion: number; }
export interface Bolsa {
  id: number; clienteId: number; clienteNombre: string;
  fechaAsignacion: string; fechaCaducidad: string;
  puntajeAsignado: number; puntajeUtilizado: number;
  saldoPuntos: number; montoOperacion: number;
}
export interface Uso {
  id: number; clienteId: number; clienteNombre: string;
  puntajeUtilizado: number; fecha: string; conceptoUso: string;
  detalles: { id: number; bolsaId: number; puntajeUtilizado: number }[];
}

// ── Servicio de Clientes ───────────────────────────────────────────────────────

export const clientesService = {
  getAll: (filtros?: { nombre?: string; apellido?: string; documento?: string }) => {
    const params = new URLSearchParams(filtros as Record<string, string>).toString();
    return request<Cliente[]>("GET", `/clientes${params ? "?" + params : ""}`);
  },
  getById: (id: number) => request<Cliente>("GET", `/clientes/${id}`),
  create: (data: Omit<Cliente, "id" | "puntos">) => request<Cliente>("POST", "/clientes", data),
  update: (id: number, data: Partial<Cliente>) => request<Cliente>("PUT", `/clientes/${id}`, data),
  delete: (id: number) => request<void>("DELETE", `/clientes/${id}`),
};

// ── Servicio de Conceptos de Uso ───────────────────────────────────────────────

export const conceptosService = {
  getAll: () => request<Concepto[]>("GET", "/conceptos"),
  getById: (id: number) => request<Concepto>("GET", `/conceptos/${id}`),
  create: (data: Omit<Concepto, "id">) => request<Concepto>("POST", "/conceptos", data),
  update: (id: number, data: Partial<Concepto>) => request<Concepto>("PUT", `/conceptos/${id}`, data),
  delete: (id: number) => request<void>("DELETE", `/conceptos/${id}`),
};

// ── Servicio de Reglas de Asignación ──────────────────────────────────────────

export const reglasService = {
  getAll: () => request<Regla[]>("GET", "/reglas"),
  getById: (id: number) => request<Regla>("GET", `/reglas/${id}`),
  create: (data: Omit<Regla, "id">) => request<Regla>("POST", "/reglas", data),
  update: (id: number, data: Partial<Regla>) => request<Regla>("PUT", `/reglas/${id}`, data),
  delete: (id: number) => request<void>("DELETE", `/reglas/${id}`),
};

// ── Servicio de Vencimientos ───────────────────────────────────────────────────

export const vencimientosService = {
  getAll: () => request<Vencimiento[]>("GET", "/vencimientos"),
  getById: (id: number) => request<Vencimiento>("GET", `/vencimientos/${id}`),
  create: (data: Omit<Vencimiento, "id">) => request<Vencimiento>("POST", "/vencimientos", data),
  update: (id: number, data: Partial<Vencimiento>) => request<Vencimiento>("PUT", `/vencimientos/${id}`, data),
  delete: (id: number) => request<void>("DELETE", `/vencimientos/${id}`),
};

// ── Servicio de Bolsas de Puntos ───────────────────────────────────────────────

export const bolsasService = {
  getAll: (filtros?: { clienteId?: number; minSaldo?: number; maxSaldo?: number; diasVencer?: number }) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filtros ?? {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString();
    return request<Bolsa[]>("GET", `/bolsas${params ? "?" + params : ""}`);
  },
  getById: (id: number) => request<Bolsa>("GET", `/bolsas/${id}`),
  create: (data: Omit<Bolsa, "id">) => request<Bolsa>("POST", "/bolsas", data),
  update: (id: number, data: Partial<Bolsa>) => request<Bolsa>("PUT", `/bolsas/${id}`, data),
};

// ── Servicio de Uso de Puntos ──────────────────────────────────────────────────

export const usosService = {
  getAll: (filtros?: { clienteId?: number; concepto?: string; fechaInicio?: string; fechaFin?: string }) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filtros ?? {}).filter(([, v]) => v).map(([k, v]) => [k, String(v)]))
    ).toString();
    return request<Uso[]>("GET", `/usos${params ? "?" + params : ""}`);
  },
  getById: (id: number) => request<Uso>("GET", `/usos/${id}`),
  create: (data: Omit<Uso, "id" | "fecha" | "detalles">) => request<Uso>("POST", "/usos", data),
};

// ── Health check ───────────────────────────────────────────────────────────────

export const healthCheck = () => request<{ status: string; timestamp: string }>("GET", "/health");
