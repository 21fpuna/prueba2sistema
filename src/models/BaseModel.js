/**
 * =====================================================================
 *  models/BaseModel.js
 * =====================================================================
 * Clase base generica de la que heredan todos los modelos del sistema
 * (Cliente, Concepto, Regla, Vencimiento, BolsaPuntos, etc).
 *
 * Contiene las operaciones basicas de un CRUD:
 *   - obtenerTodos()
 *   - buscarPorId(id)
 *   - crear(datos)
 *   - actualizar(id, datos)
 *   - eliminar(id)
 *
 * Toda la persistencia se delega al modulo utils/localStorage.js, que
 * guarda la informacion en disco simulando la API de localStorage.
 * Cada modelo hijo define un "nombreColeccion" (la clave dentro del
 * localStorage) para no mezclar datos entre distintas entidades.
 * =====================================================================
 */

const localStorage = require('../utils/localStorage');

class BaseModel {

    constructor(nombreColeccion) {
        // Ej: "clientes", "conceptos", "reglas", "bolsasPuntos", etc.
        this.nombreColeccion = nombreColeccion;
    }

    /** Devuelve el arreglo completo de registros de esta coleccion */
    obtenerTodos() {
        const datosGuardados = localStorage.getItem(this.nombreColeccion);
        return datosGuardados ? JSON.parse(datosGuardados) : [];
    }

    /** Reemplaza el arreglo completo de registros de esta coleccion */
    guardarTodos(registros) {
        localStorage.setItem(this.nombreColeccion, JSON.stringify(registros));
    }

    /** Calcula el proximo id autoincremental en base a los registros actuales */
    generarNuevoId(registros) {
        if (registros.length === 0) return 1;
        const idsExistentes = registros.map((registro) => registro.id);
        return Math.max(...idsExistentes) + 1;
    }

    /** Busca un unico registro segun su id. Devuelve undefined si no existe */
    buscarPorId(id) {
        const registros = this.obtenerTodos();
        return registros.find((registro) => registro.id === Number(id));
    }

    /** Crea un nuevo registro (le asigna id automatico) y lo persiste */
    crear(datos) {
        const registros = this.obtenerTodos();
        const nuevoRegistro = { id: this.generarNuevoId(registros), ...datos };
        registros.push(nuevoRegistro);
        this.guardarTodos(registros);
        return nuevoRegistro;
    }

    /** Actualiza un registro existente. Devuelve null si el id no existe */
    actualizar(id, datosNuevos) {
        const registros = this.obtenerTodos();
        const indice = registros.findIndex((registro) => registro.id === Number(id));
        if (indice === -1) return null;

        registros[indice] = { ...registros[indice], ...datosNuevos, id: Number(id) };
        this.guardarTodos(registros);
        return registros[indice];
    }

    /** Elimina un registro por id. Devuelve true/false segun si existia */
    eliminar(id) {
        const registros = this.obtenerTodos();
        const registrosRestantes = registros.filter((registro) => registro.id !== Number(id));

        if (registrosRestantes.length === registros.length) {
            return false; // no se elimino nada porque no existia ese id
        }

        this.guardarTodos(registrosRestantes);
        return true;
    }
}

module.exports = BaseModel;
