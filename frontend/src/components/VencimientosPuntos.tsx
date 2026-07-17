import { useEffect, useRef, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus, Edit, Trash2, Calendar } from "../lib/icons";
import { Badge } from "./ui/badge";
import { toast } from "../lib/toast";
import { api, type Vencimiento, formatFecha } from "../lib/api";

export function VencimientosPuntos() {
  const [vencimientos, setVencimientos] = useState<Vencimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVencimiento, setEditingVencimiento] =
    useState<Vencimiento | null>(null);
  const [guardando, setGuardando] = useState(false);

  const fechaInicioRef = useRef<HTMLInputElement>(null);
  const fechaFinRef = useRef<HTMLInputElement>(null);
  const diasDuracionRef = useRef<HTMLInputElement>(null);

  const cargarVencimientos = async () => {
    const r = await api.get<Vencimiento[]>("/vencimientos");
    if (r.exito && r.datos) setVencimientos(r.datos);
    else toast.error(r.mensaje);
    setCargando(false);
  };

  useEffect(() => {
    cargarVencimientos();
  }, []);

  const esVigente = (v: Vencimiento) => {
    const hoy = new Date();
    return (
      new Date(v.fechaInicioValidez + "T00:00:00") <= hoy &&
      hoy <= new Date(v.fechaFinValidez + "T23:59:59")
    );
  };

  const handleAdd = () => {
    setEditingVencimiento(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (v: Vencimiento) => {
    setEditingVencimiento(v);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const r = await api.delete(`/vencimientos/${id}`);
    if (r.exito) {
      toast.success(r.mensaje);
      cargarVencimientos();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleGuardar = async () => {
    const datos = {
      fechaInicioValidez: fechaInicioRef.current?.value || "",
      fechaFinValidez: fechaFinRef.current?.value || "",
      diasDuracion: Number(diasDuracionRef.current?.value || 0),
    };

    setGuardando(true);
    const r = editingVencimiento
      ? await api.put<Vencimiento>(
          `/vencimientos/${editingVencimiento.id}`,
          datos
        )
      : await api.post<Vencimiento>("/vencimientos", datos);
    setGuardando(false);

    if (r.exito) {
      toast.success(r.mensaje);
      setIsDialogOpen(false);
      cargarVencimientos();
    } else {
      toast.error(r.mensaje);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            Parametrización de Vencimientos
          </h1>
          <p className="text-muted-foreground">
            Define cuántos días de validez tienen los puntos asignados en cada
            período
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 size-4" />
              Nuevo Parámetro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVencimiento ? "Editar Parámetro" : "Nuevo Parámetro"}
              </DialogTitle>
              <DialogDescription>
                Los puntos asignados dentro del período de vigencia tendrán la
                duración indicada.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Vigente Desde</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    ref={fechaInicioRef}
                    key={editingVencimiento?.id ?? "new"}
                    defaultValue={editingVencimiento?.fechaInicioValidez}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Vigente Hasta</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    ref={fechaFinRef}
                    key={editingVencimiento?.id ?? "new"}
                    defaultValue={editingVencimiento?.fechaFinValidez}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diasDuracion">
                  Días de duración del puntaje
                </Label>
                <Input
                  id="diasDuracion"
                  type="number"
                  ref={diasDuracionRef}
                  key={editingVencimiento?.id ?? "new"}
                  defaultValue={editingVencimiento?.diasDuracion}
                  placeholder="365"
                  min="1"
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
            <Calendar className="size-5 text-primary" />
            <CardTitle>
              Parámetros de Vencimiento ({vencimientos.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Vigente Desde</TableHead>
                <TableHead>Vigente Hasta</TableHead>
                <TableHead>Duración de Puntos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vencimientos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    {cargando
                      ? "Cargando parámetros…"
                      : "Sin registros todavía."}
                  </TableCell>
                </TableRow>
              ) : (
                vencimientos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.id}</TableCell>
                    <TableCell>{formatFecha(v.fechaInicioValidez)}</TableCell>
                    <TableCell>{formatFecha(v.fechaFinValidez)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{v.diasDuracion} días</Badge>
                    </TableCell>
                    <TableCell>
                      {esVigente(v) ? (
                        <Badge variant="default">Vigente</Badge>
                      ) : (
                        <Badge variant="outline">Fuera de vigencia</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(v)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(v.id)}
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
