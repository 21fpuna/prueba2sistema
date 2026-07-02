import { createRequire } from "module";
const require = createRequire(import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require("express");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── In-memory data store ───────────────────────────────────────────────────────

let clientes = [
  { id: 1, nombre: "Juan", apellido: "Pérez", documento: "1234567", tipoDocumento: "CI", nacionalidad: "Paraguaya", email: "juan.perez@email.com", telefono: "+595981123456", fechaNacimiento: "1985-03-15", puntos: 1250 },
  { id: 2, nombre: "María", apellido: "González", documento: "2345678", tipoDocumento: "CI", nacionalidad: "Paraguaya", email: "maria.gonzalez@email.com", telefono: "+595981234567", fechaNacimiento: "1990-07-22", puntos: 3400 },
  { id: 3, nombre: "Carlos", apellido: "Rodríguez", documento: "3456789", tipoDocumento: "CI", nacionalidad: "Paraguaya", email: "carlos.rodriguez@email.com", telefono: "+595981345678", fechaNacimiento: "1978-11-30", puntos: 890 },
  { id: 4, nombre: "Ana", apellido: "Silva", documento: "4567890", tipoDocumento: "CI", nacionalidad: "Paraguaya", email: "ana.silva@email.com", telefono: "+595981456789", fechaNacimiento: "1992-05-18", puntos: 2100 },
  { id: 5, nombre: "Roberto", apellido: "Martínez", documento: "5678901", tipoDocumento: "CI", nacionalidad: "Paraguaya", email: "roberto.martinez@email.com", telefono: "+595981567890", fechaNacimiento: "1988-09-25", puntos: 1750 },
];

let conceptos = [
  { id: 1, descripcion: "Vale de descuento 10%", puntosRequeridos: 500 },
  { id: 2, descripcion: "Vale de descuento 20%", puntosRequeridos: 1000 },
  { id: 3, descripcion: "Vale de premio - Producto gratis", puntosRequeridos: 1500 },
  { id: 4, descripcion: "Vale de consumición - Bebida gratis", puntosRequeridos: 300 },
  { id: 5, descripcion: "Vale de descuento 50%", puntosRequeridos: 2500 },
];

let reglas = [
  { id: 1, limiteInferior: 0, limiteSuperior: 199999, montoEquivalencia: 50000 },
  { id: 2, limiteInferior: 200000, limiteSuperior: 499999, montoEquivalencia: 30000 },
  { id: 3, limiteInferior: 500000, limiteSuperior: null, montoEquivalencia: 20000 },
];

let vencimientos = [
  { id: 1, fechaInicioValidez: "2026-01-01", fechaFinValidez: "2026-12-31", diasDuracion: 365 },
  { id: 2, fechaInicioValidez: "2026-06-01", fechaFinValidez: "2026-12-31", diasDuracion: 180 },
];

let bolsas = [
  { id: 1, clienteId: 1, clienteNombre: "Juan Pérez", fechaAsignacion: "2025-06-01", fechaCaducidad: "2026-06-01", puntajeAsignado: 500, puntajeUtilizado: 200, saldoPuntos: 300, montoOperacion: 250000 },
  { id: 2, clienteId: 1, clienteNombre: "Juan Pérez", fechaAsignacion: "2025-09-15", fechaCaducidad: "2026-09-15", puntajeAsignado: 800, puntajeUtilizado: 0, saldoPuntos: 800, montoOperacion: 400000 },
  { id: 3, clienteId: 2, clienteNombre: "María González", fechaAsignacion: "2025-07-20", fechaCaducidad: "2026-07-20", puntajeAsignado: 1200, puntajeUtilizado: 500, saldoPuntos: 700, montoOperacion: 600000 },
  { id: 4, clienteId: 3, clienteNombre: "Carlos Rodríguez", fechaAsignacion: "2025-12-10", fechaCaducidad: "2026-12-10", puntajeAsignado: 350, puntajeUtilizado: 100, saldoPuntos: 250, montoOperacion: 175000 },
  { id: 5, clienteId: 4, clienteNombre: "Ana Silva", fechaAsignacion: "2026-01-05", fechaCaducidad: "2027-01-05", puntajeAsignado: 900, puntajeUtilizado: 0, saldoPuntos: 900, montoOperacion: 450000 },
];

let usos = [
  { id: 1, clienteId: 1, clienteNombre: "Juan Pérez", puntajeUtilizado: 500, fecha: "2026-05-28", conceptoUso: "Vale de descuento 10%", detalles: [] },
  { id: 2, clienteId: 2, clienteNombre: "María González", puntajeUtilizado: 1000, fecha: "2026-05-25", conceptoUso: "Vale de descuento 20%", detalles: [] },
];

const nextId = (arr: { id: number }[]) =>
  arr.length > 0 ? Math.max(...arr.map((x) => x.id)) + 1 : 1;

// ── Clientes ───────────────────────────────────────────────────────────────────

app.get("/api/clientes", (req: { query: Record<string, string> }, res: { json: (d: unknown) => void }) => {
  let result = [...clientes];
  const { nombre, apellido, documento } = req.query;
  if (nombre) result = result.filter((c) => c.nombre.toLowerCase().includes(nombre.toLowerCase()));
  if (apellido) result = result.filter((c) => c.apellido.toLowerCase().includes(apellido.toLowerCase()));
  if (documento) result = result.filter((c) => c.documento.includes(documento));
  res.json(result);
});

app.get("/api/clientes/:id", (req: { params: { id: string } }, res: { json: (d: unknown) => void; status: (n: number) => { json: (d: unknown) => void } }) => {
  const c = clientes.find((c) => c.id === parseInt(req.params.id));
  if (!c) return res.status(404).json({ error: "Cliente no encontrado" });
  res.json(c);
});

app.post("/api/clientes", (req: { body: Record<string, unknown> }, res: { status: (n: number) => { json: (d: unknown) => void } }) => {
  const nuevo = { id: nextId(clientes), puntos: 0, ...req.body };
  clientes.push(nuevo as typeof clientes[0]);
  res.status(201).json(nuevo);
});

app.put("/api/clientes/:id", (req: { params: { id: string }; body: Record<string, unknown> }, res: { json: (d: unknown) => void; status: (n: number) => { json: (d: unknown) => void } }) => {
  const idx = clientes.findIndex((c) => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Cliente no encontrado" });
  clientes[idx] = { ...clientes[idx], ...req.body } as typeof clientes[0];
  res.json(clientes[idx]);
});

app.delete("/api/clientes/:id", (req: { params: { id: string } }, res: { status: (n: number) => { send: () => void; json: (d: unknown) => void } }) => {
  const idx = clientes.findIndex((c) => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Cliente no encontrado" });
  clientes.splice(idx, 1);
  res.status(204).send();
});

// ── Conceptos ──────────────────────────────────────────────────────────────────

app.get("/api/conceptos", (_req: unknown, res: { json: (d: unknown) => void }) => res.json(conceptos));

app.get("/api/conceptos/:id", (req: { params: { id: string } }, res: { json: (d: unknown) => void; status: (n: number) => { json: (d: unknown) => void } }) => {
  const c = conceptos.find((c) => c.id === parseInt(req.params.id));
  if (!c) return res.status(404).json({ error: "Concepto no encontrado" });
  res.json(c);
});

app.post("/api/conceptos", (req: { body: Record<string, unknown> }, res: { status: (n: number) => { json: (d: unknown) => void } }) => {
  const nuevo = { id: nextId(conceptos), ...req.body };
  conceptos.push(nuevo as typeof conceptos[0]);
  res.status(201).json(nuevo);
});

app.put("/api/conceptos/:id", (req: { params: { id: string }; body: Record<string, unknown> }, res: { json: (d: unknown) => void; status: (n: number) => { json: (d: unknown) => void } }) => {
  const idx = conceptos.findIndex((c) => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Concepto no encontrado" });
  conceptos[idx] = { ...conceptos[idx], ...req.body } as typeof conceptos[0];
  res.json(conceptos[idx]);
});

app.delete("/api/conceptos/:id", (req: { params: { id: string } }, res: { status: (n: number) => { send: () => void; json: (d: unknown) => void } }) => {
  const idx = conceptos.findIndex((c) => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Concepto no encontrado" });
  conceptos.splice(idx, 1);
  res.status(204).send();
});

// ── Reglas ─────────────────────────────────────────────────────────────────────

app.get("/api/reglas", (_req: unknown, res: { json: (d: unknown) => void }) => res.json(reglas));

app.get("/api/reglas/:id", (req: { params: { id: string } }, res: { json: (d: unknown) => void; status: (n: number) => { json: (d: unknown) => void } }) => {
  const r = reglas.find((r) => r.id === parseInt(req.params.id));
  if (!r) return res.status(404).json({ error: "Regla no encontrada" });
  res.json(r);
});

app.post("/api/reglas", (req: { body: Record<string, unknown> }, res: { status: (n: number) => { json: (d: unknown) => void } }) => {
  const nuevo = { id: nextId(reglas), ...req.body };
  reglas.push(nuevo as typeof reglas[0]);
  res.status(201).json(nuevo);
});

app.put("/api/reglas/:id", (req: { params: { id: string }; body: Record<string, unknown> }, res: { json: (d: unknown) => void; status: (n: number) => { json: (d: unknown) => void } }) => {
  const idx = reglas.findIndex((r) => r.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Regla no encontrada" });
  reglas[idx] = { ...reglas[idx], ...req.body } as typeof reglas[0];
  res.json(reglas[idx]);
});

app.delete("/api/reglas/:id", (req: { params: { id: string } }, res: { status: (n: number) => { send: () => void; json: (d: unknown) => void } }) => {
  const idx = reglas.findIndex((r) => r.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Regla no encontrada" });
  reglas.splice(idx, 1);
  res.status(204).send();
});

// ── Vencimientos ───────────────────────────────────────────────────────────────

app.get("/api/vencimientos", (_req: unknown, res: { json: (d: unknown) => void }) => res.json(vencimientos));

app.get("/api/vencimientos/:id", (req: { params: { id: string } }, res: { json: (d: unknown) => void; status: (n: number) => { json: (d: unknown) => void } }) => {
  const v = vencimientos.find((v) => v.id === parseInt(req.params.id));
  if (!v) return res.status(404).json({ error: "Vencimiento no encontrado" });
  res.json(v);
});

app.post("/api/vencimientos", (req: { body: Record<string, unknown> }, res: { status: (n: number) => { json: (d: unknown) => void } }) => {
  const nuevo = { id: nextId(vencimientos), ...req.body };
  vencimientos.push(nuevo as typeof vencimientos[0]);
  res.status(201).json(nuevo);
});

app.put("/api/vencimientos/:id", (req: { params: { id: string }; body: Record<string, unknown> }, res: { json: (d: unknown) => void; status: (n: number) => { json: (d: unknown) => void } }) => {
  const idx = vencimientos.findIndex((v) => v.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Vencimiento no encontrado" });
  vencimientos[idx] = { ...vencimientos[idx], ...req.body } as typeof vencimientos[0];
  res.json(vencimientos[idx]);
});

app.delete("/api/vencimientos/:id", (req: { params: { id: string } }, res: { status: (n: number) => { send: () => void; json: (d: unknown) => void } }) => {
  const idx = vencimientos.findIndex((v) => v.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Vencimiento no encontrado" });
  vencimientos.splice(idx, 1);
  res.status(204).send();
});

// ── Bolsas ─────────────────────────────────────────────────────────────────────

app.get("/api/bolsas", (req: { query: Record<string, string> }, res: { json: (d: unknown) => void }) => {
  const { clienteId, minSaldo, maxSaldo, diasVencer } = req.query;
  let result = [...bolsas];
  if (clienteId) result = result.filter((b) => b.clienteId === parseInt(clienteId));
  if (minSaldo) result = result.filter((b) => b.saldoPuntos >= parseInt(minSaldo));
  if (maxSaldo) result = result.filter((b) => b.saldoPuntos <= parseInt(maxSaldo));
  if (diasVencer) {
    const dias = parseInt(diasVencer);
    result = result.filter((b) => {
      if (b.saldoPuntos <= 0) return false;
      const diff = Math.ceil((new Date(b.fechaCaducidad).getTime() - Date.now()) / (1000 * 3600 * 24));
      return diff >= 0 && diff <= dias;
    });
  }
  res.json(result);
});

app.get("/api/bolsas/:id", (req: { params: { id: string } }, res: { json: (d: unknown) => void; status: (n: number) => { json: (d: unknown) => void } }) => {
  const b = bolsas.find((b) => b.id === parseInt(req.params.id));
  if (!b) return res.status(404).json({ error: "Bolsa no encontrada" });
  res.json(b);
});

app.post("/api/bolsas", (req: { body: Record<string, unknown> }, res: { status: (n: number) => { json: (d: unknown) => void } }) => {
  const nuevo = { id: nextId(bolsas), ...req.body };
  bolsas.push(nuevo as typeof bolsas[0]);
  res.status(201).json(nuevo);
});

app.put("/api/bolsas/:id", (req: { params: { id: string }; body: Record<string, unknown> }, res: { json: (d: unknown) => void; status: (n: number) => { json: (d: unknown) => void } }) => {
  const idx = bolsas.findIndex((b) => b.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Bolsa no encontrada" });
  bolsas[idx] = { ...bolsas[idx], ...req.body } as typeof bolsas[0];
  res.json(bolsas[idx]);
});

// ── Usos ───────────────────────────────────────────────────────────────────────

app.get("/api/usos", (req: { query: Record<string, string> }, res: { json: (d: unknown) => void }) => {
  const { clienteId, concepto, fechaInicio, fechaFin } = req.query;
  let result = [...usos];
  if (clienteId) result = result.filter((u) => u.clienteId === parseInt(clienteId));
  if (concepto && concepto !== "todos") result = result.filter((u) => u.conceptoUso === concepto);
  if (fechaInicio) result = result.filter((u) => u.fecha >= fechaInicio);
  if (fechaFin) result = result.filter((u) => u.fecha <= fechaFin);
  res.json(result);
});

app.get("/api/usos/:id", (req: { params: { id: string } }, res: { json: (d: unknown) => void; status: (n: number) => { json: (d: unknown) => void } }) => {
  const u = usos.find((u) => u.id === parseInt(req.params.id));
  if (!u) return res.status(404).json({ error: "Uso no encontrado" });
  res.json(u);
});

app.post("/api/usos", (req: { body: Record<string, unknown> }, res: { status: (n: number) => { json: (d: unknown) => void } }) => {
  const nuevo = { id: nextId(usos), fecha: new Date().toISOString().slice(0, 10), detalles: [], ...req.body };
  usos.push(nuevo as typeof usos[0]);
  res.status(201).json(nuevo);
});

// ── Health check ───────────────────────────────────────────────────────────────

app.get("/api/health", (_req: unknown, res: { json: (d: unknown) => void }) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    servicios: {
      clientes:     ["GET /api/clientes", "POST /api/clientes", "PUT /api/clientes/:id", "DELETE /api/clientes/:id"],
      conceptos:    ["GET /api/conceptos", "POST /api/conceptos", "PUT /api/conceptos/:id", "DELETE /api/conceptos/:id"],
      reglas:       ["GET /api/reglas", "POST /api/reglas", "PUT /api/reglas/:id", "DELETE /api/reglas/:id"],
      vencimientos: ["GET /api/vencimientos", "POST /api/vencimientos", "PUT /api/vencimientos/:id", "DELETE /api/vencimientos/:id"],
      bolsas:       ["GET /api/bolsas", "POST /api/bolsas", "PUT /api/bolsas/:id"],
      usos:         ["GET /api/usos", "POST /api/usos"],
    },
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor de Fidelización en http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
