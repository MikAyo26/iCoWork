import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';

export type TipoNotificacion =
  | 'reserva_confirmada'
  | 'reserva_cancelada'
  | 'espera_disponible'
  | 'recibo_pago';

/**
 * Entidad que representa la tabla `notificaciones`.
 * Almacena alertas y avisos dirigidos a un usuario específico.
 */
@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'usuario_id', type: 'int', unsigned: true })
  usuarioId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({
    type: 'enum',
    enum: ['reserva_confirmada', 'reserva_cancelada', 'espera_disponible', 'recibo_pago'],
  })
  tipo: TipoNotificacion;

  @Column({ type: 'varchar', length: 150 })
  titulo: string;

  @Column({ type: 'text' })
  cuerpo: string;

  @Column({ type: 'boolean', default: false })
  leida: boolean;

  @CreateDateColumn({ name: 'enviado_en' })
  enviadoEn: Date;
}
