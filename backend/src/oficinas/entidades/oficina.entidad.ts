import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Espacio } from '../../espacios/entidades/espacio.entidad';

/**
 * Entidad que representa la tabla `oficinas`.
 * Cada oficina es una ubicación física con un conjunto de espacios.
 */
@Entity('oficinas')
export class Oficina {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 255 })
  direccion: string;

  @Column({ type: 'varchar', length: 100 })
  ciudad: string;

  @Column({ type: 'varchar', length: 100, default: 'España' })
  pais: string;

  @Column({ name: 'total_puestos', type: 'int', unsigned: true, default: 0 })
  totalPuestos: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @OneToMany(() => Espacio, (espacio) => espacio.oficina)
  espacios: Espacio[];
}
