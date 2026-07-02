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
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface ReglaAsignacion {
  id: number;
  limiteInferior: number;
  limiteSuperior: number | null;
  montoEquivalencia: number;
}

const initialReglas: ReglaAsignacion[] = [
  { id: 1, limiteInferior: 0, limiteSuperior: 199999, montoEquivalencia: 50000 },
  { id: 2, limiteInferior: 200000, limiteSuperior: 499999, montoEquivalencia: 30000 },
  { id: 3, limiteInferior: 500000, limiteSuperior: null, montoEquivalencia: 20000 },
];

const emptyForm = { limiteInferior: "0", limiteSuperior: "", montoEquivalencia: "" };

export function ReglasAsignacion() {
  const [reglas, setReglas] = useLocalStorage<ReglaAsignacion[]>("fidelizacion_reglas", initialReglas);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegla, setEditingRegla] = useState<ReglaAsignacion | null>(null);
  const [form, setForm] = useState(emptyForm);

  const handleAddRegla = () => {
    setEditingRegla(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const handleEditRegla = (regla: ReglaAsignacion) => {
    setEditingRegla(regla);
    setForm({
      limiteInferior: String(regla.limiteInferior),
      limiteSuperior: regla.limiteSuperior != null ? String(regla.limiteSuperior) : "",
      montoEquivalencia: String(regla.montoEquivalencia),
    });
    setIsDialogOpen(true);
  };

  const handleDeleteRegla = (id: number) => {
    setReglas(reglas.filter((r) => r.id !== id));
  };

  const handleGuardar = () => {
    const limiteInferior = parseInt(form.limiteInferior) || 0;
    const limiteSuperior = form.limiteSuperior ? parseInt(form.limiteSuperior) : null;
    const montoEquivalencia = parseInt(form.montoEquivalencia);
    if (!montoEquivalencia) return;

    if (editingRegla) {
      setReglas(reglas.map((r) => r.id === editingRegla.id ? { ...r, limiteInferior, limiteSuperior, montoEquivalencia } : r));
    } else {
      const newId = reglas.length > 0 ? Math.max(...reglas.map((r) => r.id)) + 1 : 1;
      setReglas([...reglas, { id: newId, limiteInferior, limiteSuperior, montoEquivalencia }]);
    }
    setIsDialogOpen(false);
  };

  const formatMonto = (monto: number) => monto.toLocaleString("es-PY") + " Gs.";

  const getRangoText = (regla: ReglaAsignacion) =>
    regla.limiteSuperior === null
      ? `${formatMonto(regla.limiteInferior)} en adelante`
      : `${formatMonto(regla.limiteInferior)} - ${formatMonto(regla.limiteSuperior)}`;

  const setField = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Reglas de Asignación de Puntos</h1>
          <p className="text-muted-foreground">
            Configuración de reglas para asignar puntos según el monto de consumo
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddRegla}>
              <Plus className="mr-2 size-4" />
              Nueva Regla
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRegla ? "Editar Regla" : "Nueva Regla"}</DialogTitle>
              <DialogDescription>
                Defina el rango de montos y la equivalencia de puntos. Deje el límite superior vacío para rangos abiertos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="limiteInferior">Límite Inferior (Gs.)</Label>
                <Input id="limiteInferior" type="number" value={form.limiteInferior} onChange={setField("limiteInferior")} placeholder="0" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limiteSuperior">Límite Superior (Gs.) - Opcional</Label>
                <Input id="limiteSuperior" type="number" value={form.limiteSuperior} onChange={setField("limiteSuperior")} placeholder="Dejar vacío para rango abierto" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="montoEquivalencia">Monto equivalente a 1 punto (Gs.)</Label>
                <Input id="montoEquivalencia" type="number" value={form.montoEquivalencia} onChange={setField("montoEquivalencia")} placeholder="50000" min="1" />
                <p className="text-xs text-muted-foreground">
                  Ejemplo: Si ingresa 50000, significa que cada 50.000 Gs. se otorga 1 punto
                </p>
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
        <CardHeader>
          <CardTitle>Reglas Configuradas ({reglas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Rango de Monto</TableHead>
                <TableHead>Equivalencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reglas.map((regla) => (
                <TableRow key={regla.id}>
                  <TableCell>{regla.id}</TableCell>
                  <TableCell>{getRangoText(regla)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">1 punto cada {formatMonto(regla.montoEquivalencia)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditRegla(regla)}><Edit className="size-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRegla(regla.id)}><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ejemplo de Cálculo</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">Basado en las reglas actuales:</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Una compra de <strong>150.000 Gs.</strong> otorga <Badge variant="outline">3 puntos</Badge> (150.000 ÷ 50.000)</li>
            <li>Una compra de <strong>350.000 Gs.</strong> otorga <Badge variant="outline">11 puntos</Badge> (350.000 ÷ 30.000)</li>
            <li>Una compra de <strong>800.000 Gs.</strong> otorga <Badge variant="outline">40 puntos</Badge> (800.000 ÷ 20.000)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
