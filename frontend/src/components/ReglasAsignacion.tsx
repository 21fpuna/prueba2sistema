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
import { Plus, Edit, Trash2, Settings } from "../lib/icons";
import { Badge } from "./ui/badge";
import { toast } from "../lib/toast";
import { api, type Regla, formatMonto } from "../lib/api";

export function ReglasAsignacion() {
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegla, setEditingRegla] = useState<Regla | null>(null);
  const [guardando, setGuardando] = useState(false);

  const limiteInferiorRef = useRef<HTMLInputElement>(null);
  const limiteSuperiorRef = useRef<HTMLInputElement>(null);
  const montoEquivalenciaRef = useRef<HTMLInputElement>(null);

  const cargarReglas = async () => {
    const r = await api.get<Regla[]>("/reglas");
    if (r.exito && r.datos) setReglas(r.datos);
    else toast.error(r.mensaje);
    setCargando(false);
  };

  useEffect(() => {
    cargarReglas();
  }, []);

  const handleAddRegla = () => {
    setEditingRegla(null);
    setIsDialogOpen(true);
  };

  const handleEditRegla = (regla: Regla) => {
    setEditingRegla(regla);
    setIsDialogOpen(true);
  };

  const handleDeleteRegla = async (id: number) => {
    const r = await api.delete(`/reglas/${id}`);
    if (r.exito) {
      toast.success(r.mensaje);
      cargarReglas();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleGuardar = async () => {
    const limiteSuperiorValor = limiteSuperiorRef.current?.value ?? "";
    const datos = {
      limiteInferior: Number(limiteInferiorRef.current?.value || 0),
      limiteSuperior:
        limiteSuperiorValor === "" ? null : Number(limiteSuperiorValor),
      montoEquivalencia: Number(montoEquivalenciaRef.current?.value || 0),
    };

    setGuardando(true);
    const r = editingRegla
      ? await api.put<Regla>(`/reglas/${editingRegla.id}`, datos)
      : await api.post<Regla>("/reglas", datos);
    setGuardando(false);

    if (r.exito) {
      toast.success(r.mensaje);
      setIsDialogOpen(false);
      cargarReglas();
    } else {
      toast.error(r.mensaje);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Reglas de Asignación de Puntos</h1>
          <p className="text-muted-foreground">
            Definen cuántos guaraníes equivalen a 1 punto según el rango de
            consumo
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
              <DialogTitle>
                {editingRegla ? "Editar Regla" : "Nueva Regla"}
              </DialogTitle>
              <DialogDescription>
                Defina el rango de montos y la equivalencia en guaraníes por
                punto. Deje el límite superior vacío si la regla no tiene tope.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limiteInferior">Límite Inferior (Gs.)</Label>
                  <Input
                    id="limiteInferior"
                    type="number"
                    ref={limiteInferiorRef}
                    key={editingRegla?.id ?? "new"}
                    defaultValue={editingRegla?.limiteInferior}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limiteSuperior">
                    Límite Superior (Gs.) — opcional
                  </Label>
                  <Input
                    id="limiteSuperior"
                    type="number"
                    ref={limiteSuperiorRef}
                    key={editingRegla?.id ?? "new"}
                    defaultValue={editingRegla?.limiteSuperior ?? undefined}
                    placeholder="Sin tope"
                    min="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="montoEquivalencia">
                  Guaraníes por 1 punto
                </Label>
                <Input
                  id="montoEquivalencia"
                  type="number"
                  ref={montoEquivalenciaRef}
                  key={editingRegla?.id ?? "new"}
                  defaultValue={editingRegla?.montoEquivalencia}
                  placeholder="50000"
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
            <Settings className="size-5 text-primary" />
            <CardTitle>Reglas Configuradas ({reglas.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Límite Inferior</TableHead>
                <TableHead>Límite Superior</TableHead>
                <TableHead>Equivalencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reglas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    {cargando ? "Cargando reglas…" : "Sin registros todavía."}
                  </TableCell>
                </TableRow>
              ) : (
                reglas.map((regla) => (
                  <TableRow key={regla.id}>
                    <TableCell>{regla.id}</TableCell>
                    <TableCell>{formatMonto(regla.limiteInferior)}</TableCell>
                    <TableCell>
                      {regla.limiteSuperior === null ||
                      regla.limiteSuperior === undefined ? (
                        <Badge variant="outline">Sin tope</Badge>
                      ) : (
                        formatMonto(regla.limiteSuperior)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        1 punto cada {formatMonto(regla.montoEquivalencia)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRegla(regla)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRegla(regla.id)}
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
