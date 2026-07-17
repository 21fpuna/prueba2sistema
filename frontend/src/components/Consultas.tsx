import { useEffect, useState } from "react";
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
import { Search, Calendar } from "../lib/icons";
import { Badge } from "./ui/badge";
import { toast } from "../lib/toast";
import {
  api,
  armarQuery,
  type Bolsa,
  type Cliente,
  type Concepto,
  type UsoCabecera,
  formatFecha,
  nombreCompleto,
} from "../lib/api";

interface ClientePorVencer {
  cliente: Cliente | null;
  bolsaId: number;
  saldo: number;
  fechaCaducidad: string;
}

export function Consultas() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [conceptos, setConceptos] = useState<Concepto[]>([]);

  // Tab 1: uso de puntos
  const [usoCliente, setUsoCliente] = useState("todos");
  const [usoConcepto, setUsoConcepto] = useState("todos");
  const [usoFecha, setUsoFecha] = useState("");
  const [resultUso, setResultUso] = useState<UsoCabecera[] | null>(null);

  // Tab 2: bolsa de puntos
  const [bolsaCliente, setBolsaCliente] = useState("todos");
  const [puntosMin, setPuntosMin] = useState("");
  const [puntosMax, setPuntosMax] = useState("");
  const [resultBolsas, setResultBolsas] = useState<Bolsa[] | null>(null);

  // Tab 3: puntos a vencer
  const [diasVencer, setDiasVencer] = useState("30");
  const [resultVencer, setResultVencer] = useState<ClientePorVencer[] | null>(
    null
  );

  // Tab 4: búsqueda de clientes
  const [searchNombre, setSearchNombre] = useState("");
  const [searchApellido, setSearchApellido] = useState("");
  const [searchCumple, setSearchCumple] = useState("");
  const [resultClientes, setResultClientes] = useState<Cliente[] | null>(null);

  useEffect(() => {
    const cargar = async () => {
      const [rClientes, rConceptos] = await Promise.all([
        api.get<Cliente[]>("/clientes"),
        api.get<Concepto[]>("/conceptos"),
      ]);
      if (rClientes.exito && rClientes.datos) setClientes(rClientes.datos);
      if (rConceptos.exito && rConceptos.datos) setConceptos(rConceptos.datos);
    };
    cargar();
  }, []);

  const buscarCliente = (id: number) => clientes.find((c) => c.id === id);
  const buscarConcepto = (id: number) =>
    conceptos.find((c) => c.id === id)?.descripcion ?? `Concepto #${id}`;

  const consultarUso = async () => {
    const q = armarQuery({
      clienteId: usoCliente === "todos" ? "" : usoCliente,
      conceptoId: usoConcepto === "todos" ? "" : usoConcepto,
      fecha: usoFecha,
    });
    const r = await api.get<UsoCabecera[]>("/consultas/uso-puntos" + q);
    if (r.exito && r.datos) setResultUso(r.datos);
    else toast.error(r.mensaje);
  };

  const consultarBolsas = async () => {
    const q = armarQuery({
      clienteId: bolsaCliente === "todos" ? "" : bolsaCliente,
      puntosMin,
      puntosMax,
    });
    const r = await api.get<Bolsa[]>("/consultas/bolsa-puntos" + q);
    if (r.exito && r.datos) setResultBolsas(r.datos);
    else toast.error(r.mensaje);
  };

  const consultarVencer = async () => {
    const r = await api.get<ClientePorVencer[]>(
      "/consultas/clientes-por-vencer" + armarQuery({ dias: diasVencer })
    );
    if (r.exito && r.datos) setResultVencer(r.datos);
    else toast.error(r.mensaje);
  };

  const consultarClientes = async () => {
    const q = armarQuery({
      nombre: searchNombre,
      apellido: searchApellido,
      cumpleanios: searchCumple,
    });
    const r = await api.get<Cliente[]>("/consultas/clientes" + q);
    if (r.exito && r.datos) setResultClientes(r.datos);
    else toast.error(r.mensaje);
  };

  const sinResultados = (
    <p className="text-center text-muted-foreground py-8 text-sm">
      Sin resultados para los filtros indicados.
    </p>
  );

  const sinConsultar = (
    <p className="text-center text-muted-foreground py-8 text-sm">
      Configurá los filtros y presioná "Consultar" para ver los resultados.
    </p>
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

        {/* ------------------- Tab 1: Uso de puntos ------------------- */}
        <TabsContent value="uso-puntos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consulta de Uso de Puntos</CardTitle>
              <div className="grid gap-4 mt-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={usoCliente} onValueChange={setUsoCliente}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {nombreCompleto(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Concepto de Uso</Label>
                  <Select value={usoConcepto} onValueChange={setUsoConcepto}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {conceptos.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={usoFecha}
                    onChange={(e) => setUsoFecha(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={consultarUso}>
                  <Search className="mr-2 size-4" />
                  Consultar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {resultUso === null ? (
                sinConsultar
              ) : resultUso.length === 0 ? (
                sinResultados
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Puntos Utilizados</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultUso.map((uso) => (
                      <TableRow key={uso.id}>
                        <TableCell>{uso.id}</TableCell>
                        <TableCell>
                          {nombreCompleto(buscarCliente(uso.clienteId))}
                        </TableCell>
                        <TableCell>{buscarConcepto(uso.conceptoId)}</TableCell>
                        <TableCell>
                          <Badge>{uso.puntajeUtilizado.toLocaleString()} pts</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatFecha(uso.fecha)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------- Tab 2: Bolsa de puntos ------------------- */}
        <TabsContent value="bolsa-puntos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consulta de Bolsa de Puntos</CardTitle>
              <div className="grid gap-4 mt-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={bolsaCliente} onValueChange={setBolsaCliente}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {nombreCompleto(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Puntos Mínimo</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={puntosMin}
                    onChange={(e) => setPuntosMin(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Puntos Máximo</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={puntosMax}
                    onChange={(e) => setPuntosMax(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={consultarBolsas}>
                  <Search className="mr-2 size-4" />
                  Consultar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {resultBolsas === null ? (
                sinConsultar
              ) : resultBolsas.length === 0 ? (
                sinResultados
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Asignado</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>F. Caducidad</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultBolsas.map((bolsa) => (
                      <TableRow key={bolsa.id}>
                        <TableCell>{bolsa.id}</TableCell>
                        <TableCell>
                          {nombreCompleto(buscarCliente(bolsa.clienteId))}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {bolsa.puntajeAsignado.toLocaleString()} pts
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={bolsa.saldo > 0 ? "default" : "secondary"}
                          >
                            {bolsa.saldo.toLocaleString()} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatFecha(bolsa.fechaCaducidad)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              bolsa.estado === "vigente"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {bolsa.estado === "vigente" ? "Vigente" : "Vencida"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------- Tab 3: Puntos a vencer ------------------- */}
        <TabsContent value="puntos-vencer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes con Puntos a Vencer</CardTitle>
              <div className="grid gap-4 mt-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Días para Vencimiento</Label>
                  <Select value={diasVencer} onValueChange={setDiasVencer}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="15">15 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="60">60 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={consultarVencer}>
                  <Search className="mr-2 size-4" />
                  Consultar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {resultVencer === null ? (
                sinConsultar
              ) : resultVencer.length === 0 ? (
                sinResultados
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Bolsa</TableHead>
                      <TableHead>Puntos a Vencer</TableHead>
                      <TableHead>Fecha Vencimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultVencer.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{nombreCompleto(item.cliente)}</TableCell>
                        <TableCell className="text-sm">
                          {item.cliente?.email ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">#{item.bolsaId}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{item.saldo} pts</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatFecha(item.fechaCaducidad)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------- Tab 4: Búsqueda de clientes ------------------- */}
        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Búsqueda de Clientes</CardTitle>
              <div className="grid gap-4 mt-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="searchNombre">
                    Nombre (búsqueda aproximada)
                  </Label>
                  <Input
                    id="searchNombre"
                    placeholder="Ingrese el nombre..."
                    value={searchNombre}
                    onChange={(e) => setSearchNombre(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchApellido">
                    Apellido (búsqueda aproximada)
                  </Label>
                  <Input
                    id="searchApellido"
                    placeholder="Ingrese el apellido..."
                    value={searchApellido}
                    onChange={(e) => setSearchApellido(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchCumple">Cumpleaños</Label>
                  <Input
                    id="searchCumple"
                    type="date"
                    value={searchCumple}
                    onChange={(e) => setSearchCumple(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={consultarClientes}>
                  <Search className="mr-2 size-4" />
                  Buscar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {resultClientes === null ? (
                sinConsultar
              ) : resultClientes.length === 0 ? (
                sinResultados
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre Completo</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cumpleaños</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultClientes.map((cliente) => {
                      const nacimiento = new Date(
                        cliente.fechaNacimiento + "T00:00:00"
                      );
                      const hoy = new Date();
                      const esCumpleanos =
                        nacimiento.getMonth() === hoy.getMonth() &&
                        nacimiento.getDate() === hoy.getDate();

                      return (
                        <TableRow key={cliente.id}>
                          <TableCell>{cliente.id}</TableCell>
                          <TableCell>
                            {nombreCompleto(cliente)}
                            {esCumpleanos && (
                              <Badge variant="outline" className="ml-2">
                                🎂 Cumpleaños
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {cliente.tipoDocumento}: {cliente.numeroDocumento}
                          </TableCell>
                          <TableCell className="text-sm">
                            {cliente.email}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatFecha(cliente.fechaNacimiento)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
