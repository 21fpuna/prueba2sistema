/**
 * =====================================================================
 *  utils/validaciones.js
 * =====================================================================
 * Funciones auxiliares de validacion, reutilizadas por los distintos
 * controladores para verificar que los datos recibidos sean correctos
 * antes de guardarlos.
 * =====================================================================
 */

/**
 * Verifica que un objeto tenga todos los campos obligatorios indicados.
 * @param {object} datos - objeto recibido en el body de la peticion
 * @param {string[]} camposObligatorios - lista de nombres de campos requeridos
 * @returns {string[]} - lista de campos faltantes (vacia si esta todo OK)
 */
function validarCamposObligatorios(datos, camposObligatorios) {
    const faltantes = [];
    camposObligatorios.forEach((campo) => {
        if (datos[campo] === undefined || datos[campo] === null || datos[campo] === '') {
            faltantes.push(campo);
        }
    });
    return faltantes;
}

/** Valida formato basico de un correo electronico */
function esEmailValido(email) {
    const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patron.test(email);
}

/** Valida que una fecha en formato string (YYYY-MM-DD) sea una fecha real */
function esFechaValida(fecha) {
    if (!fecha) return false;
    const fechaObjeto = new Date(fecha);
    return !isNaN(fechaObjeto.getTime());
}

/** Suma una cantidad de dias a una fecha y devuelve una nueva fecha (objeto Date) */
function sumarDias(fecha, dias) {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + Number(dias));
    return nuevaFecha;
}

/** Da formato YYYY-MM-DD a un objeto Date, para guardarlo de forma legible */
function formatearFecha(fecha) {
    const d = new Date(fecha);
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

module.exports = {
    validarCamposObligatorios,
    esEmailValido,
    esFechaValida,
    sumarDias,
    formatearFecha
};
