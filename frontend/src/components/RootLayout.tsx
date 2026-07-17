import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "../lib/router";
import {
  Users,
  Gift,
  Settings,
  Wallet,
  TrendingUp,
  FileText,
  Cog,
  Calendar,
  Menu,
  X,
  Award,
  ShoppingBag,
  Megaphone,
  Trophy,
  MessageSquare,
} from "../lib/icons";
import { Separator } from "./ui/separator";
import { Toaster } from "../lib/toast";

const menuItems = [
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/conceptos-uso", label: "Conceptos de Uso", icon: Gift },
  { path: "/reglas-asignacion", label: "Reglas de Asignación", icon: Settings },
  { path: "/vencimientos", label: "Vencimientos", icon: Calendar },
  { path: "/bolsa-puntos", label: "Bolsa de Puntos", icon: Wallet },
  { path: "/uso-puntos", label: "Uso de Puntos", icon: TrendingUp },
  { path: "/consultas", label: "Consultas y Reportes", icon: FileText },
  { path: "/servicios", label: "Servicios", icon: Cog },
  { path: "/niveles", label: "Niveles", icon: Award },
  { path: "/catalogo", label: "Canje de Productos", icon: ShoppingBag },
  { path: "/promociones", label: "Promociones", icon: Megaphone },
  { path: "/gamificacion", label: "Gamificación", icon: Trophy },
  { path: "/encuestas", label: "Encuestas", icon: MessageSquare },
];

/** Indicador del estado de conexión con el backend */
function EstadoServidor() {
  const [estado, setEstado] = useState<"verificando" | "conectado" | "error">(
    "verificando"
  );

  useEffect(() => {
    let activo = true;
    const verificar = async () => {
      try {
        const r = await fetch("/api/clientes");
        if (activo) setEstado(r.ok ? "conectado" : "error");
      } catch {
        if (activo) setEstado("error");
      }
    };
    verificar();
    const intervalo = setInterval(verificar, 15000);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  return (
    <div className="estado-servidor">
      <span className={`estado-punto estado-punto-${estado}`} />
      {estado === "conectado"
        ? "Servidor conectado"
        : estado === "error"
          ? "Servidor no disponible"
          : "Verificando servidor…"}
    </div>
  );
}

export function RootLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [sidebarAbierta, setSidebarAbierta] = useState(false);

  // Cierra la barra lateral (en móvil) al navegar
  useEffect(() => {
    setSidebarAbierta(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <button
        type="button"
        className="sidebar-toggle"
        aria-label="Abrir menú"
        onClick={() => setSidebarAbierta(!sidebarAbierta)}
      >
        {sidebarAbierta ? <X /> : <Menu />}
      </button>

      {sidebarAbierta && (
        <div
          className="sidebar-fondo"
          onClick={() => setSidebarAbierta(false)}
        />
      )}

      <aside className={`sidebar ${sidebarAbierta ? "sidebar-abierta" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-marca">
            <div className="sidebar-logo">
              <Gift />
            </div>
            <div>
              <h1 className="sidebar-titulo">Fidelización</h1>
              <p className="sidebar-subtitulo">Sistema de Puntos</p>
            </div>
          </div>
        </div>
        <Separator />
        <nav className="sidebar-nav">
          <p className="sidebar-grupo-label">Navegación</p>
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const activo = location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`sidebar-item ${activo ? "sidebar-item-activo" : ""}`}
                  >
                    <Icon className="sidebar-icono" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <EstadoServidor />
        </div>
      </aside>

      <main className="contenido">{children}</main>
      <Toaster />
    </div>
  );
}
