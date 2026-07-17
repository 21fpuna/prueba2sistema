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
import { Plus, Edit, Trash2 } from "../lib/icons";
import { Badge } from "./ui/badge";
import { toast } from "../lib/toast";
import { api, type Concepto } from "../lib/api";

export function ConceptosUso() {
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConcepto, setEditingConcepto] = useState<Concepto | null>(null);
  const [guardando, setGuardando] = useState(false);

  const descripcionRef = useRef<HTMLTextAreaElement>(null);
  const puntosRef = useRef<HTMLInputElement>(null);

  const cargarConceptos = async () => {
    const r = await api.get<Concepto[]>("/conceptos");
    if (r.exito && r.datos) setConceptos(r.datos);
    else toast.error(r.mensaje);
    setCargando(false);
  };

  useEffect(() => {
    cargarConceptos();
  }, []);

  const handleAddConcepto = () => {
    setEditingConcepto(null);
    setIsDialogOpen(true);
  };

  const handleEditConcepto = (concepto: Concepto) => {
    setEditingConcepto(concepto);
    setIsDialogOpen(true);
  };

  const handleDeleteConcepto = async (id: number) => {
    const r = await api.delete(`/conceptos/${id}`);
    if (r.exito) {
      toast.success(r.mensaje);
      cargarConceptos();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleGuardar = async () => {
    const datos = {
      descripcion: descripcionRef.current?.value.trim() || "",
      puntosRequeridos: parseInt(puntosRef.current?.value || "0"),
    };

    setGuardando(true);
    const r = editingConcepto
      ? await api.put<Concepto>(`/conceptos/${editingConcepto.id}`, datos)
      : await api.post<Concepto>("/conceptos", datos);
    setGuardando(false);

    if (r.exito) {
      toast.success(r.mensaje);
      setIsDialogOpen(false);
      cargarConceptos();
    } else {
      toast.error(r.mensaje);
    }
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
              <DialogTitle>
                {editingConcepto ? "Editar Concepto" : "Nuevo Concepto"}
              </DialogTitle>
              <DialogDescription>
                Defina el concepto de uso y los puntos requeridos para el canje.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción del Concepto</Label>
                <Textarea
                  id="descripcion"
                  ref={descripcionRef}
                  key={editingConcepto?.id ?? "new"}
                  defaultValue={editingConcepto?.descripcion}
                  placeholder="Ej: Vale de descuento 10%, Vale de premio, etc."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="puntosRequeridos">Puntos Requeridos</Label>
                <Input
                  id="puntosRequeridos"
                  type="number"
                  ref={puntosRef}
                  key={editingConcepto?.id ?? "new"}
                  defaultValue={editingConcepto?.puntosRequeridos}
                  placeholder="Ingrese la cantidad de puntos"
                  min="0"
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
              {conceptos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    {cargando ? "Cargando conceptos…" : "Sin registros todavía."}
                  </TableCell>
                </TableRow>
              ) : (
                conceptos.map((concepto) => (
                  <TableRow key={concepto.id}>
                    <TableCell>{concepto.id}</TableCell>
                    <TableCell>{concepto.descripcion}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {Number(concepto.puntosRequeridos).toLocaleString()} pts
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditConcepto(concepto)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteConcepto(concepto.id)}
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
