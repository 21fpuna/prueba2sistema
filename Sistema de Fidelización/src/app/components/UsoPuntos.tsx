import React, { useState } from "react";
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
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Search, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface DetalleUso {
  id: number;
  bolsaId: number;
  puntajeUtilizado: number;
}

interface UsoRegistro {
  id: number;
  clienteId: number;
  clienteNombre: string;
  puntajeUtilizado: number;
  fecha: string;
  conceptoUso: string;
  detalles: DetalleUso[];
}

const initialUsos: UsoRegistro[] = [
  {
    id: 1,
    clienteId: 1,
    clienteNombre: "Juan Pérez",
    puntajeUtilizado: 500,
    fecha: "2026-05-28",
    conceptoUso: "Vale de descuento 10%",
    detalles: [
      { id: 1, bolsaId: 1, puntajeUtilizado: 300 },
      { id: 2, bolsaId: 2, puntajeUtilizado: 200 },
    ],
  },
  {
    id: 2,
    clienteId: 2,
    clienteNombre: "María González",
    puntajeUtilizado: 1000,
    fecha: "2026-05-25",
    conceptoUso: "Vale de descuento 20%",
    detalles: [{ id: 3, bolsaId: 3, puntajeUtilizado: 1000 }],
  },
  {
    id: 3,
    clienteId: 3,
    clienteNombre: "Carlos Rodríguez",
    puntajeUtilizado: 300,
    fecha: "2026-05-20",
    conceptoUso: "Vale de consumición - Bebida gratis",
    detalles: [{ id: 4, bolsaId: 4, puntajeUtilizado: 300 }],
  },
  {
    id: 4,
    clienteId: 1,
    clienteNombre: "Juan Pérez",
    puntajeUtilizado: 500,
    fecha: "2026-05-15",
    conceptoUso: "Vale de descuento 10%",
    detalles: [{ id: 5, bolsaId: 1, puntajeUtilizado: 500 }],
  },
  {
    id: 5,
    clienteId: 2,
    clienteNombre: "María González",
    puntajeUtilizado: 1500,
    fecha: "2026-05-10",
    conceptoUso: "Vale de premio - Producto gratis",
    detalles: [
      { id: 6, bolsaId: 6, puntajeUtilizado: 600 },
      { id: 7, bolsaId: 3, puntajeUtilizado: 900 },
    ],
  },
];

export function UsoPuntos() {
  const [usos, setUsos] = useLocalStorage<UsoRegistro[]>("fidelizacion_usos", initialUsos);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCliente, setFilterCliente] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [selectedConcepto, setSelectedConcepto] = useState("");

  const clientes = Array.from(
    new Map(usos.map((u) => [u.clienteId, { id: u.clienteId, nombre: u.clienteNombre }])).values()
  );

  const conceptos = Array.from(new Set(usos.map((u) => u.conceptoUso)));

  const filteredUsos = usos.filter((uso) => {
    const matchesSearch =
      uso.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uso.conceptoUso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uso.id.toString().includes(searchTerm);

    const matchesCliente =
      filterCliente === "todos" || uso.clienteId.toString() === filterCliente;

    return matchesSearch && matchesCliente;
  });

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-PY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleRegistrarCanje = () => {
    if (!selectedClienteId || !selectedConcepto) return;
    const clienteData = clientes.find((c) => c.id.toString() === selectedClienteId);
    if (!clienteData) return;
    const newId = usos.length > 0 ? Math.max(...usos.map((u) => u.id)) + 1 : 1;
    const newUso: UsoRegistro = {
      id: newId,
      clienteId: clienteData.id,
      clienteNombre: clienteData.nombre,
      puntajeUtilizado: 0,
      fecha: new Date().toISOString().split("T")[0],
      conceptoUso: selectedConcepto,
      detalles: [],
    };
    setUsos([newUso, ...usos]);
    setSelectedClienteId("");
    setSelectedConcepto("");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Uso de Puntos</h1>
          <p className="text-muted-foreground">
            Registro de canjes de puntos realizados por los clientes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nuevo Canje</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Canje de Puntos</DialogTitle>
              <DialogDescription>
                Registre el uso de puntos de un cliente según el concepto
                seleccionado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="concepto">Concepto de Uso</Label>
                <Select value={selectedConcepto} onValueChange={setSelectedConcepto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un concepto" />
                  </SelectTrigger>
                  <SelectContent>
                    {conceptos.map((concepto, idx) => (
                      <SelectItem key={idx} value={concepto}>
                        {concepto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Puntos a Utilizar</Label>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Los puntos se descontarán automáticamente siguiendo el
                    método FIFO (primero las bolsas más antiguas)
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegistrarCanje}>
                Registrar Canje
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Canjes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{usos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Puntos Canjeados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {usos
                .reduce((acc, u) => acc + u.puntajeUtilizado, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Canjes Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {
                usos.filter((u) => {
                  const fecha = new Date(u.fecha);
                  const hoy = new Date();
                  return (
                    fecha.getMonth() === hoy.getMonth() &&
                    fecha.getFullYear() === hoy.getFullYear()
                  );
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Canjes</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, concepto o ID..."
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
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Puntos Utilizados</TableHead>
                <TableHead>Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsos.map((uso) => (
                <React.Fragment key={uso.id}>
                  <TableRow>
                    <TableCell>{uso.id}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {formatFecha(uso.fecha)}
                      </div>
                    </TableCell>
                    <TableCell>{uso.clienteNombre}</TableCell>
                    <TableCell className="max-w-xs">
                      {uso.conceptoUso}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        -{uso.puntajeUtilizado} pts
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(uso.id)}
                      >
                        {expandedRows.includes(uso.id) ? (
                          <>
                            <ChevronUp className="size-4 mr-1" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <ChevronDown className="size-4 mr-1" />
                            Ver ({uso.detalles.length})
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows.includes(uso.id) && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/50">
                        <div className="p-4">
                          <h4 className="font-semibold mb-2 text-sm">
                            Detalle de Bolsas Utilizadas (FIFO):
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">
                                  Detalle ID
                                </TableHead>
                                <TableHead className="text-xs">
                                  Bolsa ID
                                </TableHead>
                                <TableHead className="text-xs">
                                  Puntos Descontados
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {uso.detalles.map((detalle) => (
                                <TableRow key={detalle.id}>
                                  <TableCell className="text-sm">
                                    {detalle.id}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {detalle.bolsaId}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                      {detalle.puntajeUtilizado} pts
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
