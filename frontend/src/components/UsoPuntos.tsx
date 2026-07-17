import { Fragment, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "../lib/icons";
import { Badge } from "./ui/badge";
import { toast } from "../lib/toast";
import {
  api,
  type Cliente,
  type Concepto,
  type UsoCabecera,
  type UsoDetalle,
  formatFecha,
  nombreCompleto,
} from "../lib/api";

export function UsoPuntos() {
  const [usos, setUsos] = useState<UsoCabecera[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [detalles, setDetalles] = useState<Record<number, UsoDetalle[]>>({});
  const [expandido, setExpandido] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const cargarUsos = async () => {
    const r = await api.get<UsoCabecera[]>("/uso-puntos");
    if (r.exito && r.datos) setUsos(r.datos);
    else toast.error(r.mensaje);
    setCargando(false);
  };

  useEffect(() => {
    const cargar = async () => {
      const [rClientes, rConceptos] = await Promise.all([
        api.get<Cliente[]>("/clientes"),
        api.get<Concepto[]>("/conceptos"),
      ]);
      if (rClientes.exito && rClientes.datos) setClientes(rClientes.datos);
      if (rConceptos.exito && rConceptos.datos) setConceptos(rConceptos.datos);
      await cargarUsos();
    };
    cargar();
  }, []);

  const buscarCliente = (id: number) => clientes.find((c) => c.id === id);
  const buscarConcepto = (id: number) =>
    conceptos.find((c) => c.id === id)?.descripcion ?? `Concepto #${id}`;

  const toggleDetalle = async (cabeceraId: number) => {
    if (expandido === cabeceraId) {
      setExpandido(null);
      return;
    }
    if (!detalles[cabeceraId]) {
      const r = await api.get<UsoCabecera & { detalle: UsoDetalle[] }>(
        `/uso-puntos/${cabeceraId}`
      );
      if (r.exito && r.datos) {
        setDetalles((prev) => ({ ...prev, [cabeceraId]: r.datos!.detalle }));
      } else {
        toast.error(r.mensaje);
        return;
      }
    }
    setExpandido(cabeceraId);
  };

  const handleDelete = async (id: number) => {
    const r = await api.delete(`/uso-puntos/${id}`);
    if (r.exito) {
      toast.success(r.mensaje);
      if (expandido === id) setExpandido(null);
      cargarUsos();
    } else {
      toast.error(r.mensaje);
    }
  };

  const filteredUsos = usos.filter((uso) => {
    const nombre = nombreCompleto(buscarCliente(uso.clienteId));
    const concepto = buscarConcepto(uso.conceptoId);
    const texto = searchTerm.toLowerCase();
    return (
      nombre.toLowerCase().includes(texto) ||
      concepto.toLowerCase().includes(texto) ||
      uso.id.toString().includes(searchTerm)
    );
  });

  const totalUtilizado = usos.reduce(
    (acc, u) => acc + (u.puntajeUtilizado || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Uso de Puntos</h1>
        <p className="text-muted-foreground">
          Registros de canjes generados desde "Servicios → Utilizar Puntos",
          con su detalle por bolsa (esquema FIFO)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Canjes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{usos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Puntos Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">
              {totalUtilizado.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Usos ({filteredUsos.length})</CardTitle>
          <div className="flex items-center gap-2 mt-4">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, concepto o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Puntos Utilizados</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    {cargando ? "Cargando registros…" : "Sin registros todavía."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsos.map((uso) => (
                  <Fragment key={uso.id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDetalle(uso.id)}
                        >
                          {expandido === uso.id ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>{uso.id}</TableCell>
                      <TableCell>
                        {nombreCompleto(buscarCliente(uso.clienteId))}
                        <span className="text-xs text-muted-foreground ml-1">
                          (#{uso.clienteId})
                        </span>
                      </TableCell>
                      <TableCell>{buscarConcepto(uso.conceptoId)}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          -{uso.puntajeUtilizado} pts
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground" />
                          {formatFecha(uso.fecha)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(uso.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandido === uso.id && (
                      <TableRow className="fila-detalle">
                        <TableCell colSpan={7}>
                          <div className="px-4 py-2">
                            <p className="text-sm font-medium mb-2">
                              Detalle por bolsa (FIFO)
                            </p>
                            {detalles[uso.id]?.length ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>ID Detalle</TableHead>
                                    <TableHead>Bolsa</TableHead>
                                    <TableHead>Puntos Descontados</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {detalles[uso.id].map((det) => (
                                    <TableRow key={det.id}>
                                      <TableCell>{det.id}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline">
                                          Bolsa #{det.bolsaId}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="secondary">
                                          {det.puntajeUtilizado} pts
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Sin líneas de detalle.
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
