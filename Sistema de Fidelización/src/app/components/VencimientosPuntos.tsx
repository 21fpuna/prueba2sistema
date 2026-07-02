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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface Vencimiento {
  id: number;
  fechaInicioValidez: string;
  fechaFinValidez: string;
  diasDuracion: number;
}

const initialVencimientos: Vencimiento[] = [
  { id: 1, fechaInicioValidez: "2026-01-01", fechaFinValidez: "2026-12-31", diasDuracion: 365 },
  { id: 2, fechaInicioValidez: "2026-06-01", fechaFinValidez: "2026-12-31", diasDuracion: 180 },
];

const emptyForm = { fechaInicioValidez: "", fechaFinValidez: "", diasDuracion: "" };

export function VencimientosPuntos() {
  const [vencimientos, setVencimientos] = useLocalStorage<Vencimiento[]>("fidelizacion_vencimientos", initialVencimientos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVencimiento, setEditingVencimiento] = useState<Vencimiento | null>(null);
  const [form, setForm] = useState(emptyForm);

  const handleAddVencimiento = () => {
    setEditingVencimiento(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const handleEditVencimiento = (v: Vencimiento) => {
    setEditingVencimiento(v);
    setForm({ fechaInicioValidez: v.fechaInicioValidez, fechaFinValidez: v.fechaFinValidez, diasDuracion: String(v.diasDuracion) });
    setIsDialogOpen(true);
  };

  const handleDeleteVencimiento = (id: number) => {
    setVencimientos(vencimientos.filter((v) => v.id !== id));
  };

  const handleGuardar = () => {
    const diasDuracion = parseInt(form.diasDuracion);
    if (!form.fechaInicioValidez || !form.fechaFinValidez || !diasDuracion) return;

    if (editingVencimiento) {
      setVencimientos(vencimientos.map((v) => v.id === editingVencimiento.id ? { ...v, ...form, diasDuracion } : v));
    } else {
      const newId = vencimientos.length > 0 ? Math.max(...vencimientos.map((v) => v.id)) + 1 : 1;
      setVencimientos([...vencimientos, { id: newId, fechaInicioValidez: form.fechaInicioValidez, fechaFinValidez: form.fechaFinValidez, diasDuracion }]);
    }
    setIsDialogOpen(false);
  };

  const setField = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-PY", { year: "numeric", month: "long", day: "numeric" });

  const isVigente = (v: Vencimiento) => {
    const hoy = new Date();
    return hoy >= new Date(v.fechaInicioValidez) && hoy <= new Date(v.fechaFinValidez);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Parametrización de Vencimientos</h1>
          <p className="text-muted-foreground">
            Configuración del tiempo de validez de los puntos asignados
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddVencimiento}>
              <Plus className="mr-2 size-4" />
              Nueva Configuración
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVencimiento ? "Editar Configuración" : "Nueva Configuración de Vencimiento"}</DialogTitle>
              <DialogDescription>Defina el período de validez y la duración de los puntos.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicioValidez">Fecha Inicio de Validez</Label>
                <Input id="fechaInicioValidez" type="date" value={form.fechaInicioValidez} onChange={setField("fechaInicioValidez")} />
                <p className="text-xs text-muted-foreground">Fecha desde la cual esta configuración estará vigente</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFinValidez">Fecha Fin de Validez</Label>
                <Input id="fechaFinValidez" type="date" value={form.fechaFinValidez} onChange={setField("fechaFinValidez")} />
                <p className="text-xs text-muted-foreground">Fecha hasta la cual esta configuración estará vigente</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diasDuracion">Días de Duración del Puntaje</Label>
                <Input id="diasDuracion" type="number" value={form.diasDuracion} onChange={setField("diasDuracion")} placeholder="365" min="1" />
                <p className="text-xs text-muted-foreground">Los puntos asignados durante este período vencerán después de esta cantidad de días</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleGuardar}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Configuraciones de Vencimiento ({vencimientos.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Período de Validez</TableHead>
                <TableHead>Duración del Puntaje</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vencimientos.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.id}</TableCell>
                  <TableCell>
                    {isVigente(v) ? <Badge variant="default">Vigente</Badge> : <Badge variant="secondary">No vigente</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatFecha(v.fechaInicioValidez)}</div>
                      <div className="text-muted-foreground">hasta {formatFecha(v.fechaFinValidez)}</div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{v.diasDuracion} días</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditVencimiento(v)}><Edit className="size-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteVencimiento(v.id)}><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="size-5 text-amber-500" />
            Información Importante
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">Las configuraciones de vencimiento determinan cuánto tiempo serán válidos los puntos asignados a los clientes:</p>
          <ul className="text-sm space-y-1 list-disc list-inside ml-2">
            <li>Los puntos asignados durante el período de validez tendrán la duración especificada</li>
            <li>El proceso automático verificará y descontará puntos vencidos regularmente</li>
            <li>Puede tener múltiples configuraciones para diferentes períodos del año</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
