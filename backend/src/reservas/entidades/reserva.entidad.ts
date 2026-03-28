import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';
import { Espacio } from '../../espacios/entidades/espacio.entidad';

export type EstadoReserva = 'confirmada' | 'cancelada' | 'pendiente';
export type TipoRecurrencia = 'ninguna' | 'diaria' | 'semanal' | 'mensual';

/**
 * Entidad que representa la tabla `reservas`.
 * Soporta reservas únicas y recurrentes (padre/hijo).
 */
@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'usuario_id', type: 'int', unsigned: true })
  usuarioId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'espacio_id', type: 'int', unsigned: true })
  espacioId: number;

  @ManyToOne(() => Espacio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'espacio_id' })
  espacio: Espacio;

  @Column({ type: 'timestamp' })
  inicio: Date;

  @Column({ type: 'timestamp' })
  fin: Date;

  @Column({
    type: 'enum',
    enum: ['confirmada', 'cancelada', 'pendiente'],
    default: 'confirmada',
  })
  estado: EstadoReserva;

  @Column({
    name: 'tipo_recurrencia',
    type: 'enum',
    enum: ['ninguna', 'diaria', 'semanal', 'mensual'],
    default: 'ninguna',
  })
  tipoRecurrencia: TipoRecurrencia;

  @Column({ name: 'fin_recurrencia', type: 'date', nullable: true })
  finRecurrencia: Date | null;

  @Column({ name: 'reserva_padre_id', type: 'int', unsigned: true, nullable: true })
  reservaPadreId: number | null;

  @ManyToOne(() => Reserva, (r) => r.hijos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reserva_padre_id' })
  reservaPadre: Reserva;

  @OneToMany(() => Reserva, (r) => r.reservaPadre)
  hijos: Reserva[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
