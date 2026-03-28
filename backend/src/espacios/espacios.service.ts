import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Espacio } from './entidades/espacio.entidad';
import { CrearEspacioDto } from './dto/crear-espacio.dto';
import { ActualizarEspacioDto } from './dto/actualizar-espacio.dto';

@Injectable()
export class EspaciosService {
  constructor(
    @InjectRepository(Espacio)
    private readonly espaciosRepo: Repository<Espacio>,
  ) {}

  async crear(dto: CrearEspacioDto): Promise<Espacio> {
    const espacio = this.espaciosRepo.create(dto);
    return this.espaciosRepo.save(espacio);
  }

  async buscarTodos(): Promise<Espacio[]> {
    return this.espaciosRepo.find({ relations: ['oficina'] });
  }

  async buscarPorOficina(oficinaId: number): Promise<Espacio[]> {
    return this.espaciosRepo.find({
      where: { oficinaId, activo: true },
      relations: ['oficina'],
    });
  }

  async buscarPorId(id: number): Promise<Espacio> {
    const espacio = await this.espaciosRepo.findOne({
      where: { id },
      relations: ['oficina'],
    });
    if (!espacio) throw new NotFoundException(`Espacio #${id} no encontrado`);
    return espacio;
  }

  async actualizar(id: number, dto: ActualizarEspacioDto): Promise<Espacio> {
    const espacio = await this.buscarPorId(id);
    Object.assign(espacio, dto);
    return this.espaciosRepo.save(espacio);
  }

  async eliminar(id: number): Promise<void> {
    const espacio = await this.buscarPorId(id);
    espacio.activo = false;
    await this.espaciosRepo.save(espacio);
  }

  /**
   * Verifica si un espacio está disponible en el rango horario indicado.
   * Retorna true si está libre, false si hay solapamiento con reservas confirmadas o pendientes.
   */
  async verificarDisponibilidad(
    espacioId: number,
    inicio: Date,
    fin: Date,
    excluirReservaId?: number,
  ): Promise<boolean> {
    const qb = this.espaciosRepo.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'total')
      .from('reservas', 'r')
      .where('r.espacio_id = :espacioId', { espacioId })
      .andWhere("r.estado != 'cancelada'")
      .andWhere('r.inicio < :fin', { fin })
      .andWhere('r.fin > :inicio', { inicio });

    if (excluirReservaId) {
      qb.andWhere('r.id != :excluirReservaId', { excluirReservaId });
    }

    const result = await qb.getRawOne<{ total: string }>();
    return parseInt(result?.total ?? '0', 10) === 0;
  }
}
