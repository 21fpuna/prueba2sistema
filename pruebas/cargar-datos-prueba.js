/**
 * =====================================================================
 *  pruebas/cargar-datos-prueba.js
 * =====================================================================
 * Carga un juego de datos de DEMOSTRACION completo y coherente en
 * data/localStorage.json, listo para el dia de la revision.
 *
 *   USO (desde la raiz del proyecto, con el servidor APAGADO):
 *       node pruebas/cargar-datos-prueba.js
 *
 * - Hace un respaldo automatico del archivo de datos actual en
 *   data/localStorage.respaldo-<fecha>.json antes de reemplazarlo.
 * - Las fechas se calculan RELATIVAS AL DIA DE HOY, asi el parametro
 *   de vencimiento siempre esta vigente, hay bolsas activas, una
 *   bolsa "por vencer" y una vencida, sin importar cuando se ejecute.
 * - Los usos y canjes se generan aplicando la MISMA logica FIFO del
 *   sistema, por lo que los saldos de las bolsas quedan consistentes.
 * =====================================================================
 */

const fs = require('fs');
const path = require('path');

// ------------------------- respaldo previo -------------------------
const ARCHIVO_DATOS = path.join(__dirname, '..', 'data', 'localStorage.json');
if (fs.existsSync(ARCHIVO_DATOS)) {
    const marca = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const respaldo = path.join(__dirname, '..', 'data', `localStorage.respaldo-${marca}.json`);
    fs.copyFileSync(ARCHIVO_DATOS, respaldo);
    console.log(`[datos-prueba] Respaldo del archivo anterior: data/${path.basename(respaldo)}`);
}

// ------------------------- modelos del sistema -------------------------
const localStorage = require('../src/utils/localStorage');
const ClienteModel = require('../src/models/ClienteModel');
const ConceptoModel = require('../src/models/ConceptoModel');
const ReglaModel = require('../src/models/ReglaModel');
const VencimientoModel = require('../src/models/VencimientoModel');
const BolsaPuntosModel = require('../src/models/BolsaPuntosModel');
const { CabeceraUsoPuntos, DetalleUsoPuntos } = require('../src/models/UsoPuntosModel');
const NivelModel = require('../src/models/NivelModel');
const ProductoModel = require('../src/models/ProductoModel');
const CanjeModel = require('../src/models/CanjeModel');
const PromocionModel = require('../src/models/PromocionModel');
const { Desafio, DesafioCompletado } = require('../src/models/DesafioModel');
const EncuestaModel = require('../src/models/EncuestaModel');
const { descontarPuntosFIFO } = require('../src/utils/puntosUtils');
const { formatearFecha, sumarDias } = require('../src/utils/validaciones');

// ------------------------- utilidades de fechas -------------------------
const HOY = new Date();
const hace = (dias) => formatearFecha(sumarDias(HOY, -dias));
const dentroDe = (dias) => formatearFecha(sumarDias(HOY, dias));

// Se limpia TODO el almacenamiento (ya quedo respaldado arriba)
localStorage.clear();
console.log('[datos-prueba] Almacenamiento reiniciado. Cargando datos…');

/* ============================ 1. CLIENTES ============================ */
const clientes = [
    { nombre: 'María',   apellido: 'González',  numeroDocumento: '2345678', tipoDocumento: 'CI',  nacionalidad: 'Paraguaya', email: 'maria.gonzalez@email.com',  telefono: '+595981234567', fechaNacimiento: '1990-07-22' },
    { nombre: 'Juan',    apellido: 'Pérez',     numeroDocumento: '1234567', tipoDocumento: 'CI',  nacionalidad: 'Paraguaya', email: 'juan.perez@email.com',      telefono: '+595981123456', fechaNacimiento: '1985-03-15' },
    { nombre: 'Carlos',  apellido: 'Rodríguez', numeroDocumento: '3456789', tipoDocumento: 'CI',  nacionalidad: 'Paraguaya', email: 'carlos.rodriguez@email.com', telefono: '+595981345678', fechaNacimiento: '1978-11-30' },
    // Ana cumple anios HOY: sirve para demostrar la busqueda por cumpleanios y la insignia
    { nombre: 'Ana',     apellido: 'Silva',     numeroDocumento: '4567890', tipoDocumento: 'CI',  nacionalidad: 'Paraguaya', email: 'ana.silva@email.com',        telefono: '+595981456789', fechaNacimiento: `1992-${String(HOY.getMonth() + 1).padStart(2, '0')}-${String(HOY.getDate()).padStart(2, '0')}` },
    { nombre: 'Roberto', apellido: 'Martínez',  numeroDocumento: '5678901', tipoDocumento: 'RUC', nacionalidad: 'Paraguaya', email: 'roberto.martinez@email.com', telefono: '+595981567890', fechaNacimiento: '1988-09-25' },
    { nombre: 'Lucía',   apellido: 'Benítez',   numeroDocumento: '4879123', tipoDocumento: 'CI',  nacionalidad: 'Argentina', email: 'lucia.benitez@email.com',    telefono: '+595981555444', fechaNacimiento: '1993-04-11' },
].map((c) => ClienteModel.crear(c));

