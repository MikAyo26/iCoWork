-- ============================================================
--  iCoWork (iCW) — Datos de prueba
-- ============================================================

USE icowork;

-- 1. CLIENTES
INSERT INTO clientes (nombre, correo, telefono) VALUES
    ('Tecnologías Atlántico S.L.',   'contacto@tecatlantico.es',   '+34 922 101 001'),
    ('Innovacanarias S.A.',          'info@innovacanarias.com',    '+34 922 202 002'),
    ('DataSur Consulting',           'hola@datasur.io',            '+34 922 303 003'),
    ('Ángel Luis Litago Falces',     'alitago@alitago.com',        '+34 922 303 004');

-- 2. USUARIOS
INSERT INTO usuarios (cliente_id, nombre, correo, contrasena_hash, departamento, rol) VALUES
    (NULL, 'Admin iCoWork',          'admin@icowork.com',                '$2b$10$...hashSuperAdmin', NULL,         'superadmin'),
    (1, 'Laura Hernández Díaz',      'laura.hernandez@tecatlantico.es',  '$2b$10$...hash01',         'Dirección',  'admin'),
    (2, 'Carlos Martín Suárez',      'carlos.martin@innovacanarias.com', '$2b$10$...hash02',         'Dirección',  'admin'),
    (3, 'Marta Rodríguez Pérez',     'marta.rodriguez@datasur.io',       '$2b$10$...hash03',         'Dirección',  'admin'),
    (1, 'Pedro González Alonso',     'pedro.gonzalez@tecatlantico.es',   '$2b$10$...hash04',         'Desarrollo', 'empleado'),
    (1, 'Sofía Cabrera Méndez',      'sofia.cabrera@tecatlantico.es',    '$2b$10$...hash05',         'Diseño',     'empleado'),
    (1, 'Javier Torres Ruiz',        'javier.torres@tecatlantico.es',    '$2b$10$...hash06',         'Marketing',  'empleado'),
    (2, 'Ana Delgado Vega',          'ana.delgado@innovacanarias.com',   '$2b$10$...hash07',         'Desarrollo', 'empleado'),
    (2, 'Roberto Sánchez León',      'roberto.sanchez@innovacanarias.com','$2b$10$...hash08',        'QA',         'empleado'),
    (2, 'Elena Morales Castro',      'elena.morales@innovacanarias.com', '$2b$10$...hash09',         'Ventas',     'empleado'),
    (3, 'Diego Flores Navarro',      'diego.flores@datasur.io',          '$2b$10$...hash10',         'Data',       'empleado'),
    (3, 'Isabel Ramírez Ortega',     'isabel.ramirez@datasur.io',        '$2b$10$...hash11',         'Data',       'empleado'),
    (4, 'Ángel Luis Litago Falces',  'alitago@alitago.com',              '$2b$10$...hash12',         NULL,         'empleado');

-- 3. OFICINAS
INSERT INTO oficinas (nombre, direccion, ciudad, pais, total_puestos) VALUES
    ('Rambla Añaza', 'Rambla Añaza 1', 'Santa Cruz de Tenerife', 'España', 19);

-- 4. ESPACIOS
INSERT INTO espacios (oficina_id, nombre, tipo, capacidad, descripcion) VALUES
    (1, 'Sala Teide', 'sala_juntas', 8, 'Sala de reuniones con proyector y pizarra blanca'),
    (1, 'Sala Anaga', 'sala_juntas', 6, 'Sala de reuniones con TV 65" y videoconferencia'),
    (1, 'Puesto A-01', 'puesto', 1, NULL), (1, 'Puesto A-02', 'puesto', 1, NULL),
    (1, 'Puesto A-03', 'puesto', 1, NULL), (1, 'Puesto A-04', 'puesto', 1, NULL),
    (1, 'Puesto A-05', 'puesto', 1, NULL), (1, 'Puesto A-06', 'puesto', 1, NULL),
    (1, 'Puesto A-07', 'puesto', 1, NULL), (1, 'Puesto A-08', 'puesto', 1, NULL),
    (1, 'Puesto A-09', 'puesto', 1, NULL), (1, 'Puesto A-10', 'puesto', 1, NULL),
    (1, 'Puesto B-01', 'puesto', 1, NULL), (1, 'Puesto B-02', 'puesto', 1, NULL),
    (1, 'Puesto B-03', 'puesto', 1, NULL), (1, 'Puesto B-04', 'puesto', 1, NULL),
    (1, 'Puesto B-05', 'puesto', 1, NULL), (1, 'Puesto B-06', 'puesto', 1, NULL),
    (1, 'Puesto B-07', 'puesto', 1, NULL);

