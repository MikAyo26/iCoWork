import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Entidad que representa la tabla `planes`.
 * Define los tipos de suscripción disponibles para los clientes.
 */
@Entity('planes')
export class Plan {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'precio_mensual', type: 'decimal', precision: 10, scale: 2 })
  precioMensual: number;

  @Column({ name: 'max_usuarios', type: 'int', unsigned: true, nullable: true })
  maxUsuarios: number | null;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