/* ============================ 2. REGLAS ============================ */
[
    { limiteInferior: 0,      limiteSuperior: 199999, montoEquivalencia: 50000 },  // 1 pto c/ 50.000 Gs
    { limiteInferior: 200000, limiteSuperior: 499999, montoEquivalencia: 30000 },  // 1 pto c/ 30.000 Gs
    { limiteInferior: 500000, limiteSuperior: null,   montoEquivalencia: 20000 },  // 1 pto c/ 20.000 Gs (sin tope)
].forEach((r) => ReglaModel.crear(r));

/* ======================== 3. VENCIMIENTOS ======================== */
VencimientoModel.crear({ fechaInicioValidez: hace(400), fechaFinValidez: hace(181), diasDuracion: 120 }); // periodo anterior
VencimientoModel.crear({ fechaInicioValidez: hace(180), fechaFinValidez: dentroDe(185), diasDuracion: 180 }); // VIGENTE hoy

/* ========================== 4. CONCEPTOS ========================== */
const conceptos = [
    { descripcion: 'Vale de consumición - Bebida gratis', puntosRequeridos: 15 },
    { descripcion: 'Vale de descuento 10%',               puntosRequeridos: 25 },
    { descripcion: 'Vale de premio - Producto gratis',    puntosRequeridos: 60 },
    { descripcion: 'Vale de descuento 25%',               puntosRequeridos: 100 },
].map((c) => ConceptoModel.crear(c));

/* =========================== 5. NIVELES =========================== */
[
    { nombre: 'Bronce',  puntosMinimos: 0,    beneficios: 'Acceso al programa de puntos y promociones generales' },
    { nombre: 'Plata',   puntosMinimos: 100,  beneficios: 'Canjes preferenciales y acceso anticipado a promociones' },
    { nombre: 'Oro',     puntosMinimos: 300,  beneficios: 'Atención prioritaria y productos exclusivos del catálogo' },
    { nombre: 'Platino', puntosMinimos: 700,  beneficios: 'Beneficios máximos: eventos exclusivos y regalos de cumpleaños' },
].forEach((n) => NivelModel.crear(n));

/* ========================== 6. PRODUCTOS ========================== */
const productos = [
    { nombre: 'Taza térmica',            descripcion: 'Taza térmica de acero con logo de la empresa',      precio: 150000, puntosNecesarios: 15 },
    { nombre: 'Auriculares bluetooth',   descripcion: 'Auriculares inalámbricos con estuche de carga',     precio: 350000, puntosNecesarios: 35 },
    { nombre: 'Vale de combustible',     descripcion: 'Vale de combustible por 250.000 Gs.',               precio: 250000, puntosNecesarios: 25 },
    { nombre: 'Cena para dos personas',  descripcion: 'Cena completa para dos en restaurante asociado',    precio: 500000, puntosNecesarios: 50 },
].map((p) => ProductoModel.crear(p));

/* ========================= 7. PROMOCIONES ========================= */
PromocionModel.crear({ descripcion: 'Puntos dobles de temporada', fechaInicio: hace(10), fechaFin: dentroDe(20), multiplicador: 2, productoId: null, activa: true });   // VIGENTE
PromocionModel.crear({ descripcion: 'Triple puntos de aniversario', fechaInicio: hace(90), fechaFin: hace(60), multiplicador: 3, productoId: null, activa: true });     // ya expirada

