/**
 * =====================================================================
 *  controllers/NivelController.js
 * =====================================================================
 * Controlador del MODULO 10: Niveles de fidelizacion.
 * CRUD de niveles + consulta del nivel actual de un cliente.
 * =====================================================================
 */

const NivelModel = require('../models/NivelModel');
const ClienteModel = require('../models/ClienteModel');
const vista = require('../views/responseView');
const { validarCamposObligatorios } = require('../utils/validaciones');
const { obtenerPuntosAcumulados } = require('../utils/puntosUtils');

const CAMPOS_OBLIGATORIOS = ['nombre', 'puntosMinimos', 'beneficios'];

/** POST /niveles -> crea un nivel de fidelizacion */
function crear(req, res) {
    const faltantes = validarCamposObligatorios(req.body, CAMPOS_OBLIGATORIOS);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }

    const nuevoNivel = NivelModel.crear({
        nombre: req.body.nombre,
        puntosMinimos: Number(req.body.puntosMinimos),
        beneficios: req.body.beneficios
    });
    return vista.exito(res, nuevoNivel, 'Nivel creado correctamente', 201);
}

/** GET /niveles -> lista los niveles ordenados por exigencia */
function listar(req, res) {
    return vista.exito(res, NivelModel.obtenerOrdenados());
}

/** GET /niveles/:id -> obtiene un nivel puntual */
function obtenerPorId(req, res) {
    const nivel = NivelModel.buscarPorId(req.params.id);
    if (!nivel) return vista.error(res, 'Nivel no encontrado', 404);
    return vista.exito(res, nivel);
}

/** PUT /niveles/:id -> actualiza un nivel */
function actualizar(req, res) {
    const nivelActualizado = NivelModel.actualizar(req.params.id, req.body);
    if (!nivelActualizado) return vista.error(res, 'Nivel no encontrado', 404);
    return vista.exito(res, nivelActualizado, 'Nivel actualizado correctamente');
}

/** DELETE /niveles/:id -> elimina un nivel */
function eliminar(req, res) {
    const seElimino = NivelModel.eliminar(req.params.id);
    if (!seElimino) return vista.error(res, 'Nivel no encontrado', 404);
    return vista.exito(res, null, 'Nivel eliminado correctamente');
}

/**
 * GET /niveles/cliente/:clienteId
 * Devuelve el nivel actual del cliente segun sus puntos acumulados,
 * el nivel siguiente y cuantos puntos le faltan para ascender.
 */
function nivelDeCliente(req, res) {
    const cliente = ClienteModel.buscarPorId(req.params.clienteId);
    if (!cliente) return vista.error(res, 'Cliente no encontrado', 404);

    const puntosAcumulados = obtenerPuntosAcumulados(cliente.id);
    const { nivelActual, nivelSiguiente } = NivelModel.determinarNivel(puntosAcumulados);

    return vista.exito(res, {
        cliente: { id: cliente.id, nombre: cliente.nombre, apellido: cliente.apellido },
        puntosAcumulados,
        nivelActual,
        nivelSiguiente,
        puntosParaSiguienteNivel: nivelSiguiente
            ? Math.max(0, nivelSiguiente.puntosMinimos - puntosAcumulados)
            : 0
    });
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar, nivelDeCliente };
