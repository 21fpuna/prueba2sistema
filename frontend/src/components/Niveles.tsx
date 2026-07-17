import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
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
import { Plus, Edit, Trash2, Award, Crown } from "../lib/icons";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { toast } from "../lib/toast";
import {
  api,
  type Cliente,
  type Nivel,
  type NivelCliente,
  nombreCompleto,
} from "../lib/api";

export function Niveles() {
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNivel, setEditingNivel] = useState<Nivel | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [clienteConsulta, setClienteConsulta] = useState("");
  const [nivelCliente, setNivelCliente] = useState<NivelCliente | null>(null);

  const nombreRef = useRef<HTMLInputElement>(null);
  const puntosRef = useRef<HTMLInputElement>(null);
  const beneficiosRef = useRef<HTMLTextAreaElement>(null);

  const cargarNiveles = async () => {
    const r = await api.get<Nivel[]>("/niveles");
    if (r.exito && r.datos) setNiveles(r.datos);
    else toast.error(r.mensaje);
    setCargando(false);
  };

  useEffect(() => {
    const cargar = async () => {
      const rClientes = await api.get<Cliente[]>("/clientes");
      if (rClientes.exito && rClientes.datos) setClientes(rClientes.datos);
      await cargarNiveles();
    };
    cargar();
  }, []);

  const consultarNivelCliente = async (clienteId: string) => {
    setClienteConsulta(clienteId);
    const r = await api.get<NivelCliente>(`/niveles/cliente/${clienteId}`);
    if (r.exito && r.datos) setNivelCliente(r.datos);
    else toast.error(r.mensaje);
  };

  const handleAdd = () => {
    setEditingNivel(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (nivel: Nivel) => {
    setEditingNivel(nivel);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const r = await api.delete(`/niveles/${id}`);
    if (r.exito) {
      toast.success(r.mensaje);
      cargarNiveles();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleGuardar = async () => {
    const datos = {
      nombre: nombreRef.current?.value.trim() || "",
      puntosMinimos: Number(puntosRef.current?.value || 0),
      beneficios: beneficiosRef.current?.value.trim() || "",
    };

    setGuardando(true);
    const r = editingNivel
      ? await api.put<Nivel>(`/niveles/${editingNivel.id}`, datos)
      : await api.post<Nivel>("/niveles", datos);
    setGuardando(false);

    if (r.exito) {
      toast.success(r.mensaje);
      setIsDialogOpen(false);
      cargarNiveles();
    } else {
      toast.error(r.mensaje);
    }
  };

  const progresoNivel = () => {
    if (!nivelCliente || !nivelCliente.nivelSiguiente) return 100;
    const base = nivelCliente.nivelActual?.puntosMinimos ?? 0;
    const objetivo = nivelCliente.nivelSiguiente.puntosMinimos;
    if (objetivo <= base) return 100;
    return Math.min(
      100,
      Math.round(((nivelCliente.puntosAcumulados - base) / (objetivo - base)) * 100)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Niveles de Fidelización</h1>
          <p className="text-muted-foreground">
            Los clientes ascienden de nivel acumulando puntos y acceden a
            beneficios exclusivos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 size-4" />
              Nuevo Nivel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingNivel ? "Editar Nivel" : "Nuevo Nivel"}
              </DialogTitle>
              <DialogDescription>
                Defina el nombre, los puntos acumulados necesarios y los
                beneficios del nivel.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreNivel">Nombre</Label>
                  <Input
                    id="nombreNivel"
                    ref={nombreRef}
                    key={editingNivel?.id ?? "new"}
                    defaultValue={editingNivel?.nombre}
                    placeholder="Ej: Oro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="puntosMinimos">Puntos Mínimos</Label>
                  <Input
                    id="puntosMinimos"
                    type="number"
                    ref={puntosRef}
                    key={editingNivel?.id ?? "new"}
                    defaultValue={editingNivel?.puntosMinimos}
                    placeholder="5000"
                    min="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficios">Beneficios del Nivel</Label>
                <Textarea
                  id="beneficios"
                  ref={beneficiosRef}
                  key={editingNivel?.id ?? "new"}
                  defaultValue={editingNivel?.beneficios}
                  placeholder="Ej: 10% de descuento adicional, atención preferencial..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGuardar} disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="size-5 text-primary" />
            <div>
              <CardTitle>Consultar Nivel de un Cliente</CardTitle>
              <CardDescription>
                El nivel se calcula con el total histórico de puntos acumulados
              </CardDescription>
            </div>
          </div>
          <div className="mt-4 max-w-sm">
            <Select value={clienteConsulta} onValueChange={consultarNivelCliente}>
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
        {nivelCliente && (
          <CardContent>
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Award className="size-5 text-primary" />
                  <span className="font-semibold">
                    {nombreCompleto(nivelCliente.cliente as Cliente)}
                  </span>
                  <Badge>
                    {nivelCliente.nivelActual?.nombre ?? "Sin nivel"}
                  </Badge>
                </div>
                <Badge variant="secondary">
                  {nivelCliente.puntosAcumulados.toLocaleString()} pts acumulados
                </Badge>
              </div>
              {nivelCliente.nivelActual && (
                <p className="text-sm text-muted-foreground">
                  <b>Beneficios:</b> {nivelCliente.nivelActual.beneficios}
                </p>
              )}
              {nivelCliente.nivelSiguiente ? (
                <div className="space-y-1 mt-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Próximo nivel: <b>{nivelCliente.nivelSiguiente.nombre}</b>
                    </span>
                    <span>
                      Faltan {nivelCliente.puntosParaSiguienteNivel.toLocaleString()} pts
                    </span>
                  </div>
                  <Progress value={progresoNivel()} />
                </div>
              ) : (
                <p className="text-sm text-green-700 font-medium">
                  ¡Alcanzó el nivel máximo del programa!
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Niveles Configurados ({niveles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Puntos Mínimos</TableHead>
                <TableHead>Beneficios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {niveles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    {cargando ? "Cargando niveles…" : "Sin registros todavía."}
                  </TableCell>
                </TableRow>
              ) : (
                niveles.map((nivel) => (
                  <TableRow key={nivel.id}>
                    <TableCell>{nivel.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Award className="size-3" /> {nivel.nombre}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {nivel.puntosMinimos.toLocaleString()} pts
                    </TableCell>
                    <TableCell className="text-sm">{nivel.beneficios}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(nivel)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(nivel.id)}
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
    </div>
  );
}
