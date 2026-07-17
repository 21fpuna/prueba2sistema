-- =====================================================================
--  consultas-apoyo.sql
-- =====================================================================
--  Material de apoyo para la revisión del Sistema de Fidelización.
--
--  NOTA IMPORTANTE: el proyecto persiste los datos en un archivo
--  (data/localStorage.json) imitando la API de localStorage, tal como
--  pide el enunciado. Este script muestra el EQUIVALENTE en SQL de esa
--  estructura de datos y las consultas SELECT que respaldan cada
--  petición GET del sistema, para usarlas como apoyo el día de la
--  revisión (por ejemplo, sobre SQLite / MySQL / PostgreSQL si se
--  migra la persistencia).
-- =====================================================================

-- ------------------------------------------------------------------
-- 1. CREACIÓN DE LAS ENTIDADES (equivalente a los Modelos del sistema)
-- ------------------------------------------------------------------

CREATE TABLE clientes (
    id               INTEGER PRIMARY KEY AUTO_INCREMENT,
    nombre           VARCHAR(100) NOT NULL,
    apellido         VARCHAR(100) NOT NULL,
    numero_documento VARCHAR(30)  NOT NULL,
    tipo_documento   VARCHAR(20)  NOT NULL,   -- CI, RUC, Pasaporte
    nacionalidad     VARCHAR(50)  NOT NULL,
    email            VARCHAR(150) NOT NULL,
    telefono         VARCHAR(30)  NOT NULL,
    fecha_nacimiento DATE         NOT NULL
);

CREATE TABLE conceptos_uso (
    id                INTEGER PRIMARY KEY AUTO_INCREMENT,
    descripcion       VARCHAR(200) NOT NULL,   -- vale de premio, descuento, etc.
    puntos_requeridos INTEGER      NOT NULL
);

CREATE TABLE reglas_asignacion (
    id                 INTEGER PRIMARY KEY AUTO_INCREMENT,
    limite_inferior    DECIMAL(15,2) NOT NULL,
    limite_superior    DECIMAL(15,2) NULL,      -- NULL = sin tope
    monto_equivalencia DECIMAL(15,2) NOT NULL   -- Gs. necesarios para 1 punto
);

CREATE TABLE parametros_vencimiento (
    id                   INTEGER PRIMARY KEY AUTO_INCREMENT,
    fecha_inicio_validez DATE    NOT NULL,
    fecha_fin_validez    DATE    NOT NULL,
    dias_duracion        INTEGER NOT NULL
);

