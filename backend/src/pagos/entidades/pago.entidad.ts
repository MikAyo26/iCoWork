import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';
import { Suscripcion } from '../../suscripciones/entidades/suscripcion.entidad';
import { Reserva } from '../../reservas/entidades/reserva.entidad';

export type EstadoPago = 'pendiente' | 'completado' | 'fallido' | 'reembolsado';

/**
 * Entidad que representa la tabla `pagos`.
 * Registra los pagos asociados a suscripciones o reservas.
 */
@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'suscripcion_id', type: 'int', unsigned: true, nullable: true })
  suscripcionId: number | null;

  @ManyToOne(() => Suscripcion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'suscripcion_id' })
  suscripcion: Suscripcion;

  @Column({ name: 'reserva_id', type: 'int', unsigned: true, nullable: true })
  reservaId: number | null;

  @ManyToOne(() => Reserva, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reserva_id' })
  reserva: Reserva;

  @Column({ name: 'usuario_id', type: 'int', unsigned: true })
  usuarioId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importe: number;

  @Column({ type: 'varchar', length: 10, default: 'EUR' })
  moneda: string;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'completado', 'fallido', 'reembolsado'],
    default: 'pendiente',
  })
  estado: EstadoPago;

  @Column({ type: 'varchar', length: 50, nullable: true })
  metodo: string | null;

  @Column({ name: 'referencia_externa', type: 'varchar', length: 255, nullable: true })
  referenciaExterna: string | null;

  @Column({ name: 'pagado_en', type: 'timestamp', nullable: true })
  pagadoEn: Date | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
