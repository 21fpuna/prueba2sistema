/**
 * =====================================================================
 *  views/responseView.js
 * =====================================================================
 * En una API backend, la "Vista" (la V del patron MVC) no dibuja
 * pantallas HTML, sino que define el FORMATO en el que se le devuelve
 * la informacion al cliente que consume el servicio (en este caso, en
 * formato JSON).
 *
 * Centralizar el formato de respuesta aca evita repetir codigo en cada
 * controlador y garantiza que TODAS las respuestas del sistema tengan
 * siempre la misma forma:
 *   { exito: true/false, mensaje: "...", datos: {...} }
 * =====================================================================
 */

/** Respuesta exitosa estandar */
function exito(res, datos = null, mensaje = 'Operacion realizada con exito', codigoHttp = 200) {
    return res.status(codigoHttp).json({
        exito: true,
        mensaje,
        datos
    });
}

/** Respuesta de error estandar */
function error(res, mensaje = 'Ocurrio un error al procesar la solicitud', codigoHttp = 400) {
    return res.status(codigoHttp).json({
        exito: false,
        mensaje
    });
}

module.exports = { exito, error };