CREATE TABLE bolsas_puntos (
    id                INTEGER PRIMARY KEY AUTO_INCREMENT,
    cliente_id        INTEGER       NOT NULL,
    fecha_asignacion  DATE          NOT NULL,
    fecha_caducidad   DATE          NOT NULL,
    puntaje_asignado  INTEGER       NOT NULL,
    puntaje_utilizado INTEGER       NOT NULL DEFAULT 0,
    saldo             INTEGER       NOT NULL,
    monto_operacion   DECIMAL(15,2) NOT NULL,
    estado            VARCHAR(10)   NOT NULL DEFAULT 'vigente',  -- vigente | vencido
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE uso_puntos_cabecera (
    id                 INTEGER PRIMARY KEY AUTO_INCREMENT,
    cliente_id         INTEGER NOT NULL,
    puntaje_utilizado  INTEGER NOT NULL,
    fecha              DATE    NOT NULL,
    concepto_id        INTEGER NOT NULL,
    FOREIGN KEY (cliente_id)  REFERENCES clientes(id),
    FOREIGN KEY (concepto_id) REFERENCES conceptos_uso(id)
);

CREATE TABLE uso_puntos_detalle (
    id                INTEGER PRIMARY KEY AUTO_INCREMENT,
    cabecera_id       INTEGER NOT NULL,
    puntaje_utilizado INTEGER NOT NULL,
    bolsa_id          INTEGER NOT NULL,
    FOREIGN KEY (cabecera_id) REFERENCES uso_puntos_cabecera(id),
    FOREIGN KEY (bolsa_id)    REFERENCES bolsas_puntos(id)
);

-- ------------------------------------------------------------------
-- 2. CONSULTAS DE APOYO A LAS PETICIONES GET
-- ------------------------------------------------------------------

-- GET /api/clientes  → todos los clientes
SELECT * FROM clientes;

-- GET /api/clientes/:id  → un cliente puntual
SELECT * FROM clientes WHERE id = 1;

-- GET /api/conceptos
SELECT * FROM conceptos_uso;

-- GET /api/reglas
SELECT * FROM reglas_asignacion ORDER BY limite_inferior;

-- Regla aplicable a un monto dado (lógica de ServicioController)
SELECT *
FROM reglas_asignacion
WHERE 350000 >= limite_inferior
  AND (limite_superior IS NULL OR 350000 <= limite_superior);

-- GET /api/vencimientos
SELECT * FROM parametros_vencimiento;

-- Parámetro de vencimiento vigente hoy (VencimientoModel.buscarVigente)
SELECT *
FROM parametros_vencimiento
WHERE CURRENT_DATE BETWEEN fecha_inicio_validez AND fecha_fin_validez;

-- GET /api/bolsas-puntos
SELECT b.*, c.nombre, c.apellido
FROM bolsas_puntos b
JOIN clientes c ON c.id = b.cliente_id;

-- Bolsas vigentes de un cliente en orden FIFO (BolsaPuntosModel.obtenerBolsasFIFO)
SELECT *
FROM bolsas_puntos
WHERE cliente_id = 1
  AND estado = 'vigente'
  AND saldo > 0
ORDER BY fecha_asignacion ASC;

-- GET /api/uso-puntos  → cabeceras con datos del cliente y concepto
SELECT u.id, c.nombre, c.apellido, cu.descripcion AS concepto,
       u.puntaje_utilizado, u.fecha
FROM uso_puntos_cabecera u
JOIN clientes c       ON c.id  = u.cliente_id
JOIN conceptos_uso cu ON cu.id = u.concepto_id;

-- GET /api/uso-puntos/:id  → cabecera + detalle FIFO
SELECT d.id, d.cabecera_id, d.bolsa_id, d.puntaje_utilizado
FROM uso_puntos_detalle d
WHERE d.cabecera_id = 1;

-- GET /api/consultas/uso-puntos?clienteId=&conceptoId=&fecha=
SELECT *
FROM uso_puntos_cabecera
WHERE (cliente_id  = 1            OR 1 IS NULL)
  AND (concepto_id = 1            OR 1 IS NULL)
  AND (fecha       = '2026-07-13' OR '2026-07-13' IS NULL);

-- GET /api/consultas/bolsa-puntos?clienteId=&puntosMin=&puntosMax=
SELECT *
FROM bolsas_puntos
WHERE cliente_id = 1
  AND saldo BETWEEN 0 AND 100000;

-- GET /api/consultas/clientes-por-vencer?dias=30
SELECT c.id, c.nombre, c.apellido, c.email,
       b.id AS bolsa_id, b.saldo, b.fecha_caducidad
FROM bolsas_puntos b
JOIN clientes c ON c.id = b.cliente_id
WHERE b.estado = 'vigente'
  AND b.saldo > 0
  AND b.fecha_caducidad BETWEEN CURRENT_DATE
                            AND DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY);

-- GET /api/consultas/clientes?nombre=&apellido=&cumpleanios=
SELECT *
FROM clientes
WHERE LOWER(nombre)   LIKE LOWER('%ju%')
  AND LOWER(apellido) LIKE LOWER('%%');

-- Clientes que cumplen años en una fecha dada (día y mes)
SELECT *
FROM clientes
WHERE MONTH(fecha_nacimiento) = MONTH('1990-05-15')
  AND DAY(fecha_nacimiento)   = DAY('1990-05-15');

-- Saldo total de puntos por cliente (verificación general del estado)
SELECT c.id, c.nombre, c.apellido,
       COALESCE(SUM(CASE WHEN b.estado = 'vigente' THEN b.saldo END), 0) AS puntos_disponibles,
       COALESCE(SUM(b.puntaje_utilizado), 0)                             AS puntos_utilizados
FROM clientes c
LEFT JOIN bolsas_puntos b ON b.cliente_id = c.id
GROUP BY c.id, c.nombre, c.apellido;

-- Job de vencimientos (Módulo 9): bolsas que deben marcarse como vencidas
SELECT * FROM bolsas_puntos
WHERE estado = 'vigente' AND fecha_caducidad < CURRENT_DATE;

UPDATE bolsas_puntos
SET estado = 'vencido', saldo = 0
WHERE estado = 'vigente' AND fecha_caducidad < CURRENT_DATE;

-- =====================================================================
--  MODULOS ADICIONALES DEL SEGUNDO FINAL
-- =====================================================================

-- ------------------------------------------------------------------
-- 3. ENTIDADES NUEVAS
-- ------------------------------------------------------------------

CREATE TABLE niveles (
    id             INTEGER PRIMARY KEY AUTO_INCREMENT,
    nombre         VARCHAR(50)  NOT NULL,     -- Bronce, Plata, Oro, Platino
    puntos_minimos INTEGER      NOT NULL,     -- puntos acumulados para alcanzarlo
    beneficios     VARCHAR(300) NOT NULL
);

