/**
 * =====================================================================
 *  models/ClienteModel.js
 * =====================================================================
 * Modelo del MODULO 1: Administracion de datos del cliente.
 * Estructura de cada cliente:
 *   id, nombre, apellido, numeroDocumento, tipoDocumento,
 *   nacionalidad, email, telefono, fechaNacimiento
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class ClienteModel extends BaseModel {

    constructor() {
        super('clientes'); // clave usada dentro del localStorage
    }

    /** Busca clientes cuyo nombre contenga el texto indicado (aproximacion, sin importar mayusculas) */
    buscarPorNombreAproximado(textoBuscado) {
        const clientes = this.obtenerTodos();
        const texto = textoBuscado.toLowerCase();
        return clientes.filter((c) => c.nombre.toLowerCase().includes(texto));
    }

    /** Busca clientes cuyo apellido contenga el texto indicado (aproximacion) */
    buscarPorApellidoAproximado(textoBuscado) {
        const clientes = this.obtenerTodos();
        const texto = textoBuscado.toLowerCase();
        return clientes.filter((c) => c.apellido.toLowerCase().includes(texto));
    }

    /** Busca clientes cuyo cumpleanios (dia y mes) coincide con la fecha indicada (YYYY-MM-DD) */
    buscarPorCumpleanios(fechaReferencia) {
        const clientes = this.obtenerTodos();
        const referencia = new Date(fechaReferencia);
        const diaRef = referencia.getDate();
        const mesRef = referencia.getMonth();

        return clientes.filter((c) => {
            const nacimiento = new Date(c.fechaNacimiento);
            return nacimiento.getDate() === diaRef && nacimiento.getMonth() === mesRef;
        });
    }
}

module.exports = new ClienteModel();
