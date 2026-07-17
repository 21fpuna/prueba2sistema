import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
import { Plus, Edit, Trash2, Megaphone, Calendar } from "../lib/icons";
import { Badge } from "./ui/badge";
import { toast } from "../lib/toast";
import {
  api,
  type Producto,
  type Promocion,
  formatFecha,
} from "../lib/api";

export function Promociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promocion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [productoPromo, setProductoPromo] = useState("todas");

  const descripcionRef = useRef<HTMLTextAreaElement>(null);
  const fechaInicioRef = useRef<HTMLInputElement>(null);
  const fechaFinRef = useRef<HTMLInputElement>(null);
  const multiplicadorRef = useRef<HTMLInputElement>(null);

  const cargarPromociones = async () => {
    const r = await api.get<Promocion[]>("/promociones");
    if (r.exito && r.datos) setPromociones(r.datos);
    else toast.error(r.mensaje);
    setCargando(false);
  };

  useEffect(() => {
    const cargar = async () => {
      const rProductos = await api.get<Producto[]>("/productos");
      if (rProductos.exito && rProductos.datos) setProductos(rProductos.datos);
      await cargarPromociones();
    };
    cargar();
  }, []);

  const esVigente = (p: Promocion) => {
    if (!p.activa) return false;
    const hoy = new Date();
    return (
      new Date(p.fechaInicio + "T00:00:00") <= hoy &&
      hoy <= new Date(p.fechaFin + "T23:59:59")
    );
  };

  const handleAdd = () => {
    setEditingPromo(null);
    setProductoPromo("todas");
    setIsDialogOpen(true);
  };

  const handleEdit = (promo: Promocion) => {
    setEditingPromo(promo);
    setProductoPromo(promo.productoId ? promo.productoId.toString() : "todas");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const r = await api.delete(`/promociones/${id}`);
    if (r.exito) {
      toast.success(r.mensaje);
      cargarPromociones();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleToggleActiva = async (promo: Promocion) => {
    const r = await api.put<Promocion>(`/promociones/${promo.id}`, {
      activa: !promo.activa,
    });
    if (r.exito) {
      toast.success(
        promo.activa ? "Promoción desactivada" : "Promoción activada"
      );
      cargarPromociones();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleGuardar = async () => {
    const datos = {
      descripcion: descripcionRef.current?.value.trim() || "",
      fechaInicio: fechaInicioRef.current?.value || "",
      fechaFin: fechaFinRef.current?.value || "",
      multiplicador: Number(multiplicadorRef.current?.value || 0),
      productoId: productoPromo === "todas" ? null : Number(productoPromo),
      activa: editingPromo ? editingPromo.activa : true,
    };

    setGuardando(true);
    const r = editingPromo
      ? await api.put<Promocion>(`/promociones/${editingPromo.id}`, datos)
      : await api.post<Promocion>("/promociones", datos);
    setGuardando(false);

    if (r.exito) {
      toast.success(r.mensaje);
      setIsDialogOpen(false);
      cargarPromociones();
    } else {
      toast.error(r.mensaje);
    }
  };

  const vigentes = promociones.filter(esVigente).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Promociones</h1>
          <p className="text-muted-foreground">
            Promociones por tiempo limitado que multiplican los puntos al
            cargar operaciones, generales o por producto
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 size-4" />
              Nueva Promoción
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPromo ? "Editar Promoción" : "Nueva Promoción"}
              </DialogTitle>
              <DialogDescription>
                Durante la vigencia, los puntos de "Cargar Puntos" se
                multiplican. Ej: multiplicador 2 = puntos dobles.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="descripcionPromo">Descripción</Label>
                <Textarea
                  id="descripcionPromo"
                  ref={descripcionRef}
                  key={editingPromo?.id ?? "new"}
                  defaultValue={editingPromo?.descripcion}
                  placeholder="Ej: Puntos dobles por aniversario"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Desde</Label>
                  <Input
                    type="date"
                    ref={fechaInicioRef}
                    key={editingPromo?.id ?? "new"}
                    defaultValue={editingPromo?.fechaInicio}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hasta</Label>
                  <Input
                    type="date"
                    ref={fechaFinRef}
                    key={editingPromo?.id ?? "new"}
                    defaultValue={editingPromo?.fechaFin}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Multiplicador de Puntos</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="1"
                    ref={multiplicadorRef}
                    key={editingPromo?.id ?? "new"}
                    defaultValue={editingPromo?.multiplicador}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aplica a</Label>
                  <Select value={productoPromo} onValueChange={setProductoPromo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">
                        Todas las operaciones
                      </SelectItem>
                      {productos.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          Solo: {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Promociones Registradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{promociones.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vigentes Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              {vigentes}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-primary" />
            <CardTitle>Lista de Promociones ({promociones.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Multiplicador</TableHead>
                <TableHead>Aplica a</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promociones.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    {cargando ? "Cargando promociones…" : "Sin registros todavía."}
                  </TableCell>
                </TableRow>
              ) : (
                promociones.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>{promo.id}</TableCell>
                    <TableCell className="font-medium">
                      {promo.descripcion}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {formatFecha(promo.fechaInicio)} —{" "}
                        {formatFecha(promo.fechaFin)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>x{promo.multiplicador}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {promo.productoId
                        ? productos.find((p) => p.id === promo.productoId)
                            ?.nombre ?? `Producto #${promo.productoId}`
                        : "Todas las operaciones"}
                    </TableCell>
                    <TableCell>
                      {esVigente(promo) ? (
                        <Badge variant="default">Vigente</Badge>
                      ) : promo.activa ? (
                        <Badge variant="outline">Fuera de fecha</Badge>
                      ) : (
                        <Badge variant="secondary">Inactiva</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActiva(promo)}
                        >
                          {promo.activa ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(promo)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promo.id)}
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