CREATE TABLE productos (
    id                INTEGER PRIMARY KEY AUTO_INCREMENT,
    nombre            VARCHAR(100)  NOT NULL,
    descripcion       VARCHAR(300)  NOT NULL,
    precio            DECIMAL(15,2) NOT NULL,  -- valor monetario (Gs.)
    puntos_necesarios INTEGER       NOT NULL   -- equivalencia puntos/valor
);

CREATE TABLE canjes (
    id                INTEGER PRIMARY KEY AUTO_INCREMENT,
    cliente_id        INTEGER NOT NULL,
    producto_id       INTEGER NOT NULL,
    cantidad          INTEGER NOT NULL DEFAULT 1,
    puntos_utilizados INTEGER NOT NULL,
    fecha             DATE    NOT NULL,
    FOREIGN KEY (cliente_id)  REFERENCES clientes(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE promociones (
    id            INTEGER PRIMARY KEY AUTO_INCREMENT,
    descripcion   VARCHAR(200)  NOT NULL,
    fecha_inicio  DATE          NOT NULL,
    fecha_fin     DATE          NOT NULL,
    multiplicador DECIMAL(5,2)  NOT NULL,      -- ej: 2 = puntos dobles
    producto_id   INTEGER       NULL,          -- NULL = todas las operaciones
    activa        BOOLEAN       NOT NULL DEFAULT TRUE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE desafios (
    id                INTEGER PRIMARY KEY AUTO_INCREMENT,
    nombre            VARCHAR(100) NOT NULL,
    descripcion       VARCHAR(300) NOT NULL,
    meta_puntos       INTEGER      NOT NULL,   -- puntos acumulados a alcanzar
    puntos_recompensa INTEGER      NOT NULL,   -- bonificacion al reclamarlo
    fecha_inicio      DATE         NOT NULL,
    fecha_fin         DATE         NOT NULL
);

CREATE TABLE desafios_completados (
    id         INTEGER PRIMARY KEY AUTO_INCREMENT,
    cliente_id INTEGER NOT NULL,
    desafio_id INTEGER NOT NULL,
    fecha      DATE    NOT NULL,
    UNIQUE (cliente_id, desafio_id),           -- cada desafio se reclama una sola vez
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (desafio_id) REFERENCES desafios(id)
);

CREATE TABLE encuestas (
    id         INTEGER PRIMARY KEY AUTO_INCREMENT,
    cliente_id INTEGER      NOT NULL,
    puntuacion INTEGER      NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario VARCHAR(500),
    fecha      DATE         NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- ------------------------------------------------------------------
-- 4. CONSULTAS DE APOYO DE LOS MODULOS NUEVOS
-- ------------------------------------------------------------------

-- GET /api/niveles
SELECT * FROM niveles ORDER BY puntos_minimos;

-- GET /api/niveles/cliente/:id  → nivel actual segun puntos acumulados
SELECT n.*
FROM niveles n
WHERE n.puntos_minimos <= (
    SELECT COALESCE(SUM(b.puntaje_asignado), 0)
    FROM bolsas_puntos b WHERE b.cliente_id = 1
)
ORDER BY n.puntos_minimos DESC
LIMIT 1;

-- GET /api/productos
SELECT * FROM productos;

-- GET /api/canjes (con datos del cliente y el producto)
SELECT ca.id, c.nombre, c.apellido, p.nombre AS producto,
       ca.cantidad, ca.puntos_utilizados, ca.fecha
FROM canjes ca
JOIN clientes c  ON c.id = ca.cliente_id
JOIN productos p ON p.id = ca.producto_id;

-- GET /api/promociones/vigentes  → promociones activas hoy
SELECT * FROM promociones
WHERE activa = TRUE
  AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin;

-- GET /api/gamificacion/ranking  → top 10 por puntos acumulados
SELECT c.id, c.nombre, c.apellido,
       COALESCE(SUM(b.puntaje_asignado), 0) AS puntos_acumulados
FROM clientes c
LEFT JOIN bolsas_puntos b ON b.cliente_id = c.id
GROUP BY c.id, c.nombre, c.apellido
ORDER BY puntos_acumulados DESC
LIMIT 10;

-- GET /api/gamificacion/desafios/:clienteId  → progreso en desafios
SELECT d.*,
       (SELECT COALESCE(SUM(b.puntaje_asignado), 0)
        FROM bolsas_puntos b WHERE b.cliente_id = 1) AS puntos_acumulados,
       EXISTS (SELECT 1 FROM desafios_completados dc
               WHERE dc.cliente_id = 1 AND dc.desafio_id = d.id) AS reclamado
FROM desafios d;

-- GET /api/encuestas/resumen  → promedio y distribucion
SELECT COUNT(*)              AS total_respuestas,
       ROUND(AVG(puntuacion), 2) AS promedio
FROM encuestas;

SELECT puntuacion, COUNT(*) AS cantidad
FROM encuestas
GROUP BY puntuacion
ORDER BY puntuacion;
