/**
 * =====================================================================
 *  controllers/UsoPuntosController.js
 * =====================================================================
 * Controlador del MODULO 6: Uso de puntos.
 *
 * La CREACION de un uso de puntos se realiza a traves del servicio
 * "utilizar puntos" (ver ServicioController), ya que ese proceso
 * implica logica de negocio (descuento FIFO de bolsas, envio de email,
 * etc). Este controlador expone la CONSULTA de lo ya generado
 * (cabecera + detalle), cumpliendo igualmente con el CRUD solicitado
 * para listar/consultar/eliminar registros.
 * =====================================================================
 */

const { CabeceraUsoPuntos, DetalleUsoPuntos } = require('../models/UsoPuntosModel');
const vista = require('../views/responseView');

/** GET /uso-puntos -> lista todas las cabeceras de uso de puntos */
function listar(req, res) {
    return vista.exito(res, CabeceraUsoPuntos.obtenerTodos());
}

/** GET /uso-puntos/:id -> obtiene una cabecera junto con su detalle */
function obtenerPorId(req, res) {
    const cabecera = CabeceraUsoPuntos.buscarPorId(req.params.id);
    if (!cabecera) return vista.error(res, 'Registro de uso de puntos no encontrado', 404);

    const detalle = DetalleUsoPuntos.obtenerPorCabecera(cabecera.id);
    return vista.exito(res, { ...cabecera, detalle });
}

/** DELETE /uso-puntos/:id -> elimina una cabecera y su detalle asociado */
function eliminar(req, res) {
    const cabecera = CabeceraUsoPuntos.buscarPorId(req.params.id);
    if (!cabecera) return vista.error(res, 'Registro de uso de puntos no encontrado', 404);

    // Elimina primero todas las lineas de detalle asociadas
    const detalle = DetalleUsoPuntos.obtenerPorCabecera(cabecera.id);
    detalle.forEach((linea) => DetalleUsoPuntos.eliminar(linea.id));

    CabeceraUsoPuntos.eliminar(cabecera.id);
    return vista.exito(res, null, 'Registro de uso de puntos eliminado correctamente');
}

module.exports = { listar, obtenerPorId, eliminar };
