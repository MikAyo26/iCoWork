import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Oficina } from '../../oficinas/entidades/oficina.entidad';

export type TipoEspacio = 'puesto' | 'sala_juntas' | 'cabina' | 'otro';

/**
 * Entidad que representa la tabla `espacios`.
 * Un espacio es una unidad reservable dentro de una oficina (puesto, sala, cabina, etc.).
 */
@Entity('espacios')
export class Espacio {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'oficina_id', type: 'int', unsigned: true })
  oficinaId: number;

  @ManyToOne(() => Oficina, (oficina) => oficina.espacios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'oficina_id' })
  oficina: Oficina;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'enum', enum: ['puesto', 'sala_juntas', 'cabina', 'otro'], default: 'puesto' })
  tipo: TipoEspacio;

  @Column({ type: 'int', unsigned: true, default: 1 })
  capacidad: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;
}