/* ========================== 8. DESAFIOS ========================== */
const desafios = [
    { nombre: 'Primer acumulador', descripcion: 'Acumulá tus primeros 50 puntos del programa',   metaPuntos: 50,  puntosRecompensa: 10, fechaInicio: hace(180), fechaFin: dentroDe(185) },
    { nombre: 'Cliente estrella',  descripcion: 'Alcanzá 300 puntos acumulados en el año',        metaPuntos: 300, puntosRecompensa: 50, fechaInicio: hace(180), fechaFin: dentroDe(185) },
    { nombre: 'Leyenda dorada',    descripcion: 'Superá los 800 puntos acumulados en el programa', metaPuntos: 800, puntosRecompensa: 120, fechaInicio: hace(180), fechaFin: dentroDe(185) },
].map((d) => Desafio.crear(d));

/* ============================ 9. BOLSAS ============================ */
// Helper: crea una bolsa historica coherente (caducidad = asignacion + 180 dias)
function bolsa(clienteId, diasAtras, puntos, monto, opciones = {}) {
    const asignacion = sumarDias(HOY, -diasAtras);
    return BolsaPuntosModel.crear({
        clienteId,
        fechaAsignacion: formatearFecha(asignacion),
        fechaCaducidad: opciones.caducidad || formatearFecha(sumarDias(asignacion, 180)),
        puntajeAsignado: puntos,
        puntajeUtilizado: 0,
        saldo: puntos,
        montoOperacion: monto,
        estado: opciones.estado || 'vigente'
    });
}

// María (id 1): compradora fuerte → nivel Oro (~500 pts acumulados)
bolsa(1, 150, 100, 2000000);
bolsa(1, 90, 150, 3000000);
bolsa(1, 40, 175, 3500000);
bolsa(1, 5, 80, 800000);           // compra reciente (con promo x2: 40 base → 80)

// Juan (id 2): nivel Plata (~180 pts)
bolsa(2, 120, 60, 1200000);
bolsa(2, 60, 70, 1400000);
bolsa(2, 15, 50, 1000000);

// Carlos (id 3): nivel Bronce (~60 pts) — una bolsa POR VENCER en ~12 dias
const bolsaCarlosVieja = bolsa(3, 168, 35, 700000, { caducidad: dentroDe(12) });
bolsa(3, 20, 25, 500000);

// Ana (id 4): nivel Platino (~900 pts) — la cliente top del ranking
bolsa(4, 160, 300, 6000000);
bolsa(4, 100, 250, 5000000);
bolsa(4, 50, 200, 4000000);
bolsa(4, 10, 150, 3000000);

// Roberto (id 5): tuvo puntos que VENCIERON (bolsa vencida, saldo 0)
BolsaPuntosModel.crear({
    clienteId: 5,
    fechaAsignacion: hace(300),
    fechaCaducidad: hace(120),
    puntajeAsignado: 90,
    puntajeUtilizado: 0,
    saldo: 0,
    montoOperacion: 1800000,
    estado: 'vencido'
});
bolsa(5, 30, 45, 900000);

// Lucía (id 6): clienta nueva, una sola compra
bolsa(6, 3, 20, 400000);

/* ================= 10. USOS DE PUNTOS (via FIFO real) ================= */
function usoDePuntos(clienteId, conceptoIndice, diasAtras) {
    const concepto = conceptos[conceptoIndice];
    const detalleFIFO = descontarPuntosFIFO(clienteId, concepto.puntosRequeridos);
    if (!detalleFIFO) return console.log(`  (salteado: cliente ${clienteId} sin saldo para ${concepto.descripcion})`);
    const cabecera = CabeceraUsoPuntos.crear({
        clienteId,
        puntajeUtilizado: concepto.puntosRequeridos,
        fecha: hace(diasAtras),
        conceptoId: concepto.id
    });
    detalleFIFO.forEach((linea) => DetalleUsoPuntos.crear({
        cabeceraId: cabecera.id,
        puntajeUtilizado: linea.puntosDescontados,
        bolsaId: linea.bolsaId
    }));
}
usoDePuntos(1, 2, 30);  // María canjeó un vale de premio (60 pts)
usoDePuntos(1, 1, 8);   // María canjeó un vale de descuento 10% (25 pts)
usoDePuntos(2, 0, 12);  // Juan canjeó una bebida gratis (15 pts)
usoDePuntos(4, 3, 20);  // Ana canjeó un vale de descuento 25% (100 pts)

