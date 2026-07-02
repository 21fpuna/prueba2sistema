import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
import { Search, Calendar, AlertTriangle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface BolsaPuntos {
  id: number;
  clienteId: number;
  clienteNombre: string;
  fechaAsignacion: string;
  fechaCaducidad: string;
  puntajeAsignado: number;
  puntajeUtilizado: number;
  saldoPuntos: number;
  montoOperacion: number;
}

const initialBolsas: BolsaPuntos[] = [
  {
    id: 1,
    clienteId: 1,
    clienteNombre: "Juan Pérez",
    fechaAsignacion: "2025-06-01",
    fechaCaducidad: "2026-06-01",
    puntajeAsignado: 500,
    puntajeUtilizado: 200,
    saldoPuntos: 300,
    montoOperacion: 250000,
  },
  {
    id: 2,
    clienteId: 1,
    clienteNombre: "Juan Pérez",
    fechaAsignacion: "2025-09-15",
    fechaCaducidad: "2026-09-15",
    puntajeAsignado: 800,
    puntajeUtilizado: 0,
    saldoPuntos: 800,
    montoOperacion: 400000,
  },
  {
    id: 3,
    clienteId: 2,
    clienteNombre: "María González",
    fechaAsignacion: "2025-07-20",
    fechaCaducidad: "2026-07-20",
    puntajeAsignado: 1200,
    puntajeUtilizado: 500,
    saldoPuntos: 700,
    montoOperacion: 600000,
  },
  {
    id: 4,
    clienteId: 3,
    clienteNombre: "Carlos Rodríguez",
    fechaAsignacion: "2025-12-10",
    fechaCaducidad: "2026-12-10",
    puntajeAsignado: 350,
    puntajeUtilizado: 100,
    saldoPuntos: 250,
    montoOperacion: 175000,
  },
  {
    id: 5,
    clienteId: 4,
    clienteNombre: "Ana Silva",
    fechaAsignacion: "2026-01-05",
    fechaCaducidad: "2027-01-05",
    puntajeAsignado: 900,
    puntajeUtilizado: 0,
    saldoPuntos: 900,
    montoOperacion: 450000,
  },
  {
    id: 6,
    clienteId: 2,
    clienteNombre: "María González",
    fechaAsignacion: "2025-05-15",
    fechaCaducidad: "2026-05-15",
    puntajeAsignado: 600,
    puntajeUtilizado: 600,
    saldoPuntos: 0,
    montoOperacion: 300000,
  },
];

export function BolsaPuntos() {
  const [bolsas] = useLocalStorage<BolsaPuntos[]>("fidelizacion_bolsas", initialBolsas);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCliente, setFilterCliente] = useState<string>("todos");

  const clientes = Array.from(
    new Map(bolsas.map((b) => [b.clienteId, { id: b.clienteId, nombre: b.clienteNombre }])).values()
  );

  const filteredBolsas = bolsas.filter((bolsa) => {
    const matchesSearch =
      bolsa.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bolsa.id.toString().includes(searchTerm);

    const matchesCliente =
      filterCliente === "todos" ||
      bolsa.clienteId.toString() === filterCliente;

    return matchesSearch && matchesCliente;
  });

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-PY");
  };

  const formatMonto = (monto: number) => {
    return monto.toLocaleString("es-PY") + " Gs.";
  };

  const getDiasParaVencer = (fechaCaducidad: string) => {
    const hoy = new Date();
    const caducidad = new Date(fechaCaducidad);
    const diff = caducidad.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getEstadoBolsa = (bolsa: BolsaPuntos) => {
    const dias = getDiasParaVencer(bolsa.fechaCaducidad);
    if (bolsa.saldoPuntos === 0) return { label: "Agotada", variant: "secondary" as const };
    if (dias < 0) return { label: "Vencida", variant: "destructive" as const };
    if (dias <= 30) return { label: "Por vencer", variant: "outline" as const };
    return { label: "Activa", variant: "default" as const };
  };

  const getPorcentajeUtilizado = (bolsa: BolsaPuntos) => {
    return (bolsa.puntajeUtilizado / bolsa.puntajeAsignado) * 100;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Bolsa de Puntos</h1>
        <p className="text-muted-foreground">
          Visualización de bolsas de puntos asignadas a clientes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Puntos Asignados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {bolsas
                .reduce((acc, b) => acc + b.puntajeAsignado, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Puntos Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              {bolsas
                .reduce((acc, b) => acc + b.saldoPuntos, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Puntos Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">
              {bolsas
                .reduce((acc, b) => acc + b.puntajeUtilizado, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Bolsas</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="filterCliente">Cliente:</Label>
              <Select value={filterCliente} onValueChange={setFilterCliente}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem
                      key={cliente.id}
                      value={cliente.id.toString()}
                    >
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>F. Asignación</TableHead>
                <TableHead>F. Caducidad</TableHead>
                <TableHead>Asignado</TableHead>
                <TableHead>Utilizado</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Monto Op.</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBolsas.map((bolsa) => {
                const estado = getEstadoBolsa(bolsa);
                const porcentaje = getPorcentajeUtilizado(bolsa);
                const diasVencer = getDiasParaVencer(bolsa.fechaCaducidad);

                return (
                  <TableRow key={bolsa.id}>
                    <TableCell>{bolsa.id}</TableCell>
                    <TableCell>{bolsa.clienteNombre}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {formatFecha(bolsa.fechaAsignacion)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {formatFecha(bolsa.fechaCaducidad)}
                        {diasVencer > 0 && diasVencer <= 30 && (
                          <AlertTriangle className="size-3 text-amber-500 ml-1" />
                        )}
                      </div>
                      {diasVencer > 0 && diasVencer <= 30 && (
                        <p className="text-xs text-amber-600">
                          {diasVencer} días
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {bolsa.puntajeAsignado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {bolsa.puntajeUtilizado}
                        </Badge>
                        <Progress value={porcentaje} className="h-1" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={bolsa.saldoPuntos > 0 ? "default" : "secondary"}
                      >
                        {bolsa.saldoPuntos}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatMonto(bolsa.montoOperacion)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={estado.variant}>{estado.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
