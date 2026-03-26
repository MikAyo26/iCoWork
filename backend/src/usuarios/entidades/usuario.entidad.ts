import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type Rol = 'superadmin' | 'admin' | 'empleado';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'cliente_id', type: 'int', unsigned: true, nullable: true })
  clienteId: number | null;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  correo: string;

  @Column({ name: 'contrasena_hash', type: 'varchar', length: 255, select: false })
  contrasenaHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  departamento: string | null;

  @Column({ type: 'enum', enum: ['superadmin', 'admin', 'empleado'], default: 'empleado' })
  rol: Rol;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}