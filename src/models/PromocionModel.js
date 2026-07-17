/**
 * =====================================================================
 *  models/PromocionModel.js
 * =====================================================================
 * Modelo del MODULO 12: Promociones especiales.
 * Estructura: id, descripcion, fechaInicio, fechaFin, multiplicador,
 *             productoId (null = aplica a todas las operaciones),
 *             activa (true/false)
 *
 * Una promocion vigente multiplica los puntos que se asignan al cargar
 * una operacion (ej: multiplicador 2 = puntos dobles). Puede limitarse
 * a un producto especifico del catalogo o aplicar de forma general,
 * siempre dentro de su rango de fechas.
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class PromocionModel extends BaseModel {

    constructor() {
        super('promociones');
    }

    /**
     * Devuelve las promociones vigentes para una fecha dada (por defecto
     * hoy) y, opcionalmente, para un producto especifico. Las promociones
     * generales (productoId null) aplican siempre que esten vigentes.
     */
    obtenerVigentes(fecha = new Date(), productoId = null) {
        const fechaConsulta = new Date(fecha);
        return this.obtenerTodos().filter((promo) => {
            if (!promo.activa) return false;
            const inicio = new Date(promo.fechaInicio);
            const fin = new Date(promo.fechaFin + 'T23:59:59');
            if (fechaConsulta < inicio || fechaConsulta > fin) return false;
            if (promo.productoId === null || promo.productoId === undefined) return true;
            return Number(promo.productoId) === Number(productoId);
        });
    }
}

module.exports = new PromocionModel();
