import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entidades/cliente.entidad';

/** Tipo union para los roles disponibles en el sistema */
export type Rol = 'superadmin' | 'admin' | 'empleado';

/**
 * Entidad que representa la tabla `usuarios` en la base de datos.
 * Almacena empleados, administradores de cliente y superadmins internos de iCoWork.
 */
@Entity('usuarios')
export class Usuario {
  /** Identificador único autoincremental */
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  /** FK hacia la tabla `clientes`. NULL si el usuario es superadmin interno */
  @Column({ name: 'cliente_id', type: 'int', unsigned: true, nullable: true })
  clienteId: number | null;

  /** Relación con la entidad Cliente */
  @ManyToOne(() => Cliente, (cliente) => cliente.usuarios, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  /** Nombre completo del usuario */
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  /** Correo electrónico único, usado como identificador de login */
  @Column({ type: 'varchar', length: 150, unique: true })
  correo: string;

  /**
   * Hash bcrypt de la contraseña.
   * `select: false` evita que se devuelva en consultas por defecto.
   */
  @Column({ name: 'contrasena_hash', type: 'varchar', length: 255, select: false })
  contrasenaHash: string;

  /** Departamento al que pertenece el usuario dentro de su empresa. Opcional */
  @Column({ type: 'varchar', length: 100, nullable: true })
  departamento: string | null;

  /** Rol del usuario en el sistema. Determina sus permisos de acceso */
  @Column({ type: 'enum', enum: ['superadmin', 'admin', 'empleado'], default: 'empleado' })
  rol: Rol;

  /** Indica si la cuenta está activa. Los usuarios inactivos no pueden autenticarse */
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  /** Fecha y hora de creación del registro, generada automáticamente */
  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}