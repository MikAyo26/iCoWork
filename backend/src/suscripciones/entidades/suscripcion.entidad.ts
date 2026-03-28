import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entidades/cliente.entidad';
import { Plan } from '../../planes/entidades/plan.entidad';

export type EstadoSuscripcion = 'activa' | 'cancelada' | 'expirada';

/**
 * Entidad que representa la tabla `suscripciones`.
 * Asocia un cliente con un plan de precios.
 */
@Entity('suscripciones')
export class Suscripcion {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'cliente_id', type: 'int', unsigned: true })
  clienteId: number;

  @ManyToOne(() => Cliente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'plan_id', type: 'int', unsigned: true })
  planId: number;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: Date | null;

  @Column({
    type: 'enum',
    enum: ['activa', 'cancelada', 'expirada'],
    default: 'activa',
  })
  estado: EstadoSuscripcion;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
