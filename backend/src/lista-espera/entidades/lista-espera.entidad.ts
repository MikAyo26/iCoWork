import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';
import { Espacio } from '../../espacios/entidades/espacio.entidad';

/**
 * Entidad que representa la tabla `lista_espera`.
 * Un usuario puede apuntarse a la lista de espera de un espacio para una fecha concreta.
 */
@Entity('lista_espera')
@Unique(['usuarioId', 'espacioId', 'fechaDeseada'])
export class ListaEspera {
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

  @Column({ name: 'fecha_deseada', type: 'date' })
  fechaDeseada: Date;

  @Column({ name: 'notificado_en', type: 'timestamp', nullable: true })
  notificadoEn: Date | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
