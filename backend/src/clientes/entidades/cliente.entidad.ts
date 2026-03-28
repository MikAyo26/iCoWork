import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';

/**
 * Entidad que representa la tabla `clientes` en la base de datos.
 * Un cliente es una empresa o autónomo que contrata el servicio iCoWork.
 */
@Entity('clientes')
export class Cliente {
  /** Identificador único autoincremental */
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

  /** Nombre de la empresa o del autónomo */
    @Column({ type: 'varchar', length: 150 })
    nombre: string;

  /** Correo electrónico único de contacto */
    @Column({ type: 'varchar', length: 150, unique: true })
    correo: string;

  /** Teléfono de contacto. Opcional */
    @Column({ type: 'varchar', length: 20, nullable: true })
    telefono: string | null;

  /** Fecha y hora de creación del registro, generada automáticamente */
    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;

  /** Usuarios pertenecientes a este cliente */
    @OneToMany(() => Usuario, (usuario) => usuario.cliente)
    usuarios: Usuario[];
}