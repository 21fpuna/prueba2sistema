import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Wallet, TrendingDown, Calculator, Mail, Check } from "../lib/icons";
import { Separator } from "./ui/separator";
import { toast } from "../lib/toast";
import {
  api,
  type Bolsa,
  type Cliente,
  type Concepto,
  formatMonto,
  nombreCompleto,
} from "../lib/api";

export function Servicios() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [conceptos, setConceptos] = useState<Concepto[]>([]);

  const [clienteCarga, setClienteCarga] = useState("");
  const [montoCarga, setMontoCarga] = useState("");
  const [resultadoCarga, setResultadoCarga] = useState<Bolsa | null>(null);
  const [cargandoPuntos, setCargandoPuntos] = useState(false);

  const [clienteUso, setClienteUso] = useState("");
  const [conceptoUso, setConceptoUso] = useState("");
  const [usandoPuntos, setUsandoPuntos] = useState(false);

  const [montoConsulta, setMontoConsulta] = useState("");
  const [resultadoConsulta, setResultadoConsulta] = useState<number | null>(
    null
  );

  useEffect(() => {
    const cargar = async () => {
      const [rClientes, rConceptos] = await Promise.all([
        api.get<Cliente[]>("/clientes"),
        api.get<Concepto[]>("/conceptos"),
      ]);
      if (rClientes.exito && rClientes.datos) setClientes(rClientes.datos);
      if (rConceptos.exito && rConceptos.datos) setConceptos(rConceptos.datos);
    };
    cargar();
  }, []);

  const handleCargaPuntos = async () => {
    if (!clienteCarga || !montoCarga) {
      toast.error("Por favor complete todos los campos");
      return;
    }
    setCargandoPuntos(true);
    setResultadoCarga(null);
    const r = await api.post<Bolsa>("/servicios/cargar-puntos", {
      clienteId: Number(clienteCarga),
      monto: Number(montoCarga),
    });
    setCargandoPuntos(false);

    if (r.exito && r.datos) {
      setResultadoCarga(r.datos);
      toast.success("Puntos cargados exitosamente", {
        description: `Se asignaron ${r.datos.puntajeAsignado} puntos (bolsa #${r.datos.id})`,
      });
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleUtilizarPuntos = async () => {
    if (!clienteUso || !conceptoUso) {
      toast.error("Por favor complete todos los campos");
      return;
    }
    setUsandoPuntos(true);
    const r = await api.post<{ cabecera: { puntajeUtilizado: number } }>(
      "/servicios/utilizar-puntos",
      {
        clienteId: Number(clienteUso),
        conceptoId: Number(conceptoUso),
      }
    );
    setUsandoPuntos(false);

    if (r.exito && r.datos) {
      const cliente = clientes.find((c) => c.id.toString() === clienteUso);
      toast.success("Puntos utilizados exitosamente", {
        description: `Se descontaron ${r.datos.cabecera.puntajeUtilizado} puntos. Se enviará un comprobante a ${nombreCompleto(cliente)}.`,
        icon: <Mail className="size-4" />,
      });
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleConsultarEquivalencia = async () => {
    if (!montoConsulta) {
      toast.error("Por favor ingrese un monto");
      return;
    }
    setResultadoConsulta(null);
    const r = await api.get<{ monto: number; puntosEquivalentes: number }>(
      `/servicios/equivalencia?monto=${encodeURIComponent(montoConsulta)}`
    );
    if (r.exito && r.datos) {
      setResultadoConsulta(r.datos.puntosEquivalentes);
    } else {
      toast.error(r.mensaje);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Servicios</h1>
        <p className="text-muted-foreground">
          Operaciones principales del sistema de fidelización
        </p>
      </div>

      <Tabs defaultValue="carga" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="carga">Carga de Puntos</TabsTrigger>
          <TabsTrigger value="uso">Utilizar Puntos</TabsTrigger>
          <TabsTrigger value="consulta">Consultar Equivalencia</TabsTrigger>
        </TabsList>

        <TabsContent value="carga">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="size-5 text-primary" />
                <div>
                  <CardTitle>Carga de Puntos</CardTitle>
                  <CardDescription>
                    Asignar puntos a un cliente basado en el monto de su
                    operación
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clienteCarga">Cliente</Label>
                  <Select value={clienteCarga} onValueChange={setClienteCarga}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem
                          key={cliente.id}
                          value={cliente.id.toString()}
                        >
                          {nombreCompleto(cliente)} (#{cliente.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="montoCarga">Monto de la Operación (Gs.)</Label>
                  <Input
                    id="montoCarga"
                    type="number"
                    placeholder="250000"
                    value={montoCarga}
                    onChange={(e) => setMontoCarga(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <Button
                onClick={handleCargaPuntos}
                className="w-full"
                disabled={cargandoPuntos}
              >
                <Wallet className="mr-2 size-4" />
                {cargandoPuntos ? "Cargando…" : "Cargar Puntos"}
              </Button>

              {resultadoCarga && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check className="size-5" />
                    <p className="font-semibold">
                      ¡Puntos asignados correctamente!
                    </p>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Se generó la bolsa #{resultadoCarga.id} con{" "}
                    {resultadoCarga.puntajeAsignado} puntos, válidos hasta el{" "}
                    {resultadoCarga.fechaCaducidad}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uso">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="size-5 text-primary" />
                <div>
                  <CardTitle>Utilizar Puntos</CardTitle>
                  <CardDescription>
                    Canjear puntos de un cliente por un concepto de uso
                    (descuento FIFO de bolsas)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clienteUso">Cliente</Label>
                  <Select value={clienteUso} onValueChange={setClienteUso}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem
                          key={cliente.id}
                          value={cliente.id.toString()}
                        >
                          {nombreCompleto(cliente)} (#{cliente.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conceptoUso">Concepto de Uso</Label>
                  <Select value={conceptoUso} onValueChange={setConceptoUso}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un concepto" />
                    </SelectTrigger>
                    <SelectContent>
                      {conceptos.map((concepto) => (
                        <SelectItem
                          key={concepto.id}
                          value={concepto.id.toString()}
                        >
                          {concepto.descripcion} ({concepto.puntosRequeridos}{" "}
                          pts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Mail className="size-4" />
                  <p className="text-sm font-medium">
                    Se enviará un email de confirmación al cliente
                  </p>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  El cliente recibirá un comprobante del canje realizado
                </p>
              </div>

              <Button
                onClick={handleUtilizarPuntos}
                className="w-full"
                disabled={usandoPuntos}
              >
                <TrendingDown className="mr-2 size-4" />
                {usandoPuntos ? "Procesando…" : "Utilizar Puntos"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consulta">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="size-5 text-primary" />
                <div>
                  <CardTitle>Consultar Equivalencia de Puntos</CardTitle>
                  <CardDescription>
                    Calcular cuántos puntos equivalen a un monto determinado,
                    según las reglas configuradas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="montoConsulta">Monto a Consultar (Gs.)</Label>
                <Input
                  id="montoConsulta"
                  type="number"
                  placeholder="350000"
                  value={montoConsulta}
                  onChange={(e) => setMontoConsulta(e.target.value)}
                  min="0"
                />
              </div>

              <Button onClick={handleConsultarEquivalencia} className="w-full">
                <Calculator className="mr-2 size-4" />
                Calcular Equivalencia
              </Button>

              {resultadoConsulta !== null && (
                <Card className="bg-muted">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {formatMonto(parseFloat(montoConsulta))} equivale a:
                      </p>
                      <p className="text-4xl font-bold text-primary">
                        {resultadoConsulta} puntos
                      </p>
                      <Separator className="my-4" />
                      <p className="text-xs text-muted-foreground">
                        Cálculo basado en las reglas de asignación configuradas
                        en el sistema
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Información de los Servicios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="size-4 text-primary" />
                <h4 className="font-semibold text-sm">Carga de Puntos</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Asigna puntos automáticamente según el monto de la operación y
                las reglas configuradas. Genera una nueva bolsa de puntos con
                fecha de caducidad.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="size-4 text-primary" />
                <h4 className="font-semibold text-sm">Utilizar Puntos</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Descuenta puntos usando el método FIFO (primeras bolsas
                primero). Envía email de confirmación al cliente
                automáticamente.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="size-4 text-primary" />
                <h4 className="font-semibold text-sm">
                  Consultar Equivalencia
                </h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Servicio informativo que calcula la equivalencia de puntos para
                cualquier monto según las reglas vigentes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
