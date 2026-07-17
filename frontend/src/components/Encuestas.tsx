import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { MessageSquare, Star, Trash2 } from "../lib/icons";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { toast } from "../lib/toast";
import {
  api,
  type Cliente,
  type Encuesta,
  type EncuestaResumen,
  formatFecha,
  nombreCompleto,
} from "../lib/api";

function Estrellas({ cantidad }: { cantidad: number }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`size-4 ${
            n <= cantidad ? "text-amber-500" : "text-muted-foreground"
          }`}
          style={n <= cantidad ? { fill: "currentColor" } : undefined}
        />
      ))}
    </span>
  );
}

export function Encuestas() {
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [resumen, setResumen] = useState<EncuestaResumen | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);

  const [clienteEncuesta, setClienteEncuesta] = useState("");
  const [puntuacion, setPuntuacion] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const comentarioRef = useRef<HTMLTextAreaElement>(null);

  const cargarDatos = async () => {
    const [rEncuestas, rResumen] = await Promise.all([
      api.get<Encuesta[]>("/encuestas"),
      api.get<EncuestaResumen>("/encuestas/resumen"),
    ]);
    if (rEncuestas.exito && rEncuestas.datos) setEncuestas(rEncuestas.datos);
    if (rResumen.exito && rResumen.datos) setResumen(rResumen.datos);
    setCargando(false);
  };

  useEffect(() => {
    const cargar = async () => {
      const rClientes = await api.get<Cliente[]>("/clientes");
      if (rClientes.exito && rClientes.datos) setClientes(rClientes.datos);
      await cargarDatos();
    };
    cargar();
  }, []);

  const buscarCliente = (id: number) => clientes.find((c) => c.id === id);

  const handleEnviar = async () => {
    if (!clienteEncuesta || puntuacion === 0) {
      toast.error("Seleccione el cliente y una puntuación de 1 a 5");
      return;
    }
    setEnviando(true);
    const r = await api.post<Encuesta>("/encuestas", {
      clienteId: Number(clienteEncuesta),
      puntuacion,
      comentario: comentarioRef.current?.value.trim() || "",
    });
    setEnviando(false);

    if (r.exito) {
      toast.success(r.mensaje);
      setPuntuacion(0);
      setClienteEncuesta("");
      if (comentarioRef.current) comentarioRef.current.value = "";
      cargarDatos();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleDelete = async (id: number) => {
    const r = await api.delete(`/encuestas/${id}`);
    if (r.exito) {
      toast.success(r.mensaje);
      cargarDatos();
    } else {
      toast.error(r.mensaje);
    }
  };

  const maxDistribucion = resumen
    ? Math.max(1, ...Object.values(resumen.distribucion))
    : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Encuestas de Satisfacción</h1>
        <p className="text-muted-foreground">
          Feedback de los clientes sobre el programa de fidelización para
          identificar áreas de mejora
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Respuestas Recibidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {resumen?.totalRespuestas ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Satisfacción Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-semibold text-primary">
                {resumen?.promedio ?? 0}
              </div>
              <Estrellas cantidad={Math.round(resumen?.promedio ?? 0)} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distribución de Puntuaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {[5, 4, 3, 2, 1].map((n) => (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span className="w-10 text-muted-foreground">{n} ★</span>
                <Progress
                  value={
                    ((resumen?.distribucion[n] ?? 0) / maxDistribucion) * 100
                  }
                  className="h-1 flex-1"
                />
                <span className="w-6 text-right text-muted-foreground">
                  {resumen?.distribucion[n] ?? 0}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            <div>
              <CardTitle>Nueva Encuesta</CardTitle>
              <CardDescription>
                ¿Qué tan satisfecho está el cliente con el programa de
                fidelización?
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clienteEncuesta} onValueChange={setClienteEncuesta}>
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
            <div className="space-y-2">
              <Label>Puntuación</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    variant="ghost"
                    size="sm"
                    onClick={() => setPuntuacion(n)}
                    aria-label={`${n} estrellas`}
                  >
                    <Star
                      className={`size-5 ${
                        n <= puntuacion
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }`}
                      style={n <= puntuacion ? { fill: "currentColor" } : undefined}
                    />
                  </Button>
                ))}
                {puntuacion > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {puntuacion}/5
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Comentario (opcional)</Label>
            <Textarea
              ref={comentarioRef}
              placeholder="¿Qué mejorarías del programa de puntos?"
              rows={3}
            />
          </div>
          <Button onClick={handleEnviar} disabled={enviando} className="w-full">
            <MessageSquare className="mr-2 size-4" />
            {enviando ? "Enviando…" : "Registrar Encuesta"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Respuestas ({encuestas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Puntuación</TableHead>
                <TableHead>Comentario</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encuestas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    {cargando ? "Cargando encuestas…" : "Sin respuestas todavía."}
                  </TableCell>
                </TableRow>
              ) : (
                encuestas.map((encuesta) => (
                  <TableRow key={encuesta.id}>
                    <TableCell>{encuesta.id}</TableCell>
                    <TableCell>
                      {nombreCompleto(buscarCliente(encuesta.clienteId))}
                    </TableCell>
                    <TableCell>
                      <Estrellas cantidad={encuesta.puntuacion} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {encuesta.comentario || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatFecha(encuesta.fecha)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(encuesta.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
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