-- 5. RESERVAS
INSERT INTO reservas (usuario_id, espacio_id, inicio, fin, estado, tipo_recurrencia) VALUES
    (5,  3,  '2025-06-02 08:00:00', '2025-06-02 14:00:00', 'confirmada', 'ninguna'),
    (6,  4,  '2025-06-02 09:00:00', '2025-06-02 13:00:00', 'confirmada', 'ninguna'),
    (7,  5,  '2025-06-03 10:00:00', '2025-06-03 12:00:00', 'confirmada', 'ninguna'),
    (8,  1,  '2025-06-03 11:00:00', '2025-06-03 13:00:00', 'confirmada', 'ninguna'),
    (9,  2,  '2025-06-04 09:00:00', '2025-06-04 11:00:00', 'confirmada', 'ninguna'),
    (10, 6,  '2025-06-04 08:00:00', '2025-06-04 17:00:00', 'confirmada', 'ninguna'),
    (11, 7,  '2025-06-05 08:00:00', '2025-06-05 14:00:00', 'confirmada', 'ninguna'),
    (12, 8,  '2025-06-05 09:00:00', '2025-06-05 15:00:00', 'confirmada', 'ninguna'),
    (5,  9,  '2025-06-09 08:00:00', '2025-06-09 14:00:00', 'confirmada', 'semanal'),
    (6,  10, '2025-06-09 09:00:00', '2025-06-09 13:00:00', 'confirmada', 'semanal'),
    (7,  11, '2025-06-10 10:00:00', '2025-06-10 12:00:00', 'cancelada',  'ninguna');

INSERT INTO reservas (usuario_id, espacio_id, inicio, fin, estado, tipo_recurrencia, reserva_padre_id) VALUES
    (5, 9, '2025-06-16 08:00:00', '2025-06-16 14:00:00', 'confirmada', 'semanal', 9),
    (5, 9, '2025-06-23 08:00:00', '2025-06-23 14:00:00', 'confirmada', 'semanal', 9);

-- 6. LISTA DE ESPERA
INSERT INTO lista_espera (usuario_id, espacio_id, fecha_deseada) VALUES
    (8,  1, '2025-06-03'),
    (10, 2, '2025-06-04'),
    (11, 3, '2025-06-02'),
    (12, 1, '2025-06-10');

-- 7. NOTIFICACIONES
INSERT INTO notificaciones (usuario_id, tipo, titulo, cuerpo, leida) VALUES
    (5,  'reserva_confirmada', 'Reserva confirmada',        'Tu reserva del Puesto A-01 el 02/06 ha sido confirmada.',          1),
    (6,  'reserva_confirmada', 'Reserva confirmada',        'Tu reserva del Puesto A-02 el 02/06 ha sido confirmada.',          1),
    (7,  'reserva_cancelada',  'Reserva cancelada',         'Tu reserva del Puesto A-03 el 10/06 ha sido cancelada.',           0),
    (8,  'espera_disponible',  'Espacio disponible',        'El espacio Sala Teide ya está disponible para el 03/06.',          0),
    (9,  'reserva_confirmada', 'Reserva confirmada',        'Tu reserva de la Sala Anaga el 04/06 ha sido confirmada.',         1),
    (10, 'espera_disponible',  'Espacio disponible',        'El espacio Sala Anaga ya está disponible para el 04/06.',          0),
    (5,  'recibo_pago',        'Pago procesado',            'Se ha procesado tu pago de 49,00 € correctamente.',               1),
    (2,  'reserva_confirmada', 'Nueva reserva de empleado', 'Pedro González ha reservado el Puesto A-01 el 02/06.',             0);

-- 8. PLANES
INSERT INTO planes (nombre, precio_mensual, max_usuarios, descripcion) VALUES
    ('Individual',  9.90,   1,    'Para autónomos. 1 usuario. Acceso a puestos de trabajo.'),
    ('Básico',      29.00,  5,    'Hasta 5 usuarios. Acceso a puestos de trabajo.'),
    ('Profesional', 79.00,  20,   'Hasta 20 usuarios. Puestos + salas de juntas.'),
    ('Empresarial', 199.00, NULL, 'Usuarios ilimitados. Acceso completo + Dashboard avanzado.');

-- 9. SUSCRIPCIONES
INSERT INTO suscripciones (cliente_id, plan_id, fecha_inicio, fecha_fin, estado) VALUES
    (1, 2, '2025-01-01', '2025-12-31', 'activa'),
    (2, 3, '2025-03-01', '2026-02-28', 'activa'),
    (3, 1, '2025-04-01', '2025-09-30', 'activa'),
    (4, 1, '2025-06-01', '2026-05-31', 'activa');

-- 10. PAGOS
INSERT INTO pagos (suscripcion_id, reserva_id, usuario_id, importe, moneda, estado, metodo, referencia_externa, pagado_en) VALUES
    (1, NULL, 2,  79.00,  'EUR', 'completado', 'tarjeta',       'pi_3NxABC001stripe', '2025-01-01 10:00:00'),
    (1, NULL, 2,  79.00,  'EUR', 'completado', 'tarjeta',       'pi_3NxABC002stripe', '2025-02-01 10:00:00'),
    (2, NULL, 3,  199.00, 'EUR', 'completado', 'transferencia', 'TRF-20250301-0001',  '2025-03-01 09:00:00'),
    (2, NULL, 3,  199.00, 'EUR', 'completado', 'transferencia', 'TRF-20250401-0002',  '2025-04-01 09:00:00'),
    (3, NULL, 4,  29.00,  'EUR', 'completado', 'tarjeta',       'pi_3NxABC003stripe', '2025-04-01 11:00:00'),
    (4, NULL, 13, 9.90,   'EUR', 'completado', 'tarjeta',       'pi_3NxABC007stripe', '2025-06-01 10:00:00'),
    (NULL, 4, 8,  15.00,  'EUR', 'completado', 'tarjeta',       'pi_3NxABC005stripe', '2025-06-03 08:30:00'),
    (NULL, 5, 9,  20.00,  'EUR', 'completado', 'tarjeta',       'pi_3NxABC006stripe', '2025-06-04 08:45:00');