/* ================= 11. CANJES DE PRODUCTOS (via FIFO real) ================= */
function canjeProducto(clienteId, productoIndice, cantidad, diasAtras) {
    const producto = productos[productoIndice];
    const puntosRequeridos = producto.puntosNecesarios * cantidad;
    const detalleFIFO = descontarPuntosFIFO(clienteId, puntosRequeridos);
    if (!detalleFIFO) return console.log(`  (salteado: cliente ${clienteId} sin saldo para ${producto.nombre})`);
    CanjeModel.crear({ clienteId, productoId: producto.id, cantidad, puntosUtilizados: puntosRequeridos, fecha: hace(diasAtras) });
}
canjeProducto(4, 3, 1, 6);  // Ana canjeó una cena para dos (50 pts)
canjeProducto(1, 0, 2, 2);  // María canjeó 2 tazas térmicas (30 pts)

/* ================= 12. DESAFIOS RECLAMADOS ================= */
// Ana ya reclamó los desafios 1 y 2 (recompensas entregadas como bolsas de bonificacion)
[
    { desafio: desafios[0], dias: 90 },
    { desafio: desafios[1], dias: 45 },
].forEach(({ desafio, dias }) => {
    BolsaPuntosModel.crear({
        clienteId: 4,
        fechaAsignacion: hace(dias),
        fechaCaducidad: formatearFecha(sumarDias(sumarDias(HOY, -dias), 180)),
        puntajeAsignado: desafio.puntosRecompensa,
        puntajeUtilizado: 0,
        saldo: desafio.puntosRecompensa,
        montoOperacion: 0,
        estado: 'vigente'
    });
    DesafioCompletado.crear({ clienteId: 4, desafioId: desafio.id, fecha: hace(dias) });
});

/* ========================== 13. ENCUESTAS ========================== */
[
    { clienteId: 4, puntuacion: 5, comentario: 'Excelente programa, los canjes son muy convenientes', dias: 15 },
    { clienteId: 1, puntuacion: 5, comentario: 'Me encantan las promociones de puntos dobles', dias: 10 },
    { clienteId: 2, puntuacion: 4, comentario: 'Muy bueno, sumaría más productos al catálogo', dias: 8 },
    { clienteId: 3, puntuacion: 3, comentario: 'Está bien, pero los puntos vencen muy rápido', dias: 5 },
    { clienteId: 6, puntuacion: 4, comentario: 'Recién empiezo pero se ve muy fácil de usar', dias: 1 },
].forEach((e) => EncuestaModel.crear({ clienteId: e.clienteId, puntuacion: e.puntuacion, comentario: e.comentario, fecha: hace(e.dias) }));

/* ========================== RESUMEN FINAL ========================== */
console.log('[datos-prueba] Datos de demostración cargados:');
console.log(`  - ${ClienteModel.obtenerTodos().length} clientes (Ana Silva cumple años HOY)`);
console.log(`  - ${ReglaModel.obtenerTodos().length} reglas de asignación (3 tramos)`);
console.log(`  - ${VencimientoModel.obtenerTodos().length} parámetros de vencimiento (1 vigente)`);
console.log(`  - ${ConceptoModel.obtenerTodos().length} conceptos de uso`);
console.log(`  - ${NivelModel.obtenerTodos().length} niveles (Bronce → Platino)`);
console.log(`  - ${ProductoModel.obtenerTodos().length} productos canjeables`);
console.log(`  - ${PromocionModel.obtenerTodos().length} promociones (1 vigente x2)`);
console.log(`  - ${Desafio.obtenerTodos().length} desafíos (Ana ya reclamó 2)`);
console.log(`  - ${BolsaPuntosModel.obtenerTodos().length} bolsas de puntos (1 vencida, 1 por vencer en ~12 días)`);
console.log(`  - ${CabeceraUsoPuntos.obtenerTodos().length} usos de puntos con detalle FIFO`);
console.log(`  - ${CanjeModel.obtenerTodos().length} canjes de productos`);
console.log(`  - ${EncuestaModel.obtenerTodos().length} encuestas de satisfacción`);
console.log('');
console.log('Listo. Levantá el servidor con "npm start" y ya podés demostrar todos los módulos.');
