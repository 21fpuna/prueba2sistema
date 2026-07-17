import { Router, useLocation, Navigate } from "./lib/router";
import { RootLayout } from "./components/RootLayout";
import { Clientes } from "./components/Clientes";
import { ConceptosUso } from "./components/ConceptosUso";
import { ReglasAsignacion } from "./components/ReglasAsignacion";
import { VencimientosPuntos } from "./components/VencimientosPuntos";
import { BolsaPuntos } from "./components/BolsaPuntos";
import { UsoPuntos } from "./components/UsoPuntos";
import { Consultas } from "./components/Consultas";
import { Servicios } from "./components/Servicios";
import { Niveles } from "./components/Niveles";
import { Catalogo } from "./components/Catalogo";
import { Promociones } from "./components/Promociones";
import { Gamificacion } from "./components/Gamificacion";
import { Encuestas } from "./components/Encuestas";
import { NotFound } from "./components/NotFound";

const paginas: Record<string, () => JSX.Element> = {
  "/clientes": Clientes,
  "/conceptos-uso": ConceptosUso,
  "/reglas-asignacion": ReglasAsignacion,
  "/vencimientos": VencimientosPuntos,
  "/bolsa-puntos": BolsaPuntos,
  "/uso-puntos": UsoPuntos,
  "/consultas": Consultas,
  "/servicios": Servicios,
  "/niveles": Niveles,
  "/catalogo": Catalogo,
  "/promociones": Promociones,
  "/gamificacion": Gamificacion,
  "/encuestas": Encuestas,
};

function Rutas() {
  const { pathname } = useLocation();

  if (pathname === "/" || pathname === "") {
    return <Navigate to="/clientes" replace />;
  }

  const Pagina = paginas[pathname.replace(/\/+$/, "")] ?? NotFound;
  return (
    <RootLayout>
      <Pagina />
    </RootLayout>
  );
}

export default function App() {
  return (
    <Router>
      <Rutas />
    </Router>
  );
}
