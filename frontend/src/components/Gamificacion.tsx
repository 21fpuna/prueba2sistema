import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Trophy,
  Medal,
  Target,
  BadgeCheck,
  Sparkles,
} from "../lib/icons";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { toast } from "../lib/toast";
import {
  api,
  type Cliente,
  type Desafio,
  type DesafioProgreso,
  type Insignia,
  type RankingFila,
  formatFecha,
  nombreCompleto,
} from "../lib/api";

interface InsigniasRespuesta {
  cliente: { id: number; nombre: string; apellido: string };
  puntosAcumulados: number;
  insignias: Insignia[];
  totalObtenidas: number;
}

export function Gamificacion() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [ranking, setRanking] = useState<RankingFila[]>([]);

  const [clienteInsignias, setClienteInsignias] = useState("");
  const [insignias, setInsignias] = useState<InsigniasRespuesta | null>(null);

  const [clienteDesafios, setClienteDesafios] = useState("");
  const [progreso, setProgreso] = useState<DesafioProgreso[] | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDesafio, setEditingDesafio] = useState<Desafio | null>(null);
  const [guardando, setGuardando] = useState(false);

  const nombreRef = useRef<HTMLInputElement>(null);
  const descripcionRef = useRef<HTMLTextAreaElement>(null);
  const metaRef = useRef<HTMLInputElement>(null);
  const recompensaRef = useRef<HTMLInputElement>(null);
  const inicioRef = useRef<HTMLInputElement>(null);
  const finRef = useRef<HTMLInputElement>(null);

  const cargarBase = async () => {
    const [rDesafios, rRanking] = await Promise.all([
      api.get<Desafio[]>("/desafios"),
      api.get<RankingFila[]>("/gamificacion/ranking?limite=10"),
    ]);
    if (rDesafios.exito && rDesafios.datos) setDesafios(rDesafios.datos);
    if (rRanking.exito && rRanking.datos) setRanking(rRanking.datos);
  };

  useEffect(() => {
    const cargar = async () => {
      const rClientes = await api.get<Cliente[]>("/clientes");
      if (rClientes.exito && rClientes.datos) setClientes(rClientes.datos);
      await cargarBase();
    };
    cargar();
  }, []);

  const consultarInsignias = async (clienteId: string) => {
    setClienteInsignias(clienteId);
    const r = await api.get<InsigniasRespuesta>(
      `/gamificacion/insignias/${clienteId}`
    );
    if (r.exito && r.datos) setInsignias(r.datos);
    else toast.error(r.mensaje);
  };

  const consultarProgreso = async (clienteId: string) => {
    setClienteDesafios(clienteId);
    const r = await api.get<DesafioProgreso[]>(
      `/gamificacion/desafios/${clienteId}`
    );
    if (r.exito && r.datos) setProgreso(r.datos);
    else toast.error(r.mensaje);
  };

  const reclamarRecompensa = async (desafioId: number) => {
    const r = await api.post<{ mensaje: string }>(
      "/gamificacion/desafios/reclamar",
      { clienteId: Number(clienteDesafios), desafioId }
    );
    if (r.exito && r.datos) {
      toast.success("Recompensa reclamada", { description: r.datos.mensaje });
      consultarProgreso(clienteDesafios);
      cargarBase();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleAddDesafio = () => {
    setEditingDesafio(null);
    setIsDialogOpen(true);
  };

  const handleEditDesafio = (desafio: Desafio) => {
    setEditingDesafio(desafio);
    setIsDialogOpen(true);
  };

  const handleDeleteDesafio = async (id: number) => {
    const r = await api.delete(`/desafios/${id}`);
    if (r.exito) {
      toast.success(r.mensaje);
      cargarBase();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleGuardarDesafio = async () => {
    const datos = {
      nombre: nombreRef.current?.value.trim() || "",
      descripcion: descripcionRef.current?.value.trim() || "",
      metaPuntos: Number(metaRef.current?.value || 0),
      puntosRecompensa: Number(recompensaRef.current?.value || 0),
      fechaInicio: inicioRef.current?.value || "",
      fechaFin: finRef.current?.value || "",
    };

    setGuardando(true);
    const r = editingDesafio
      ? await api.put<Desafio>(`/desafios/${editingDesafio.id}`, datos)
      : await api.post<Desafio>("/desafios", datos);
    setGuardando(false);

    if (r.exito) {
      toast.success(r.mensaje);
      setIsDialogOpen(false);
      cargarBase();
    } else {
      toast.error(r.mensaje);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Gamificación</h1>
        <p className="text-muted-foreground">
          Desafíos, insignias y ranking para incentivar la participación en el
          programa
        </p>
      </div>

      <Tabs defaultValue="ranking" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="insignias">Insignias</TabsTrigger>
          <TabsTrigger value="desafios">Desafíos</TabsTrigger>
        </TabsList>

        {/* ------------------------- Ranking ------------------------- */}
        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-primary" />
                <div>
                  <CardTitle>Ranking de Clientes</CardTitle>
                  <CardDescription>
                    Top 10 por puntos acumulados históricos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posición</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Puntos Acumulados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin datos de ranking todavía.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ranking.map((fila) => (
                      <TableRow key={fila.clienteId}>
                        <TableCell>
                          {fila.posicion <= 3 ? (
                            <Badge
                              variant={
                                fila.posicion === 1 ? "default" : "secondary"
                              }
                            >
                              <Medal className="size-3" /> {fila.posicion}º
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground ml-2">
                              {fila.posicion}º
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {fila.nombre} {fila.apellido}
                          <span className="text-xs text-muted-foreground ml-1">
                            (#{fila.clienteId})
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {fila.puntosAcumulados.toLocaleString()} pts
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------- Insignias ------------------------- */}
        <TabsContent value="insignias">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-5 text-primary" />
                <div>
                  <CardTitle>Insignias del Cliente</CardTitle>
                  <CardDescription>
                    Se otorgan automáticamente según la actividad en el programa
                  </CardDescription>
                </div>
              </div>
              <div className="mt-4 max-w-sm">
                <Select
                  value={clienteInsignias}
                  onValueChange={consultarInsignias}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {nombreCompleto(c)} (#{c.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            {insignias && (
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">
                    {insignias.puntosAcumulados.toLocaleString()} pts acumulados
                  </Badge>
                  <Badge>
                    {insignias.totalObtenidas} de {insignias.insignias.length}{" "}
                    insignias
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {insignias.insignias.map((insignia) => (
                    <div
                      key={insignia.codigo}
                      className={`p-4 border rounded-lg ${
                        insignia.obtenida ? "bg-green-50 border-green-200" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Medal
                          className={`size-4 ${
                            insignia.obtenida
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        />
                        <h4 className="font-semibold text-sm">
                          {insignia.nombre}
                        </h4>
                        {insignia.obtenida ? (
                          <Badge variant="default">Obtenida</Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {insignia.descripcion}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* ------------------------- Desafíos ------------------------- */}
        <TabsContent value="desafios" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Target className="size-5 text-primary" />
                  <div>
                    <CardTitle>Desafíos ({desafios.length})</CardTitle>
                    <CardDescription>
                      Metas de acumulación que otorgan puntos de recompensa
                    </CardDescription>
                  </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddDesafio}>
                      <Plus className="mr-2 size-4" />
                      Nuevo Desafío
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingDesafio ? "Editar Desafío" : "Nuevo Desafío"}
                      </DialogTitle>
                      <DialogDescription>
                        El cliente que alcance la meta de puntos acumulados
                        podrá reclamar la recompensa (una sola vez).
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          ref={nombreRef}
                          key={editingDesafio?.id ?? "new"}
                          defaultValue={editingDesafio?.nombre}
                          placeholder="Ej: Cliente estrella"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                          ref={descripcionRef}
                          key={editingDesafio?.id ?? "new"}
                          defaultValue={editingDesafio?.descripcion}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Meta (puntos acumulados)</Label>
                          <Input
                            type="number"
                            min="1"
                            ref={metaRef}
                            key={editingDesafio?.id ?? "new"}
                            defaultValue={editingDesafio?.metaPuntos}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Recompensa (puntos)</Label>
                          <Input
                            type="number"
                            min="1"
                            ref={recompensaRef}
                            key={editingDesafio?.id ?? "new"}
                            defaultValue={editingDesafio?.puntosRecompensa}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Desde</Label>
                          <Input
                            type="date"
                            ref={inicioRef}
                            key={editingDesafio?.id ?? "new"}
                            defaultValue={editingDesafio?.fechaInicio}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Hasta</Label>
                          <Input
                            type="date"
                            ref={finRef}
                            key={editingDesafio?.id ?? "new"}
                            defaultValue={editingDesafio?.fechaFin}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleGuardarDesafio} disabled={guardando}>
                        {guardando ? "Guardando…" : "Guardar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Desafío</TableHead>
                    <TableHead>Meta</TableHead>
                    <TableHead>Recompensa</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {desafios.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin desafíos todavía.
                      </TableCell>
                    </TableRow>
                  ) : (
                    desafios.map((desafio) => (
                      <TableRow key={desafio.id}>
                        <TableCell>{desafio.id}</TableCell>
                        <TableCell>
                          <p className="font-medium">{desafio.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {desafio.descripcion}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {desafio.metaPuntos.toLocaleString()} pts
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>
                            +{desafio.puntosRecompensa.toLocaleString()} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatFecha(desafio.fechaInicio)} —{" "}
                          {formatFecha(desafio.fechaFin)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDesafio(desafio)}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDesafio(desafio.id)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <div>
                  <CardTitle>Progreso de un Cliente</CardTitle>
                  <CardDescription>
                    Consultá el avance en cada desafío y reclamá las recompensas
                    completadas
                  </CardDescription>
                </div>
              </div>
              <div className="mt-4 max-w-sm">
                <Select
                  value={clienteDesafios}
                  onValueChange={consultarProgreso}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {nombreCompleto(c)} (#{c.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            {progreso && (
              <CardContent className="space-y-4">
                {progreso.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay desafíos configurados.
                  </p>
                ) : (
                  progreso.map((d) => (
                    <div key={d.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Target className="size-4 text-primary" />
                          <span className="font-medium text-sm">{d.nombre}</span>
                          {d.reclamado ? (
                            <Badge variant="secondary">Reclamado</Badge>
                          ) : d.completado ? (
                            <Badge variant="default">¡Completado!</Badge>
                          ) : (
                            <Badge variant="outline">En progreso</Badge>
                          )}
                        </div>
                        {d.completado && !d.reclamado && (
                          <Button size="sm" onClick={() => reclamarRecompensa(d.id)}>
                            Reclamar +{d.puntosRecompensa} pts
                          </Button>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {Math.min(d.puntosAcumulados, d.metaPuntos).toLocaleString()} /{" "}
                          {d.metaPuntos.toLocaleString()} pts
                        </span>
                        <span>{d.porcentaje}%</span>
                      </div>
                      <Progress value={d.porcentaje} />
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
