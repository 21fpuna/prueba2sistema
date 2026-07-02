import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "./ui/badge";

export function Dashboard() {
  const stats = [
    {
      title: "Total Clientes",
      value: "1,234",
      icon: Users,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Puntos Activos",
      value: "45,678",
      icon: Wallet,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Puntos Utilizados (mes)",
      value: "12,345",
      icon: TrendingUp,
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "Puntos por Vencer",
      value: "3,456",
      icon: AlertCircle,
      trend: "-5%",
      trendUp: false,
    },
  ];

  const recentActivity = [
    {
      cliente: "Juan Pérez",
      accion: "Canje de puntos",
      puntos: -500,
      concepto: "Vale de descuento",
      fecha: "2026-06-01 14:30",
    },
    {
      cliente: "María González",
      accion: "Acumulación de puntos",
      puntos: 150,
      concepto: "Compra",
      fecha: "2026-06-01 13:45",
    },
    {
      cliente: "Carlos Rodríguez",
      accion: "Canje de puntos",
      puntos: -300,
      concepto: "Vale de premio",
      fecha: "2026-06-01 12:20",
    },
    {
      cliente: "Ana Silva",
      accion: "Acumulación de puntos",
      puntos: 200,
      concepto: "Compra",
      fecha: "2026-06-01 11:15",
    },
    {
      cliente: "Roberto Martínez",
      accion: "Acumulación de puntos",
      puntos: 350,
      concepto: "Compra",
      fecha: "2026-06-01 10:30",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema de fidelización
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stat.value}</div>
                <Badge
                  variant={stat.trendUp ? "default" : "secondary"}
                  className="mt-1"
                >
                  {stat.trend} este mes
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium">{activity.cliente}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.accion} • {activity.concepto}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      activity.puntos > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {activity.puntos > 0 ? "+" : ""}
                    {activity.puntos} pts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.fecha}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
