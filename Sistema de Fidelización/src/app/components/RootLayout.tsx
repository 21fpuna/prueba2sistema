import React from "react";
import { Outlet, Link, useLocation, type LinkProps } from "react-router";

const ForwardedLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link ref={ref} {...props} />
);
import {
  Users,
  Gift,
  Settings,
  Wallet,
  TrendingUp,
  FileText,
  Cog,
  LayoutDashboard,
  Calendar,
  Package,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Toaster } from "./ui/sonner";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/conceptos-uso", label: "Conceptos de Uso", icon: Gift },
  { path: "/reglas-asignacion", label: "Reglas de Asignación", icon: Settings },
  { path: "/vencimientos", label: "Vencimientos", icon: Calendar },
  { path: "/bolsa-puntos", label: "Bolsa de Puntos", icon: Wallet },
  { path: "/uso-puntos", label: "Uso de Puntos", icon: TrendingUp },
  { path: "/consultas", label: "Consultas y Reportes", icon: FileText },
  { path: "/servicios", label: "Servicios", icon: Cog },
  { path: "/descarga", label: "Descargar Proyecto", icon: Package },
];

export function RootLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Gift className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">Fidelización</h1>
              <p className="text-xs text-muted-foreground">Sistema de Puntos</p>
            </div>
          </div>
        </SidebarHeader>
        <Separator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== "/" && location.pathname.startsWith(item.path));
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <ForwardedLink to={item.path}>
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                        </ForwardedLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}