import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Download, Search, Calendar } from "lucide-react";
import { Badge } from "./ui/badge";
import { useLocalStorage } from "../hooks/useLocalStorage";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Cliente {
  id: number; nombre: string; apellido: string; documento: string;
  tipoDocumento: string; nacionalidad: string; email: string;
  telefono: string; fechaNacimiento: string; puntos: number;
}

interface BolsaPuntos {
  id: number; clienteId: number; clienteNombre: string;
  fechaAsignacion: string; fechaCaducidad: string;
  puntajeAsignado: number; puntajeUtilizado: number;
  saldoPuntos: number; montoOperacion: number;
}

interface UsoRegistro {
  id: number; clienteId: number; clienteNombre: string;
  puntajeUtilizado: number; fecha: string; conceptoUso: string;
  detalles: { id: number; bolsaId: number; puntajeUtilizado: number }[];
}

// ── Canvas export ──────────────────────────────────────────────────────────────

function exportarImagen(titulo: string, columnas: string[], filas: string[][]) {
  const padding = 32;
  const rowH = 36;
  const headerH = 80;
  const colW = Math.max(160, Math.floor(Math.max(900, columnas.length * 200) / columnas.length));
  const totalW = colW * columnas.length + padding * 2;
  const totalH = headerH + rowH * (filas.length + 1) + padding * 2;

  const canvas = document.createElement("canvas");
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, totalW, totalH);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.fillText(titulo, padding, padding + 24);

  ctx.fillStyle = "#6b7280";
  ctx.font = "13px system-ui, sans-serif";
  ctx.fillText(
    `Generado el ${new Date().toLocaleDateString("es-PY", { day: "2-digit", month: "long", year: "numeric" })}`,
    padding, padding + 48
  );

  const tableTop = headerH;
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(padding, tableTop, totalW - padding * 2, rowH);
  ctx.fillStyle = "#374151";
  ctx.font = "bold 13px system-ui, sans-serif";
  columnas.forEach((col, i) => ctx.fillText(col, padding + colW * i + 12, tableTop + rowH / 2 + 5));

  filas.forEach((fila, rowIdx) => {
    const y = tableTop + rowH * (rowIdx + 1);
    ctx.fillStyle = rowIdx % 2 === 0 ? "#ffffff" : "#f9fafb";
    ctx.fillRect(padding, y, totalW - padding * 2, rowH);
    ctx.fillStyle = "#111827";
    ctx.font = "13px system-ui, sans-serif";
    fila.forEach((celda, colIdx) =>
      ctx.fillText(String(celda ?? ""), padding + colW * colIdx + 12, y + rowH / 2 + 5, colW - 24)
    );
  });

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  for (let r = 0; r <= filas.length + 1; r++) {
    const y = tableTop + rowH * r;
    ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(totalW - padding, y); ctx.stroke();
  }
  for (let c = 0; c <= columnas.length; c++) {
    const x = padding + colW * c;
    ctx.beginPath(); ctx.moveTo(x, tableTop); ctx.lineTo(x, tableTop + rowH * (filas.length + 1)); ctx.stroke();
  }

  const link = document.createElement("a");
  link.download = `${titulo.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ── Component ──────────────────────────────────────────────────────────────────

const initialClientes: Cliente[] = [
  { id: 1, nombre: "Juan", apellido: "Pérez", documento: "1234567", tipoDocumento: "CI", nacionalidad: "Paraguaya", email: "juan.perez@email.com", telefono: "+595981123456", fechaNacimiento: "1985-03-15", puntos: 1250 },
  { id: 2, nombre: "María", apellido: "González", documento: "2345678", tipoDocumento: "CI", nacionalidad: "Paraguaya", email: "maria.gonzalez@email.com", telefono: "+595981234567", fechaNacimiento: "1990-07-22", puntos: 3400 },
  { id: 3, nombre: "Carlos", apellido: "Rodríguez", documento: "3456789", tipoDocumento: "CI", nacionalidad: "Paraguaya", email: "carlos.rodriguez@email.com", telefono: "+595981345678", fechaNacimiento: "1978-11-30", puntos: 890 },
  { id: 4, nombre: "Ana", apellido: "Silva", documento: "4567890", tipoDocumento: "CI", nacionalidad: "Paraguaya", email: "ana.silva@email.com", telefono: "+595981456789", fechaNacimiento: "1992-05-18", puntos: 2100 },
  { id: 5, nombre: "Roberto", apellido: "Martínez", documento: "5678901", tipoDocumento: "CI", nacionalidad: "Paraguaya", email: "roberto.martinez@email.com", telefono: "+595981567890", fechaNacimiento: "1988-09-25", puntos: 1750 },
];

const initialBolsas: BolsaPuntos[] = [
  { id: 1, clienteId: 1, clienteNombre: "Juan Pérez", fechaAsignacion: "2025-06-01", fechaCaducidad: "2026-06-01", puntajeAsignado: 500, puntajeUtilizado: 200, saldoPuntos: 300, montoOperacion: 250000 },
  { id: 2, clienteId: 1, clienteNombre: "Juan Pérez", fechaAsignacion: "2025-09-15", fechaCaducidad: "2026-09-15", puntajeAsignado: 800, puntajeUtilizado: 0, saldoPuntos: 800, montoOperacion: 400000 },
  { id: 3, clienteId: 2, clienteNombre: "María González", fechaAsignacion: "2025-07-20", fechaCaducidad: "2026-07-20", puntajeAsignado: 1200, puntajeUtilizado: 500, saldoPuntos: 700, montoOperacion: 600000 },
  { id: 4, clienteId: 3, clienteNombre: "Carlos Rodríguez", fechaAsignacion: "2025-12-10", fechaCaducidad: "2026-12-10", puntajeAsignado: 350, puntajeUtilizado: 100, saldoPuntos: 250, montoOperacion: 175000 },
  { id: 5, clienteId: 4, clienteNombre: "Ana Silva", fechaAsignacion: "2026-01-05", fechaCaducidad: "2027-01-05", puntajeAsignado: 900, puntajeUtilizado: 0, saldoPuntos: 900, montoOperacion: 450000 },
  { id: 6, clienteId: 2, clienteNombre: "María González", fechaAsignacion: "2025-05-15", fechaCaducidad: "2026-05-15", puntajeAsignado: 600, puntajeUtilizado: 600, saldoPuntos: 0, montoOperacion: 300000 },
];

const initialUsos: UsoRegistro[] = [
  { id: 1, clienteId: 1, clienteNombre: "Juan Pérez", puntajeUtilizado: 500, fecha: "2026-05-28", conceptoUso: "Vale de descuento 10%", detalles: [] },
  { id: 2, clienteId: 2, clienteNombre: "María González", puntajeUtilizado: 1000, fecha: "2026-05-25", conceptoUso: "Vale de descuento 20%", detalles: [] },
  { id: 3, clienteId: 3, clienteNombre: "Carlos Rodríguez", puntajeUtilizado: 300, fecha: "2026-05-20", conceptoUso: "Vale de consumición - Bebida gratis", detalles: [] },
  { id: 4, clienteId: 1, clienteNombre: "Juan Pérez", puntajeUtilizado: 500, fecha: "2026-05-15", conceptoUso: "Vale de descuento 10%", detalles: [] },
  { id: 5, clienteId: 2, clienteNombre: "María González", puntajeUtilizado: 1500, fecha: "2026-05-10", conceptoUso: "Vale de premio - Producto gratis", detalles: [] },
];

export function Consultas() {
  const [clientes] = useLocalStorage<Cliente[]>("fidelizacion_clientes", initialClientes);
  const [bolsas] = useLocalStorage<BolsaPuntos[]>("fidelizacion_bolsas", initialBolsas);
  const [usos] = useLocalStorage<UsoRegistro[]>("fidelizacion_usos", initialUsos);

  // ── Uso de Puntos filters ──
  const [conceptoFiltro, setConceptoFiltro] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [usosResult, setUsosResult] = useState<UsoRegistro[] | null>(null);

  // ── Bolsa de Puntos filters ──
  const [clienteFiltro, setClienteFiltro] = useState("todos");
  const [puntosMin, setPuntosMin] = useState("");
  const [puntosMax, setPuntosMax] = useState("");
  const [bolsasResult, setBolsasResult] = useState<BolsaPuntos[] | null>(null);

  // ── Puntos a Vencer ──
  const [diasVencer, setDiasVencer] = useState("30");
  const [vencerResult, setVencerResult] = useState<BolsaPuntos[] | null>(null);

  // ── Búsqueda Clientes ──
  const [searchNombre, setSearchNombre] = useState("");
  const [searchApellido, setSearchApellido] = useState("");

  const formatFecha = (f: string) => new Date(f).toLocaleDateString("es-PY");
  const formatMonto = (n: number) => n.toLocaleString("es-PY") + " Gs.";

  // ── Consultar handlers ──────────────────────────────────────────────────────

  const consultarUsoPuntos = () => {
    let result = [...usos];
    if (conceptoFiltro !== "todos") {
      result = result.filter((u) =>
        u.conceptoUso.toLowerCase().includes(conceptoFiltro.toLowerCase())
      );
    }
    if (fechaInicio) result = result.filter((u) => u.fecha >= fechaInicio);
    if (fechaFin) result = result.filter((u) => u.fecha <= fechaFin);
    setUsosResult(result);
  };

  const consultarBolsaPuntos = () => {
    let result = [...bolsas];
    if (clienteFiltro !== "todos") {
      result = result.filter((b) => b.clienteId.toString() === clienteFiltro);
    }
    if (puntosMin) result = result.filter((b) => b.saldoPuntos >= parseInt(puntosMin));
    if (puntosMax) result = result.filter((b) => b.saldoPuntos <= parseInt(puntosMax));
    setBolsasResult(result);
  };

  const consultarPuntosVencer = () => {
    const dias = parseInt(diasVencer);
    const hoy = new Date();
    const result = bolsas.filter((b) => {
      if (b.saldoPuntos <= 0) return false;
      const caducidad = new Date(b.fechaCaducidad);
      const diff = Math.ceil((caducidad.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
      return diff >= 0 && diff <= dias;
    });
    setVencerResult(result);
  };

  // ── Resumen de usos por concepto (para la tabla agrupada) ──
  const usosParaMostrar = usosResult ?? usos;
  const usoPorConcepto = Object.values(
    usosParaMostrar.reduce<Record<string, { concepto: string; cantidadCanjes: number; puntosUtilizados: number }>>((acc, u) => {
      if (!acc[u.conceptoUso]) acc[u.conceptoUso] = { concepto: u.conceptoUso, cantidadCanjes: 0, puntosUtilizados: 0 };
      acc[u.conceptoUso].cantidadCanjes += 1;
      acc[u.conceptoUso].puntosUtilizados += u.puntajeUtilizado;
      return acc;
    }, {})
  );

  const bolsasParaMostrar = bolsasResult ?? bolsas;
  const vencerParaMostrar = vencerResult ?? [];

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchNombre.toLowerCase()) &&
      c.apellido.toLowerCase().includes(searchApellido.toLowerCase())
  );

  // ── Clientes únicos para select ──
  const clientesUnicos = Array.from(
    new Map(bolsas.map((b) => [b.clienteId, { id: b.clienteId, nombre: b.clienteNombre }])).values()
  );

  // ── Conceptos únicos ──
  const conceptosUnicos = Array.from(new Set(usos.map((u) => u.conceptoUso)));

  // ── Export handlers ─────────────────────────────────────────────────────────

  const exportarUsoPuntos = () =>
    exportarImagen(
      "Uso de Puntos por Concepto",
      ["Concepto de Uso", "Cantidad de Canjes", "Total Puntos Utilizados"],
      usoPorConcepto.map((r) => [r.concepto, `${r.cantidadCanjes} canjes`, `${r.puntosUtilizados.toLocaleString()} pts`])
    );

  const exportarBolsaPuntos = () =>
    exportarImagen(
      "Bolsa de Puntos",
      ["ID", "Cliente", "Saldo Pts", "Asignado", "Utilizado", "Vence"],
      bolsasParaMostrar.map((b) => [
        String(b.id), b.clienteNombre,
        `${b.saldoPuntos} pts`, `${b.puntajeAsignado} pts`,
        `${b.puntajeUtilizado} pts`, formatFecha(b.fechaCaducidad),
      ])
    );

  const exportarPuntosVencer = () =>
    exportarImagen(
      `Puntos a Vencer (${diasVencer} días)`,
      ["Cliente", "Saldo Pts", "Vence", "Días Restantes"],
      vencerParaMostrar.map((b) => {
        const dias = Math.ceil((new Date(b.fechaCaducidad).getTime() - Date.now()) / (1000 * 3600 * 24));
        return [b.clienteNombre, `${b.saldoPuntos} pts`, formatFecha(b.fechaCaducidad), `${dias} días`];
      })
    );

  const exportarClientes = () =>
    exportarImagen(
      "Búsqueda de Clientes",
      ["ID", "Nombre Completo", "Documento", "Email", "Nacimiento", "Puntos"],
      clientesFiltrados.map((c) => [
        String(c.id), `${c.nombre} ${c.apellido}`,
        `${c.tipoDocumento}: ${c.documento}`, c.email,
        formatFecha(c.fechaNacimiento), `${c.puntos} pts`,
      ])
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Consultas y Reportes</h1>
        <p className="text-muted-foreground">
          Generación de reportes y consultas del sistema de fidelización
        </p>
      </div>

      <Tabs defaultValue="uso-puntos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="uso-puntos">Uso de Puntos</TabsTrigger>
          <TabsTrigger value="bolsa-puntos">Bolsa de Puntos</TabsTrigger>
          <TabsTrigger value="puntos-vencer">Puntos a Vencer</TabsTrigger>
          <TabsTrigger value="clientes">Búsqueda Clientes</TabsTrigger>
        </TabsList>

        {/* ── Uso de Puntos ── */}
        <TabsContent value="uso-puntos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consulta de Uso de Puntos</CardTitle>
              <div className="grid gap-4 mt-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Concepto de Uso</Label>
                  <Select value={conceptoFiltro} onValueChange={setConceptoFiltro}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {conceptosUnicos.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha Inicio</Label>
                  <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin</Label>
                  <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={consultarUsoPuntos}>
                  <Search className="mr-2 size-4" />Consultar
                </Button>
                <Button variant="outline" onClick={exportarUsoPuntos}>
                  <Download className="mr-2 size-4" />Exportar imagen
                </Button>
              </div>
              {usosResult !== null && (
                <p className="text-sm text-muted-foreground mt-2">
                  {usoPorConcepto.length} concepto(s) encontrado(s)
                </p>
              )}
            </CardHeader>
            <CardContent>
              {usosResult === null ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aplique los filtros y haga clic en <strong>Consultar</strong> para ver los resultados.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Concepto de Uso</TableHead>
                      <TableHead>Cantidad de Canjes</TableHead>
                      <TableHead>Total Puntos Utilizados</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usoPorConcepto.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Sin resultados</TableCell></TableRow>
                    ) : (
                      usoPorConcepto.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.concepto}</TableCell>
                          <TableCell><Badge variant="secondary">{item.cantidadCanjes} canjes</Badge></TableCell>
                          <TableCell><Badge>{item.puntosUtilizados.toLocaleString()} pts</Badge></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Bolsa de Puntos ── */}
        <TabsContent value="bolsa-puntos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consulta de Bolsa de Puntos</CardTitle>
              <div className="grid gap-4 mt-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={clienteFiltro} onValueChange={setClienteFiltro}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {clientesUnicos.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Saldo Mínimo (pts)</Label>
                  <Input type="number" placeholder="0" value={puntosMin} onChange={(e) => setPuntosMin(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Saldo Máximo (pts)</Label>
                  <Input type="number" placeholder="10000" value={puntosMax} onChange={(e) => setPuntosMax(e.target.value)} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={consultarBolsaPuntos}>
                  <Search className="mr-2 size-4" />Consultar
                </Button>
                <Button variant="outline" onClick={exportarBolsaPuntos}>
                  <Download className="mr-2 size-4" />Exportar imagen
                </Button>
              </div>
              {bolsasResult !== null && (
                <p className="text-sm text-muted-foreground mt-2">
                  {bolsasResult.length} bolsa(s) encontrada(s)
                </p>
              )}
            </CardHeader>
            <CardContent>
              {bolsasResult === null ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aplique los filtros y haga clic en <strong>Consultar</strong> para ver los resultados.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Asignado</TableHead>
                      <TableHead>Utilizado</TableHead>
                      <TableHead>Vence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bolsasResult.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Sin resultados</TableCell></TableRow>
                    ) : (
                      bolsasResult.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell>{b.id}</TableCell>
                          <TableCell>{b.clienteNombre}</TableCell>
                          <TableCell><Badge variant={b.saldoPuntos > 0 ? "default" : "secondary"}>{b.saldoPuntos} pts</Badge></TableCell>
                          <TableCell>{b.puntajeAsignado} pts</TableCell>
                          <TableCell>{b.puntajeUtilizado} pts</TableCell>
                          <TableCell className="text-sm">{formatFecha(b.fechaCaducidad)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Puntos a Vencer ── */}
        <TabsContent value="puntos-vencer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes con Puntos a Vencer</CardTitle>
              <div className="grid gap-4 mt-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Días para Vencimiento</Label>
                  <Select value={diasVencer} onValueChange={setDiasVencer}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="15">15 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="60">60 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={consultarPuntosVencer}>
                  <Search className="mr-2 size-4" />Consultar
                </Button>
                <Button variant="outline" onClick={exportarPuntosVencer} disabled={vencerParaMostrar.length === 0}>
                  <Download className="mr-2 size-4" />Exportar imagen
                </Button>
              </div>
              {vencerResult !== null && (
                <p className="text-sm text-muted-foreground mt-2">
                  {vencerResult.length} bolsa(s) próximas a vencer
                </p>
              )}
            </CardHeader>
            <CardContent>
              {vencerResult === null ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Seleccione los días y haga clic en <strong>Consultar</strong> para ver los resultados.
                </p>
              ) : vencerResult.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay bolsas próximas a vencer en los próximos {diasVencer} días.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Saldo Pts</TableHead>
                      <TableHead>Fecha Vencimiento</TableHead>
                      <TableHead>Días Restantes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vencerResult.map((b) => {
                      const dias = Math.ceil((new Date(b.fechaCaducidad).getTime() - Date.now()) / (1000 * 3600 * 24));
                      return (
                        <TableRow key={b.id}>
                          <TableCell>{b.clienteNombre}</TableCell>
                          <TableCell><Badge variant="destructive">{b.saldoPuntos} pts</Badge></TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {formatFecha(b.fechaCaducidad)}
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline">{dias} días</Badge></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Búsqueda Clientes ── */}
        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Búsqueda de Clientes</CardTitle>
              <div className="grid gap-4 mt-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="searchNombre">Nombre</Label>
                  <Input id="searchNombre" placeholder="Ingrese el nombre..." value={searchNombre} onChange={(e) => setSearchNombre(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchApellido">Apellido</Label>
                  <Input id="searchApellido" placeholder="Ingrese el apellido..." value={searchApellido} onChange={(e) => setSearchApellido(e.target.value)} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={exportarClientes} disabled={clientesFiltrados.length === 0}>
                  <Download className="mr-2 size-4" />Exportar imagen
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {clientesFiltrados.length} cliente(s) encontrado(s)
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nacimiento</TableHead>
                    <TableHead>Puntos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Sin resultados</TableCell></TableRow>
                  ) : (
                    clientesFiltrados.map((cliente) => {
                      const cumple = new Date(cliente.fechaNacimiento);
                      const hoy = new Date();
                      const esCumple = cumple.getMonth() === hoy.getMonth() && cumple.getDate() === hoy.getDate();
                      return (
                        <TableRow key={cliente.id}>
                          <TableCell>{cliente.id}</TableCell>
                          <TableCell>
                            {cliente.nombre} {cliente.apellido}
                            {esCumple && <Badge variant="outline" className="ml-2">🎂 Cumpleaños</Badge>}
                          </TableCell>
                          <TableCell>{cliente.tipoDocumento}: {cliente.documento}</TableCell>
                          <TableCell className="text-sm">{cliente.email}</TableCell>
                          <TableCell className="text-sm">{formatFecha(cliente.fechaNacimiento)}</TableCell>
                          <TableCell><Badge variant="secondary">{cliente.puntos} pts</Badge></TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
