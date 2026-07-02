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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Badge } from "./ui/badge";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  tipoDocumento: string;
  nacionalidad: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  puntos: number;
}

const initialClientes: Cliente[] = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    documento: "1234567",
    tipoDocumento: "CI",
    nacionalidad: "Paraguaya",
    email: "juan.perez@email.com",
    telefono: "+595981123456",
    fechaNacimiento: "1985-03-15",
    puntos: 1250,
  },
  {
    id: 2,
    nombre: "María",
    apellido: "González",
    documento: "2345678",
    tipoDocumento: "CI",
    nacionalidad: "Paraguaya",
    email: "maria.gonzalez@email.com",
    telefono: "+595981234567",
    fechaNacimiento: "1990-07-22",
    puntos: 3400,
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Rodríguez",
    documento: "3456789",
    tipoDocumento: "CI",
    nacionalidad: "Paraguaya",
    email: "carlos.rodriguez@email.com",
    telefono: "+595981345678",
    fechaNacimiento: "1978-11-30",
    puntos: 890,
  },
  {
    id: 4,
    nombre: "Ana",
    apellido: "Silva",
    documento: "4567890",
    tipoDocumento: "CI",
    nacionalidad: "Paraguaya",
    email: "ana.silva@email.com",
    telefono: "+595981456789",
    fechaNacimiento: "1992-05-18",
    puntos: 2100,
  },
  {
    id: 5,
    nombre: "Roberto",
    apellido: "Martínez",
    documento: "5678901",
    tipoDocumento: "CI",
    nacionalidad: "Paraguaya",
    email: "roberto.martinez@email.com",
    telefono: "+595981567890",
    fechaNacimiento: "1988-09-25",
    puntos: 1750,
  },
];

const emptyForm = {
  nombre: "",
  apellido: "",
  documento: "",
  tipoDocumento: "CI",
  nacionalidad: "Paraguaya",
  email: "",
  telefono: "",
  fechaNacimiento: "",
};

export function Clientes() {
  const [clientes, setClientes] = useLocalStorage<Cliente[]>("fidelizacion_clientes", initialClientes);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.documento.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCliente = () => {
    setEditingCliente(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      documento: cliente.documento,
      tipoDocumento: cliente.tipoDocumento,
      nacionalidad: cliente.nacionalidad,
      email: cliente.email,
      telefono: cliente.telefono,
      fechaNacimiento: cliente.fechaNacimiento,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCliente = (id: number) => {
    setClientes(clientes.filter((c) => c.id !== id));
  };

  const handleGuardar = () => {
    if (!form.nombre || !form.apellido || !form.documento || !form.email) return;

    if (editingCliente) {
      setClientes(
        clientes.map((c) =>
          c.id === editingCliente.id ? { ...c, ...form } : c
        )
      );
    } else {
      const newId = clientes.length > 0 ? Math.max(...clientes.map((c) => c.id)) + 1 : 1;
      setClientes([...clientes, { id: newId, puntos: 0, ...form }]);
    }
    setIsDialogOpen(false);
  };

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    value={form.nombre}
                    onChange={set("nombre")}
                    placeholder="Ingrese el nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={form.apellido}
                    onChange={set("apellido")}
                    placeholder="Ingrese el apellido"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select
                    value={form.tipoDocumento}
                    onValueChange={(v) => setForm((p) => ({ ...p, tipoDocumento: v }))}
                  >
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
                    value={form.documento}
                    onChange={set("documento")}
                    placeholder="Ingrese el número"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nacionalidad</Label>
                <Select
                  value={form.nacionalidad}
                  onValueChange={(v) => setForm((p) => ({ ...p, nacionalidad: v }))}
                >
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
                  value={form.email}
                  onChange={set("email")}
                  placeholder="ejemplo@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={form.telefono}
                  onChange={set("telefono")}
                  placeholder="+595981123456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={set("fechaNacimiento")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGuardar}>Guardar</Button>
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
                <TableHead>Puntos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.id}</TableCell>
                  <TableCell>
                    {cliente.nombre} {cliente.apellido}
                  </TableCell>
                  <TableCell>
                    {cliente.tipoDocumento}: {cliente.documento}
                  </TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefono}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{cliente.puntos} pts</Badge>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
