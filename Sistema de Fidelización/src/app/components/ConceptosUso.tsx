import { useState } from "react";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface ConceptoUso {
  id: number;
  descripcion: string;
  puntosRequeridos: number;
}

const initialConceptos: ConceptoUso[] = [
  { id: 1, descripcion: "Vale de descuento 10%", puntosRequeridos: 500 },
  { id: 2, descripcion: "Vale de descuento 20%", puntosRequeridos: 1000 },
  { id: 3, descripcion: "Vale de premio - Producto gratis", puntosRequeridos: 1500 },
  { id: 4, descripcion: "Vale de consumición - Bebida gratis", puntosRequeridos: 300 },
  { id: 5, descripcion: "Vale de descuento 50%", puntosRequeridos: 2500 },
];

const emptyForm = { descripcion: "", puntosRequeridos: "" };

export function ConceptosUso() {
  const [conceptos, setConceptos] = useLocalStorage<ConceptoUso[]>("fidelizacion_conceptos", initialConceptos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConcepto, setEditingConcepto] = useState<ConceptoUso | null>(null);
  const [form, setForm] = useState(emptyForm);

  const handleAddConcepto = () => {
    setEditingConcepto(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const handleEditConcepto = (concepto: ConceptoUso) => {
    setEditingConcepto(concepto);
    setForm({ descripcion: concepto.descripcion, puntosRequeridos: String(concepto.puntosRequeridos) });
    setIsDialogOpen(true);
  };

  const handleDeleteConcepto = (id: number) => {
    setConceptos(conceptos.filter((c) => c.id !== id));
  };

  const handleGuardar = () => {
    const descripcion = form.descripcion.trim();
    const puntosRequeridos = parseInt(form.puntosRequeridos);
    if (!descripcion || !puntosRequeridos) return;

    if (editingConcepto) {
      setConceptos(conceptos.map((c) => c.id === editingConcepto.id ? { ...c, descripcion, puntosRequeridos } : c));
    } else {
      const newId = conceptos.length > 0 ? Math.max(...conceptos.map((c) => c.id)) + 1 : 1;
      setConceptos([...conceptos, { id: newId, descripcion, puntosRequeridos }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Conceptos de Uso de Puntos</h1>
          <p className="text-muted-foreground">
            Gestión de conceptos para el canje de puntos acumulados
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddConcepto}>
              <Plus className="mr-2 size-4" />
              Nuevo Concepto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingConcepto ? "Editar Concepto" : "Nuevo Concepto"}</DialogTitle>
              <DialogDescription>
                Defina el concepto de uso y los puntos requeridos para el canje.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción del Concepto</Label>
                <Textarea
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Ej: Vale de descuento 10%, Vale de premio, etc."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="puntosRequeridos">Puntos Requeridos</Label>
                <Input
                  id="puntosRequeridos"
                  type="number"
                  value={form.puntosRequeridos}
                  onChange={(e) => setForm((p) => ({ ...p, puntosRequeridos: e.target.value }))}
                  placeholder="Ingrese la cantidad de puntos"
                  min="0"
                />
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
          <CardTitle>Lista de Conceptos de Uso ({conceptos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Puntos Requeridos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conceptos.map((concepto) => (
                <TableRow key={concepto.id}>
                  <TableCell>{concepto.id}</TableCell>
                  <TableCell>{concepto.descripcion}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{concepto.puntosRequeridos.toLocaleString()} pts</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditConcepto(concepto)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteConcepto(concepto.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
