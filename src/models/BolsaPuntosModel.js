/**
 * =====================================================================
 *  models/BolsaPuntosModel.js
 * =====================================================================
 * Modelo del MODULO 5: Bolsa de puntos.
 * Estructura: id, clienteId, fechaAsignacion, fechaCaducidad,
 *             puntajeAsignado, puntajeUtilizado, saldo, montoOperacion,
 *             estado ("vigente" | "vencido")
 *
 * Cada vez que un cliente realiza una operacion de pago se genera una
 * "bolsa" con los puntos ganados. Estas bolsas se consumen luego en
 * orden FIFO (primero las mas antiguas) cuando el cliente usa sus puntos.
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class BolsaPuntosModel extends BaseModel {

    constructor() {
        super('bolsasPuntos');
    }

    /** Devuelve todas las bolsas de un cliente en particular */
    obtenerPorCliente(clienteId) {
        return this.obtenerTodos().filter((bolsa) => bolsa.clienteId === Number(clienteId));
    }

    /**
     * Devuelve las bolsas VIGENTES (con saldo disponible) de un cliente,
     * ordenadas de la mas antigua a la mas nueva (orden FIFO).
     */
    obtenerBolsasFIFO(clienteId) {
        return this.obtenerPorCliente(clienteId)
            .filter((bolsa) => bolsa.estado === 'vigente' && bolsa.saldo > 0)
            .sort((a, b) => new Date(a.fechaAsignacion) - new Date(b.fechaAsignacion));
    }

    /** Devuelve las bolsas cuyo saldo esta dentro de un rango [minimo, maximo] */
    obtenerPorRangoDePuntos(minimo, maximo) {
        return this.obtenerTodos().filter((bolsa) => bolsa.saldo >= minimo && bolsa.saldo <= maximo);
    }

    /** Devuelve las bolsas vigentes que caducan dentro de los proximos "dias" dias */
    obtenerPorVencerEnDias(dias) {
        const hoy = new Date();
        const limite = new Date();
        limite.setDate(hoy.getDate() + Number(dias));

        return this.obtenerTodos().filter((bolsa) => {
            if (bolsa.estado !== 'vigente' || bolsa.saldo <= 0) return false;
            const caducidad = new Date(bolsa.fechaCaducidad);
            return caducidad >= hoy && caducidad <= limite;
        });
    }

    /** Devuelve todas las bolsas vigentes cuya fecha de caducidad ya paso (para el job de vencimientos) */
    obtenerBolsasVencidasHoy() {
        const hoy = new Date();
        return this.obtenerTodos().filter((bolsa) => {
            if (bolsa.estado !== 'vigente') return false;
            const caducidad = new Date(bolsa.fechaCaducidad);
            return caducidad < hoy;
        });
    }
}

module.exports = new BolsaPuntosModel();
