/**
 * =====================================================================
 *  controllers/BolsaPuntosController.js
 * =====================================================================
 * Controlador del MODULO 5: Bolsa de puntos.
 *
 * Si bien las bolsas normalmente se generan automaticamente a traves
 * del servicio "cargar puntos" (ver ServicioController), tambien se
 * exponen operaciones CRUD completas sobre esta entidad, tal como pide
 * el enunciado para todos los modulos administrables.
 * =====================================================================
 */

const BolsaPuntosModel = require('../models/BolsaPuntosModel');
const vista = require('../views/responseView');
const { validarCamposObligatorios } = require('../utils/validaciones');

const CAMPOS_OBLIGATORIOS = [
    'clienteId', 'fechaAsignacion', 'fechaCaducidad', 'puntajeAsignado', 'montoOperacion'
];

/** POST /bolsas-puntos -> crea manualmente una bolsa de puntos */
function crear(req, res) {
    const faltantes = validarCamposObligatorios(req.body, CAMPOS_OBLIGATORIOS);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }

    const puntajeAsignado = Number(req.body.puntajeAsignado);
    const datos = {
        clienteId: Number(req.body.clienteId),
        fechaAsignacion: req.body.fechaAsignacion,
        fechaCaducidad: req.body.fechaCaducidad,
        puntajeAsignado,
        puntajeUtilizado: 0,
        saldo: puntajeAsignado,
        montoOperacion: Number(req.body.montoOperacion),
        estado: 'vigente'
    };

    const nuevaBolsa = BolsaPuntosModel.crear(datos);
    return vista.exito(res, nuevaBolsa, 'Bolsa de puntos creada correctamente', 201);
}

/** GET /bolsas-puntos -> lista todas las bolsas */
function listar(req, res) {
    return vista.exito(res, BolsaPuntosModel.obtenerTodos());
}

/** GET /bolsas-puntos/:id -> obtiene una bolsa puntual */
function obtenerPorId(req, res) {
    const bolsa = BolsaPuntosModel.buscarPorId(req.params.id);
    if (!bolsa) return vista.error(res, 'Bolsa de puntos no encontrada', 404);
    return vista.exito(res, bolsa);
}

/** PUT /bolsas-puntos/:id -> actualiza una bolsa de puntos */
function actualizar(req, res) {
    const bolsaActualizada = BolsaPuntosModel.actualizar(req.params.id, req.body);
    if (!bolsaActualizada) return vista.error(res, 'Bolsa de puntos no encontrada', 404);
    return vista.exito(res, bolsaActualizada, 'Bolsa de puntos actualizada correctamente');
}

/** DELETE /bolsas-puntos/:id -> elimina una bolsa de puntos */
function eliminar(req, res) {
    const seElimino = BolsaPuntosModel.eliminar(req.params.id);
    if (!seElimino) return vista.error(res, 'Bolsa de puntos no encontrada', 404);
    return vista.exito(res, null, 'Bolsa de puntos eliminada correctamente');
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar };
