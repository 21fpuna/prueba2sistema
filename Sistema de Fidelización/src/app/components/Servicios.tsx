import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
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
import { Wallet, TrendingDown, Calculator, Mail, Check } from "lucide-react";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

export function Servicios() {
  const [montoCarga, setMontoCarga] = useState("");
  const [clienteCarga, setClienteCarga] = useState("");
  const [puntosCalculados, setPuntosCalculados] = useState<number | null>(null);

  const [clienteUso, setClienteUso] = useState("");
  const [conceptoUso, setConceptoUso] = useState("");

  const [montoConsulta, setMontoConsulta] = useState("");
  const [resultadoConsulta, setResultadoConsulta] = useState<number | null>(
    null
  );

  const clientes = [
    { id: 1, nombre: "Juan Pérez", puntos: 1250 },
    { id: 2, nombre: "María González", puntos: 3400 },
    { id: 3, nombre: "Carlos Rodríguez", puntos: 890 },
    { id: 4, nombre: "Ana Silva", puntos: 2100 },
    { id: 5, nombre: "Roberto Martínez", puntos: 1750 },
  ];

  const conceptos = [
    { id: 1, descripcion: "Vale de descuento 10%", puntosRequeridos: 500 },
    { id: 2, descripcion: "Vale de descuento 20%", puntosRequeridos: 1000 },
    {
      id: 3,
      descripcion: "Vale de premio - Producto gratis",
      puntosRequeridos: 1500,
    },
    {
      id: 4,
      descripcion: "Vale de consumición - Bebida gratis",
      puntosRequeridos: 300,
    },
  ];

  const calcularPuntos = (monto: number): number => {
    // Reglas de ejemplo:
    // 0 a 199.999: 1 punto cada 50.000
    // 200.000 a 499.999: 1 punto cada 30.000
    // 500.000+: 1 punto cada 20.000

    if (monto < 200000) {
      return Math.floor(monto / 50000);
    } else if (monto < 500000) {
      return Math.floor(monto / 30000);
    } else {
      return Math.floor(monto / 20000);
    }
  };

  const handleCargaPuntos = () => {
    if (!montoCarga || !clienteCarga) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    const monto = parseFloat(montoCarga);
    const puntos = calcularPuntos(monto);
    setPuntosCalculados(puntos);

    toast.success("Puntos cargados exitosamente", {
      description: `Se asignaron ${puntos} puntos al cliente`,
    });
  };

  const handleUtilizarPuntos = () => {
    if (!clienteUso || !conceptoUso) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    const cliente = clientes.find((c) => c.id.toString() === clienteUso);
    const concepto = conceptos.find((c) => c.id.toString() === conceptoUso);

    if (!cliente || !concepto) return;

    if (cliente.puntos < concepto.puntosRequeridos) {
      toast.error("Puntos insuficientes", {
        description: `El cliente tiene ${cliente.puntos} puntos pero se requieren ${concepto.puntosRequeridos}`,
      });
      return;
    }

    toast.success("Puntos utilizados exitosamente", {
      description: `Se enviará un email de confirmación a ${cliente.nombre}`,
      icon: <Mail className="size-4" />,
    });
  };

  const handleConsultarEquivalencia = () => {
    if (!montoConsulta) {
      toast.error("Por favor ingrese un monto");
      return;
    }

    const monto = parseFloat(montoConsulta);
    const puntos = calcularPuntos(monto);
    setResultadoConsulta(puntos);
  };

  const formatMonto = (monto: number) => {
    return monto.toLocaleString("es-PY") + " Gs.";
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
                          {cliente.nombre} ({cliente.puntos} pts actuales)
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

              {montoCarga && parseFloat(montoCarga) > 0 && (
                <Card className="bg-muted">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Puntos a asignar:
                      </p>
                      <p className="text-3xl font-semibold">
                        {calcularPuntos(parseFloat(montoCarga))} puntos
                      </p>
                      <Separator className="my-2" />
                      <p className="text-xs text-muted-foreground">
                        Calculado según las reglas de asignación configuradas
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button onClick={handleCargaPuntos} className="w-full">
                <Wallet className="mr-2 size-4" />
                Cargar Puntos
              </Button>

              {puntosCalculados !== null && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check className="size-5" />
                    <p className="font-semibold">
                      ¡Puntos asignados correctamente!
                    </p>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Se han asignado {puntosCalculados} puntos al cliente
                    seleccionado
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
                          {cliente.nombre} ({cliente.puntos} pts disponibles)
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

              {clienteUso && conceptoUso && (
                <Card className="bg-muted">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Puntos disponibles:
                        </span>
                        <Badge variant="default">
                          {
                            clientes.find(
                              (c) => c.id.toString() === clienteUso
                            )?.puntos
                          }{" "}
                          pts
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Puntos a utilizar:
                        </span>
                        <Badge variant="destructive">
                          {
                            conceptos.find(
                              (c) => c.id.toString() === conceptoUso
                            )?.puntosRequeridos
                          }{" "}
                          pts
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Saldo resultante:
                        </span>
                        <Badge variant="outline">
                          {(clientes.find((c) => c.id.toString() === clienteUso)
                            ?.puntos || 0) -
                            (conceptos.find(
                              (c) => c.id.toString() === conceptoUso
                            )?.puntosRequeridos || 0)}{" "}
                          pts
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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

              <Button onClick={handleUtilizarPuntos} className="w-full">
                <TrendingDown className="mr-2 size-4" />
                Utilizar Puntos
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
                    Calcular cuántos puntos equivalen a un monto determinado
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="montoConsulta">
                  Monto a Consultar (Gs.)
                </Label>
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
                      <div className="text-left space-y-1 text-xs text-muted-foreground">
                        <p className="font-medium">Cálculo basado en:</p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li>0 a 199.999 Gs: 1 punto cada 50.000 Gs</li>
                          <li>200.000 a 499.999 Gs: 1 punto cada 30.000 Gs</li>
                          <li>500.000 Gs en adelante: 1 punto cada 20.000 Gs</li>
                        </ul>
                      </div>
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
