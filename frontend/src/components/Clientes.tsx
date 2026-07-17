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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Edit, Trash2, Search } from "../lib/icons";
import { toast } from "../lib/toast";
import { api, type Cliente, formatFecha } from "../lib/api";

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState("CI");
  const [nacionalidad, setNacionalidad] = useState("Paraguaya");
  const [guardando, setGuardando] = useState(false);

  const nombreRef = useRef<HTMLInputElement>(null);
  const apellidoRef = useRef<HTMLInputElement>(null);
  const documentoRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const fechaNacimientoRef = useRef<HTMLInputElement>(null);

  const cargarClientes = async () => {
    const r = await api.get<Cliente[]>("/clientes");
    if (r.exito && r.datos) setClientes(r.datos);
    else toast.error(r.mensaje);
    setCargando(false);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.numeroDocumento.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCliente = () => {
    setEditingCliente(null);
    setTipoDocumento("CI");
    setNacionalidad("Paraguaya");
    setIsDialogOpen(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setTipoDocumento(cliente.tipoDocumento || "CI");
    setNacionalidad(cliente.nacionalidad || "Paraguaya");
    setIsDialogOpen(true);
  };

  const handleDeleteCliente = async (id: number) => {
    const r = await api.delete(`/clientes/${id}`);
    if (r.exito) {
      toast.success(r.mensaje);
      cargarClientes();
    } else {
      toast.error(r.mensaje);
    }
  };

  const handleGuardar = async () => {
    const datos = {
      nombre: nombreRef.current?.value.trim() || "",
      apellido: apellidoRef.current?.value.trim() || "",
      numeroDocumento: documentoRef.current?.value.trim() || "",
      tipoDocumento,
      nacionalidad,
      email: emailRef.current?.value.trim() || "",
      telefono: telefonoRef.current?.value.trim() || "",
      fechaNacimiento: fechaNacimientoRef.current?.value || "",
    };

    setGuardando(true);
    const r = editingCliente
      ? await api.put<Cliente>(`/clientes/${editingCliente.id}`, datos)
      : await api.post<Cliente>("/clientes", datos);
    setGuardando(false);

    if (r.exito) {
      toast.success(r.mensaje);
      setIsDialogOpen(false);
      cargarClientes();
    } else {
      toast.error(r.mensaje);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Gestión de Clientes</h1>
          <p className="text-muted-foreground">
            Administración de datos de clientes del programa de fidelización
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddCliente}>
              <Plus className="mr-2 size-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl dialog-alto">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
              </DialogTitle>
              <DialogDescription>
                Complete los datos del cliente. Todos los campos son obligatorios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    ref={nombreRef}
                    key={editingCliente?.id ?? "new"}
                    defaultValue={editingCliente?.nombre}
                    placeholder="Ingrese el nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    ref={apellidoRef}
                    key={editingCliente?.id ?? "new"}
                    defaultValue={editingCliente?.apellido}
                    placeholder="Ingrese el apellido"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CI">Cédula de Identidad</SelectItem>
                      <SelectItem value="RUC">RUC</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">Número de Documento</Label>
                  <Input
                    id="documento"
                    ref={documentoRef}
                    key={editingCliente?.id ?? "new"}
                    defaultValue={editingCliente?.numeroDocumento}
                    placeholder="Ingrese el número"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nacionalidad</Label>
                <Select value={nacionalidad} onValueChange={setNacionalidad}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paraguaya">Paraguaya</SelectItem>
                    <SelectItem value="Argentina">Argentina</SelectItem>
                    <SelectItem value="Brasileña">Brasileña</SelectItem>
                    <SelectItem value="Otra">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  ref={emailRef}
                  key={editingCliente?.id ?? "new"}
                  defaultValue={editingCliente?.email}
                  placeholder="ejemplo@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  ref={telefonoRef}
                  key={editingCliente?.id ?? "new"}
                  defaultValue={editingCliente?.telefono}
                  placeholder="+595981123456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  ref={fechaNacimientoRef}
                  key={editingCliente?.id ?? "new"}
                  defaultValue={editingCliente?.fechaNacimiento}
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
          <CardTitle>Lista de Clientes ({clientes.length})</CardTitle>
          <div className="flex items-center gap-2 mt-4">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellido, documento o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>F. Nacimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    {cargando ? "Cargando clientes…" : "Sin registros todavía."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>{cliente.id}</TableCell>
                    <TableCell>
                      {cliente.nombre} {cliente.apellido}
                    </TableCell>
                    <TableCell>
                      {cliente.tipoDocumento}: {cliente.numeroDocumento}
                    </TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.telefono}</TableCell>
                    <TableCell className="text-sm">
                      {formatFecha(cliente.fechaNacimiento)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCliente(cliente)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCliente(cliente.id)}
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
