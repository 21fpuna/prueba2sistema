/**
 * =====================================================================
 *  controllers/EncuestaController.js
 * =====================================================================
 * Controlador del MODULO 14: Encuestas de satisfaccion.
 * Registro de respuestas + consulta + resumen (promedio/distribucion).
 * =====================================================================
 */

const EncuestaModel = require('../models/EncuestaModel');
const ClienteModel = require('../models/ClienteModel');
const vista = require('../views/responseView');
const { validarCamposObligatorios, formatearFecha } = require('../utils/validaciones');

/** POST /encuestas -> registra una respuesta de encuesta */
function crear(req, res) {
    const faltantes = validarCamposObligatorios(req.body, ['clienteId', 'puntuacion']);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }

    const puntuacion = Number(req.body.puntuacion);
    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
        return vista.error(res, 'La puntuacion debe ser un numero entero entre 1 y 5');
    }

    const cliente = ClienteModel.buscarPorId(req.body.clienteId);
    if (!cliente) return vista.error(res, 'Cliente no encontrado', 404);

    const nuevaEncuesta = EncuestaModel.crear({
        clienteId: Number(req.body.clienteId),
        puntuacion,
        comentario: req.body.comentario || '',
        fecha: formatearFecha(new Date())
    });
    return vista.exito(res, nuevaEncuesta, 'Encuesta registrada correctamente. Gracias por su opinion', 201);
}

/** GET /encuestas -> lista las respuestas (opcionalmente ?clienteId=) */
function listar(req, res) {
    const { clienteId } = req.query;
    const encuestas = clienteId
        ? EncuestaModel.obtenerPorCliente(clienteId)
        : EncuestaModel.obtenerTodos();
    return vista.exito(res, encuestas);
}

/** GET /encuestas/resumen -> promedio y distribucion de puntuaciones */
function resumen(req, res) {
    return vista.exito(res, EncuestaModel.calcularResumen());
}

/** GET /encuestas/:id -> obtiene una respuesta puntual */
function obtenerPorId(req, res) {
    const encuesta = EncuestaModel.buscarPorId(req.params.id);
    if (!encuesta) return vista.error(res, 'Encuesta no encontrada', 404);
    return vista.exito(res, encuesta);
}

/** DELETE /encuestas/:id -> elimina una respuesta */
function eliminar(req, res) {
    const seElimino = EncuestaModel.eliminar(req.params.id);
    if (!seElimino) return vista.error(res, 'Encuesta no encontrada', 404);
    return vista.exito(res, null, 'Encuesta eliminada correctamente');
}

module.exports = { crear, listar, resumen, obtenerPorId, eliminar };
