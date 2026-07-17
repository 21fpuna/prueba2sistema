import { useEffect, useState } from "react";
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
import { Search, Calendar, AlertTriangle } from "../lib/icons";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { toast } from "../lib/toast";
import {
  api,
  type Bolsa,
  type Cliente,
  formatFecha,
  formatMonto,
  nombreCompleto,
} from "../lib/api";

export function BolsaPuntos() {
  const [bolsas, setBolsas] = useState<Bolsa[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCliente, setFilterCliente] = useState<string>("todos");

  useEffect(() => {
    const cargar = async () => {
      const [rBolsas, rClientes] = await Promise.all([
        api.get<Bolsa[]>("/bolsas-puntos"),
        api.get<Cliente[]>("/clientes"),
      ]);
      if (rBolsas.exito && rBolsas.datos) setBolsas(rBolsas.datos);
      else toast.error(rBolsas.mensaje);
      if (rClientes.exito && rClientes.datos) setClientes(rClientes.datos);
      setCargando(false);
    };
    cargar();
  }, []);

  const buscarCliente = (clienteId: number) =>
    clientes.find((c) => c.id === clienteId);

  const filteredBolsas = bolsas.filter((bolsa) => {
    const nombre = nombreCompleto(buscarCliente(bolsa.clienteId));
    const matchesSearch =
      nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bolsa.id.toString().includes(searchTerm);
    const matchesCliente =
      filterCliente === "todos" ||
      bolsa.clienteId.toString() === filterCliente;
    return matchesSearch && matchesCliente;
  });

  const getDiasParaVencer = (fechaCaducidad: string) => {
    const hoy = new Date();
    const caducidad = new Date(fechaCaducidad + "T23:59:59");
    const diff = caducidad.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getEstadoBolsa = (bolsa: Bolsa) => {
    const dias = getDiasParaVencer(bolsa.fechaCaducidad);
    if (bolsa.estado === "vencido")
      return { label: "Vencida", variant: "destructive" as const };
    if (bolsa.saldo === 0)
      return { label: "Agotada", variant: "secondary" as const };
    if (dias < 0) return { label: "Vencida", variant: "destructive" as const };
    if (dias <= 30) return { label: "Por vencer", variant: "outline" as const };
    return { label: "Activa", variant: "default" as const };
  };

  const getPorcentajeUtilizado = (bolsa: Bolsa) =>
    bolsa.puntajeAsignado > 0
      ? (bolsa.puntajeUtilizado / bolsa.puntajeAsignado) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Bolsa de Puntos</h1>
        <p className="text-muted-foreground">
          Visualización de bolsas de puntos asignadas a clientes. Las bolsas se
          generan desde "Servicios → Carga de Puntos".
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
                .reduce((acc, b) => acc + (b.puntajeAsignado || 0), 0)
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
                .filter((b) => b.estado === "vigente")
                .reduce((acc, b) => acc + (b.saldo || 0), 0)
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
                .reduce((acc, b) => acc + (b.puntajeUtilizado || 0), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Bolsas ({filteredBolsas.length})</CardTitle>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-56">
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
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {nombreCompleto(cliente)}
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
              {filteredBolsas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    {cargando ? "Cargando bolsas…" : "Sin registros todavía."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBolsas.map((bolsa) => {
                  const estado = getEstadoBolsa(bolsa);
                  const porcentaje = getPorcentajeUtilizado(bolsa);
                  const diasVencer = getDiasParaVencer(bolsa.fechaCaducidad);
                  const porVencer =
                    bolsa.estado === "vigente" &&
                    bolsa.saldo > 0 &&
                    diasVencer > 0 &&
                    diasVencer <= 30;

                  return (
                    <TableRow key={bolsa.id}>
                      <TableCell>{bolsa.id}</TableCell>
                      <TableCell>
                        {nombreCompleto(buscarCliente(bolsa.clienteId))}
                        <span className="text-xs text-muted-foreground ml-1">
                          (#{bolsa.clienteId})
                        </span>
                      </TableCell>
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
                          {porVencer && (
                            <AlertTriangle className="size-3 text-amber-500 ml-1" />
                          )}
                        </div>
                        {porVencer && (
                          <p className="text-xs text-amber-600">
                            {diasVencer} días
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{bolsa.puntajeAsignado}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline">{bolsa.puntajeUtilizado}</Badge>
                          <Progress value={porcentaje} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={bolsa.saldo > 0 ? "default" : "secondary"}>
                          {bolsa.saldo}
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
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
