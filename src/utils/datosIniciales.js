/**
 * =====================================================================
 *  utils/datosIniciales.js
 * =====================================================================
 * Datos de ejemplo para los modulos adicionales del Segundo Final.
 *
 * Al iniciar el servidor, si alguna de las colecciones NUEVAS esta
 * vacia, se cargan registros de ejemplo para poder demostrar el sistema
 * de inmediato. NO toca las colecciones existentes (clientes, reglas,
 * etc.) ni pisa datos ya cargados: solo siembra lo que falta.
 * =====================================================================
 */

const NivelModel = require('../models/NivelModel');
const ProductoModel = require('../models/ProductoModel');
const PromocionModel = require('../models/PromocionModel');
const { Desafio } = require('../models/DesafioModel');

function cargarDatosIniciales() {
    // ---- Niveles de fidelizacion (Modulo 10) ----
    if (NivelModel.obtenerTodos().length === 0) {
        [
            { nombre: 'Bronce', puntosMinimos: 0, beneficios: 'Acceso al programa de puntos y promociones generales' },
            { nombre: 'Plata', puntosMinimos: 1000, beneficios: 'Canjes preferenciales y acceso anticipado a promociones' },
            { nombre: 'Oro', puntosMinimos: 5000, beneficios: 'Atencion prioritaria y productos exclusivos del catalogo' },
            { nombre: 'Platino', puntosMinimos: 15000, beneficios: 'Beneficios maximos: eventos exclusivos y regalos de cumpleanios' }
        ].forEach((nivel) => NivelModel.crear(nivel));
        console.log('[datosIniciales] Niveles de fidelizacion de ejemplo cargados');
    }

    // ---- Catalogo de productos canjeables (Modulo 11) ----
    if (ProductoModel.obtenerTodos().length === 0) {
        [
            { nombre: 'Taza termica', descripcion: 'Taza termica de acero con logo de la empresa', precio: 150000, puntosNecesarios: 30 },
            { nombre: 'Auriculares bluetooth', descripcion: 'Auriculares inalambricos con estuche de carga', precio: 350000, puntosNecesarios: 70 },
            { nombre: 'Vale de combustible', descripcion: 'Vale de combustible por 250.000 Gs.', precio: 250000, puntosNecesarios: 50 },
            { nombre: 'Cena para dos personas', descripcion: 'Cena completa para dos en restaurante asociado', precio: 500000, puntosNecesarios: 100 }
        ].forEach((producto) => ProductoModel.crear(producto));
        console.log('[datosIniciales] Catalogo de productos de ejemplo cargado');
    }

    // ---- Promociones (Modulo 12) ----
    if (PromocionModel.obtenerTodos().length === 0) {
        PromocionModel.crear({
            descripcion: 'Puntos dobles de temporada',
            fechaInicio: '2026-07-01',
            fechaFin: '2026-07-31',
            multiplicador: 2,
            productoId: null,
            activa: true
        });
        console.log('[datosIniciales] Promocion de ejemplo cargada');
    }

    // ---- Desafios de gamificacion (Modulo 13) ----
    if (Desafio.obtenerTodos().length === 0) {
        [
            {
                nombre: 'Primer acumulador',
                descripcion: 'Acumula tus primeros 100 puntos del programa',
                metaPuntos: 100, puntosRecompensa: 20,
                fechaInicio: '2026-01-01', fechaFin: '2026-12-31'
            },
            {
                nombre: 'Cliente estrella',
                descripcion: 'Alcanza 1.000 puntos acumulados en el anio',
                metaPuntos: 1000, puntosRecompensa: 200,
                fechaInicio: '2026-01-01', fechaFin: '2026-12-31'
            }
        ].forEach((desafio) => Desafio.crear(desafio));
        console.log('[datosIniciales] Desafios de ejemplo cargados');
    }
}

module.exports = { cargarDatosIniciales };
