-- ============================================================
--  iCoWork (iCW) — Esquema de Base de Datos
--  Backend: NestJS + MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS icowork
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE icowork;

-- 1. CLIENTES
CREATE TABLE clientes (
    id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(150)  NOT NULL,
    correo          VARCHAR(150)  NOT NULL UNIQUE,
    telefono        VARCHAR(20),
    creado_en       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- 2. USUARIOS
CREATE TABLE usuarios (
    id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    cliente_id      INT UNSIGNED,
    nombre          VARCHAR(100)  NOT NULL,
    correo          VARCHAR(150)  NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255)  NOT NULL,
    departamento    VARCHAR(100),
    rol             ENUM('superadmin','admin','empleado') NOT NULL DEFAULT 'empleado',
    activo          TINYINT(1)    NOT NULL DEFAULT 1,
    creado_en       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_usuarios_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- 3. OFICINAS
CREATE TABLE oficinas (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(150)    NOT NULL,
    direccion       VARCHAR(255)    NOT NULL,
    ciudad          VARCHAR(100)    NOT NULL,
    pais            VARCHAR(100)    NOT NULL DEFAULT 'España',
    total_puestos   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    activo          TINYINT(1)      NOT NULL DEFAULT 1,
    creado_en       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- 4. ESPACIOS
CREATE TABLE espacios (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    oficina_id      INT UNSIGNED    NOT NULL,
    nombre          VARCHAR(100)    NOT NULL,
    tipo            ENUM('puesto','sala_juntas','cabina','otro') NOT NULL DEFAULT 'puesto',
    capacidad       TINYINT UNSIGNED NOT NULL DEFAULT 1,
    descripcion     TEXT,
    activo          TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT fk_espacios_oficina
    FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. RESERVAS
CREATE TABLE reservas (
    id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    usuario_id        INT UNSIGNED  NOT NULL,
    espacio_id        INT UNSIGNED  NOT NULL,
    inicio            DATETIME      NOT NULL,
    fin               DATETIME      NOT NULL,
    estado            ENUM('pendiente','confirmada','cancelada') NOT NULL DEFAULT 'confirmada',
    tipo_recurrencia  ENUM('ninguna','diaria','semanal','mensual') NOT NULL DEFAULT 'ninguna',
    fin_recurrencia   DATE,
    reserva_padre_id  INT UNSIGNED,
    creado_en         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_reservas_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reservas_espacio
    FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reservas_padre
    FOREIGN KEY (reserva_padre_id) REFERENCES reservas(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_fechas CHECK (fin > inicio)
);

-- 6. LISTA DE ESPERA
CREATE TABLE lista_espera (
    id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    usuario_id      INT UNSIGNED  NOT NULL,
    espacio_id      INT UNSIGNED  NOT NULL,
    fecha_deseada   DATE          NOT NULL,
    notificado_en   TIMESTAMP,
    creado_en       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_lista_espera (usuario_id, espacio_id, fecha_deseada),
    CONSTRAINT fk_espera_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_espera_espacio
    FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. NOTIFICACIONES
CREATE TABLE notificaciones (
    id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    usuario_id      INT UNSIGNED  NOT NULL,
    tipo            ENUM('reserva_confirmada','reserva_cancelada',
                        'espera_disponible','recibo_pago','otro') NOT NULL,
    titulo          VARCHAR(150)  NOT NULL,
    cuerpo          TEXT,
    leida           TINYINT(1)    NOT NULL DEFAULT 0,
    enviado_en      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 8. PLANES
CREATE TABLE planes (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(100)    NOT NULL,
    precio_mensual  DECIMAL(8,2)    NOT NULL,
    max_usuarios    SMALLINT UNSIGNED,
    descripcion     TEXT,
    activo          TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
);

-- 9. SUSCRIPCIONES
CREATE TABLE suscripciones (
    id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    cliente_id      INT UNSIGNED  NOT NULL,
    plan_id         INT UNSIGNED  NOT NULL,
    fecha_inicio    DATE          NOT NULL,
    fecha_fin       DATE,
    estado          ENUM('activa','cancelada','expirada') NOT NULL DEFAULT 'activa',
    creado_en       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_suscripcion_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_suscripcion_plan
    FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 10. PAGOS
CREATE TABLE pagos (
    id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    suscripcion_id      INT UNSIGNED,
    reserva_id          INT UNSIGNED,
    usuario_id          INT UNSIGNED  NOT NULL,
    importe             DECIMAL(8,2)  NOT NULL,
    moneda              CHAR(3)       NOT NULL DEFAULT 'EUR',
    estado              ENUM('pendiente','completado','fallido','reembolsado') NOT NULL DEFAULT 'pendiente',
    metodo              VARCHAR(50),
    referencia_externa  VARCHAR(255),
    pagado_en           TIMESTAMP,
    creado_en           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_pagos_suscripcion
    FOREIGN KEY (suscripcion_id) REFERENCES suscripciones(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_pagos_reserva
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_pagos_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ÍNDICES
CREATE INDEX idx_reservas_espacio_fechas  ON reservas(espacio_id, inicio, fin);
CREATE INDEX idx_reservas_usuario         ON reservas(usuario_id);
CREATE INDEX idx_lista_espera_espacio     ON lista_espera(espacio_id, fecha_deseada);
CREATE INDEX idx_notificaciones_usuario   ON notificaciones(usuario_id, leida);
CREATE INDEX idx_pagos_estado             ON pagos(estado);