/**
 * =====================================================================
 *  models/DesafioModel.js
 * =====================================================================
 * Modelo del MODULO 13 (Gamificacion): Desafios.
 *
 * Se manejan DOS colecciones:
 *   - Desafios:            id, nombre, descripcion, metaPuntos,
 *                          puntosRecompensa, fechaInicio, fechaFin
 *   - DesafiosCompletados: id, clienteId, desafioId, fecha
 *
 * Un desafio se completa cuando el cliente alcanza "metaPuntos" de
 * puntos acumulados dentro del periodo. Al reclamarlo, se le otorga
 * una bolsa de bonificacion con "puntosRecompensa".
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class DesafioModel extends BaseModel {
    constructor() {
        super('desafios');
    }

    /** Desafios cuyo periodo incluye la fecha indicada (por defecto hoy) */
    obtenerVigentes(fecha = new Date()) {
        const fechaConsulta = new Date(fecha);
        return this.obtenerTodos().filter((d) => {
            const inicio = new Date(d.fechaInicio);
            const fin = new Date(d.fechaFin + 'T23:59:59');
            return fechaConsulta >= inicio && fechaConsulta <= fin;
        });
    }
}

class DesafioCompletadoModel extends BaseModel {
    constructor() {
        super('desafiosCompletados');
    }

    /** Indica si un cliente ya reclamo un desafio puntual */
    yaReclamado(clienteId, desafioId) {
        return this.obtenerTodos().some(
            (r) => r.clienteId === Number(clienteId) && r.desafioId === Number(desafioId)
        );
    }

    /** Devuelve los reclamos de un cliente */
    obtenerPorCliente(clienteId) {
        return this.obtenerTodos().filter((r) => r.clienteId === Number(clienteId));
    }
}

module.exports = {
    Desafio: new DesafioModel(),
    DesafioCompletado: new DesafioCompletadoModel()
};
