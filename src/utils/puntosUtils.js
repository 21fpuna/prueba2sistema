/**
 * =====================================================================
 *  utils/puntosUtils.js
 * =====================================================================
 * Funciones compartidas de puntos, usadas por los modulos nuevos
 * (niveles, canjes, gamificacion) sin duplicar logica.
 * =====================================================================
 */

const BolsaPuntosModel = require('../models/BolsaPuntosModel');

/**
 * Total HISTORICO de puntos acumulados por un cliente: la suma del
 * puntaje asignado de todas sus bolsas (usados o no, vencidos o no).
 * Es la medida que se usa para niveles, desafios y ranking.
 */
function obtenerPuntosAcumulados(clienteId) {
    return BolsaPuntosModel.obtenerPorCliente(clienteId)
        .reduce((acumulado, bolsa) => acumulado + Number(bolsa.puntajeAsignado || 0), 0);
}

/** Saldo DISPONIBLE de un cliente (bolsas vigentes con saldo) */
function obtenerSaldoDisponible(clienteId) {
    return BolsaPuntosModel.obtenerBolsasFIFO(clienteId)
        .reduce((acumulado, bolsa) => acumulado + bolsa.saldo, 0);
}

/**
 * Descuenta "puntosRequeridos" de las bolsas vigentes del cliente en
 * orden FIFO (misma logica que el servicio "utilizar puntos").
 * Devuelve el detalle de bolsas afectadas, o null si el saldo no alcanza.
 */
function descontarPuntosFIFO(clienteId, puntosRequeridos) {
    const bolsasDisponibles = BolsaPuntosModel.obtenerBolsasFIFO(clienteId);
    const saldoTotal = bolsasDisponibles.reduce((acc, b) => acc + b.saldo, 0);

    if (saldoTotal < puntosRequeridos) return null;

    let puntosPendientes = puntosRequeridos;
    const detalle = [];

    for (const bolsa of bolsasDisponibles) {
        if (puntosPendientes <= 0) break;

        const puntosADescontar = Math.min(bolsa.saldo, puntosPendientes);

        BolsaPuntosModel.actualizar(bolsa.id, {
            puntajeUtilizado: bolsa.puntajeUtilizado + puntosADescontar,
            saldo: bolsa.saldo - puntosADescontar
        });

        detalle.push({ bolsaId: bolsa.id, puntosDescontados: puntosADescontar });
        puntosPendientes -= puntosADescontar;
    }

    return detalle;
}

module.exports = { obtenerPuntosAcumulados, obtenerSaldoDisponible, descontarPuntosFIFO };
