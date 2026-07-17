import { useEffect, useRef, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Edit, Trash2, ShoppingBag, Sparkles, Mail } from "../lib/icons";
import { Badge } from "./ui/badge";
import { toast } from "../lib/toast";
import {
  api,
  type Canje,
  type Cliente,
  type Producto,
  formatFecha,
  formatMonto,
  nombreCompleto,
} from "../lib/api";

export function Catalogo() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [canjes, setCanjes] = useState<Canje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [clienteCanje, setClienteCanje] = useState("");
  const [productoCanje, setProductoCanje] = useState("");
  const [cantidadCanje, setCantidadCanje] = useState("1");
  const [canjeando, setCanjeando] = useState(false);

  const nombreRef = useRef<HTMLInputElement>(null);
  const descripcionRef = useRef<HTMLTextAreaElement>(null);
  const precioRef = useRef<HTMLInputElement>(null);
  const puntosRef = useRef<HTMLInputElement>(null);

  const cargarDatos = async () => {
    const [rProductos, rCanjes] = await Promise.all([
      api.get<Producto[]>("/productos"),
      api.get<Canje[]>("/canjes"),
    ]);
    if (rProductos.exito && rProductos.datos) setProductos(rProductos.datos);
    if (rCanjes.exito && rCanjes.datos) setCanjes(rCanjes.datos);
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

  const buscarProducto = (id: number) => productos.find((p) => p.id === id);
  const buscarCliente = (id: number) => clientes.find((c) => c.id === id);

  const handleAdd = () => {
    setEditingProducto(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const r = await api.delete(`/productos/${id}`);
    if (r.exito) {
      toast.success(r.mensaje);
      cargarDatos();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleGuardar = async () => {
    const datos = {
      nombre: nombreRef.current?.value.trim() || "",
      descripcion: descripcionRef.current?.value.trim() || "",
      precio: Number(precioRef.current?.value || 0),
      puntosNecesarios: Number(puntosRef.current?.value || 0),
    };

    setGuardando(true);
    const r = editingProducto
      ? await api.put<Producto>(`/productos/${editingProducto.id}`, datos)
      : await api.post<Producto>("/productos", datos);
    setGuardando(false);

    if (r.exito) {
      toast.success(r.mensaje);
      setIsDialogOpen(false);
      cargarDatos();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleCanjear = async () => {
    if (!clienteCanje || !productoCanje) {
      toast.error("Seleccione el cliente y el producto");
      return;
    }
    setCanjeando(true);
    const r = await api.post<{ canje: Canje }>("/servicios/canjear-producto", {
      clienteId: Number(clienteCanje),
      productoId: Number(productoCanje),
      cantidad: Number(cantidadCanje || 1),
    });
    setCanjeando(false);

    if (r.exito && r.datos) {
      toast.success("Canje realizado exitosamente", {
        description: `Se descontaron ${r.datos.canje.puntosUtilizados} puntos. Se enviará el comprobante por email.`,
        icon: <Mail className="size-4" />,
      });
      cargarDatos();
    } else {
      toast.error(r.mensaje);
    }
  };

  const productoSeleccionado = productos.find(
    (p) => p.id.toString() === productoCanje
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Canje por Productos</h1>
          <p className="text-muted-foreground">
            Catálogo de productos y servicios canjeables por puntos, con
            equivalencia entre puntos y valor monetario
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 size-4" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProducto ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
              <DialogDescription>
                Defina el producto, su valor monetario y los puntos necesarios
                para canjearlo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombreProducto">Nombre</Label>
                <Input
                  id="nombreProducto"
                  ref={nombreRef}
                  key={editingProducto?.id ?? "new"}
                  defaultValue={editingProducto?.nombre}
                  placeholder="Ej: Vale de combustible"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcionProducto">Descripción</Label>
                <Textarea
                  id="descripcionProducto"
                  ref={descripcionRef}
                  key={editingProducto?.id ?? "new"}
                  defaultValue={editingProducto?.descripcion}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precioProducto">Valor Monetario (Gs.)</Label>
                  <Input
                    id="precioProducto"
                    type="number"
                    ref={precioRef}
                    key={editingProducto?.id ?? "new"}
                    defaultValue={editingProducto?.precio}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="puntosProducto">Puntos Necesarios</Label>
                  <Input
                    id="puntosProducto"
                    type="number"
                    ref={puntosRef}
                    key={editingProducto?.id ?? "new"}
                    defaultValue={editingProducto?.puntosNecesarios}
                    min="1"
                  />
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

      <Tabs defaultValue="catalogo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
          <TabsTrigger value="canjear">Canjear Puntos</TabsTrigger>
          <TabsTrigger value="historial">Canjes Realizados</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogo">
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Productos ({productos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Puntos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        {cargando ? "Cargando catálogo…" : "Sin productos todavía."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    productos.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>{producto.id}</TableCell>
                        <TableCell className="font-medium">
                          {producto.nombre}
                        </TableCell>
                        <TableCell className="text-sm">
                          {producto.descripcion}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatMonto(producto.precio)}
                        </TableCell>
                        <TableCell>
                          <Badge>{producto.puntosNecesarios} pts</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(producto)}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(producto.id)}
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
        </TabsContent>

        <TabsContent value="canjear">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <div>
                  <CardTitle>Canjear Puntos por un Producto</CardTitle>
                  <CardDescription>
                    Los puntos se descuentan de las bolsas del cliente en orden
                    FIFO y se envía un comprobante por email
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={clienteCanje} onValueChange={setClienteCanje}>
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
                  <Label>Producto</Label>
                  <Select value={productoCanje} onValueChange={setProductoCanje}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nombre} ({p.puntosNecesarios} pts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={cantidadCanje}
                    onChange={(e) => setCantidadCanje(e.target.value)}
                  />
                </div>
              </div>

              {productoSeleccionado && (
                <div className="p-4 bg-muted rounded-lg text-sm space-y-1">
                  <p>
                    <b>{productoSeleccionado.nombre}</b> —{" "}
                    {formatMonto(productoSeleccionado.precio)} c/u
                  </p>
                  <p className="text-muted-foreground">
                    Costo total del canje:{" "}
                    <b>
                      {(
                        productoSeleccionado.puntosNecesarios *
                        Number(cantidadCanje || 1)
                      ).toLocaleString()}{" "}
                      puntos
                    </b>{" "}
                    (equivalente a{" "}
                    {formatMonto(
                      productoSeleccionado.precio * Number(cantidadCanje || 1)
                    )}
                    )
                  </p>
                </div>
              )}

              <Button
                onClick={handleCanjear}
                className="w-full"
                disabled={canjeando}
              >
                <ShoppingBag className="mr-2 size-4" />
                {canjeando ? "Canjeando…" : "Canjear Puntos"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Canjes Realizados ({canjes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Puntos Utilizados</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {canjes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin canjes todavía.
                      </TableCell>
                    </TableRow>
                  ) : (
                    canjes.map((canje) => (
                      <TableRow key={canje.id}>
                        <TableCell>{canje.id}</TableCell>
                        <TableCell>
                          {nombreCompleto(buscarCliente(canje.clienteId))}
                        </TableCell>
                        <TableCell>
                          {buscarProducto(canje.productoId)?.nombre ??
                            `Producto #${canje.productoId}`}
                        </TableCell>
                        <TableCell>{canje.cantidad}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            -{canje.puntosUtilizados} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatFecha(canje.fecha)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
