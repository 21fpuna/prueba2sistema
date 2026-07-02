import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./components/Dashboard";
import { Clientes } from "./components/Clientes";
import { ConceptosUso } from "./components/ConceptosUso";
import { ReglasAsignacion } from "./components/ReglasAsignacion";
import { VencimientosPuntos } from "./components/VencimientosPuntos";
import { BolsaPuntos } from "./components/BolsaPuntos";
import { UsoPuntos } from "./components/UsoPuntos";
import { Consultas } from "./components/Consultas";
import { Servicios } from "./components/Servicios";
import { NotFound } from "./components/NotFound";
import { Descarga } from "./components/Descarga";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "clientes", Component: Clientes },
      { path: "conceptos-uso", Component: ConceptosUso },
      { path: "reglas-asignacion", Component: ReglasAsignacion },
      { path: "vencimientos", Component: VencimientosPuntos },
      { path: "bolsa-puntos", Component: BolsaPuntos },
      { path: "uso-puntos", Component: UsoPuntos },
      { path: "consultas", Component: Consultas },
      { path: "servicios", Component: Servicios },
      { path: "descarga", Component: Descarga },
      { path: "*", Component: NotFound },
    ],
  },
]);
