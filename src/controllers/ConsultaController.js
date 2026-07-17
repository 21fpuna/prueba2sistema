/**
 * =====================================================================
 *  controllers/ConsultaController.js
 * =====================================================================
 * Controlador del MODULO 7: Consultas para reportes.
 * Todas las operaciones son de solo lectura (GET) y reciben sus
 * parametros mediante "query string" (ej: ?clienteId=1).
 * =====================================================================
 */

const { CabeceraUsoPuntos } = require('../models/UsoPuntosModel');
const BolsaPuntosModel = require('../models/BolsaPuntosModel');
const ClienteModel = require('../models/ClienteModel');
const vista = require('../views/responseView');

/**
 * GET /consultas/uso-puntos?clienteId=&conceptoId=&fecha=
 * Consulta de uso de puntos filtrando por concepto, fecha y/o cliente.
 */
function usoDePuntos(req, res) {
    const { clienteId, conceptoId, fecha } = req.query;
    const resultado = CabeceraUsoPuntos.filtrar({ clienteId, conceptoId, fecha });
    return vista.exito(res, resultado);
}

/**
 * GET /consultas/bolsa-puntos?clienteId=&puntosMin=&puntosMax=
 * Consulta de bolsas de puntos por cliente y/o por rango de puntos.
 */
function bolsaDePuntos(req, res) {
    const { clienteId, puntosMin, puntosMax } = req.query;

    let resultado = BolsaPuntosModel.obtenerTodos();

    if (clienteId) {
        resultado = resultado.filter((bolsa) => bolsa.clienteId === Number(clienteId));
    }
    if (puntosMin !== undefined || puntosMax !== undefined) {
        const minimo = puntosMin !== undefined ? Number(puntosMin) : -Infinity;
        const maximo = puntosMax !== undefined ? Number(puntosMax) : Infinity;
        resultado = resultado.filter((bolsa) => bolsa.saldo >= minimo && bolsa.saldo <= maximo);
    }

    return vista.exito(res, resultado);
}

/**
 * GET /consultas/clientes-por-vencer?dias=30
 * Devuelve los clientes que tienen puntos por vencer dentro de "dias" dias.
 */
function clientesConPuntosAVencer(req, res) {
    const dias = req.query.dias ? Number(req.query.dias) : 30;
    const bolsasPorVencer = BolsaPuntosModel.obtenerPorVencerEnDias(dias);

    // Se agrupa la informacion por cliente para que el reporte sea mas util
    const resultado = bolsasPorVencer.map((bolsa) => {
        const cliente = ClienteModel.buscarPorId(bolsa.clienteId);
        return {
            cliente,
            bolsaId: bolsa.id,
            saldo: bolsa.saldo,
            fechaCaducidad: bolsa.fechaCaducidad
        };
    });

    return vista.exito(res, resultado);
}

/**
 * GET /consultas/clientes?nombre=&apellido=&cumpleanios=YYYY-MM-DD
 * Consulta de clientes por nombre (aproximado), apellido (aproximado) o cumpleanios.
 */
function buscarClientes(req, res) {
    const { nombre, apellido, cumpleanios } = req.query;

    let resultado = ClienteModel.obtenerTodos();

    if (nombre) {
        resultado = resultado.filter((c) => c.nombre.toLowerCase().includes(nombre.toLowerCase()));
    }
    if (apellido) {
        resultado = resultado.filter((c) => c.apellido.toLowerCase().includes(apellido.toLowerCase()));
    }
    if (cumpleanios) {
        const referencia = new Date(cumpleanios);
        resultado = resultado.filter((c) => {
            const nacimiento = new Date(c.fechaNacimiento);
            return nacimiento.getDate() === referencia.getDate() &&
                   nacimiento.getMonth() === referencia.getMonth();
        });
    }

    return vista.exito(res, resultado);
}

module.exports = { usoDePuntos, bolsaDePuntos, clientesConPuntosAVencer, buscarClientes };
