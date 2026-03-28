import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Oficina } from './entidades/oficina.entidad';
import { CrearOficinaDto } from './dto/crear-oficina.dto';
import { ActualizarOficinaDto } from './dto/actualizar-oficina.dto';

@Injectable()
export class OficinasService {
  constructor(
    @InjectRepository(Oficina)
    private readonly oficinasRepo: Repository<Oficina>,
  ) {}

  async crear(dto: CrearOficinaDto): Promise<Oficina> {
    const oficina = this.oficinasRepo.create(dto);
    return this.oficinasRepo.save(oficina);
  }

  async buscarTodos(): Promise<Oficina[]> {
    return this.oficinasRepo.find({ relations: ['espacios'] });
  }

  async buscarActivas(): Promise<Oficina[]> {
    return this.oficinasRepo.find({
      where: { activo: true },
      relations: ['espacios'],
    });
  }

  async buscarPorId(id: number): Promise<Oficina> {
    const oficina = await this.oficinasRepo.findOne({
      where: { id },
      relations: ['espacios'],
    });
    if (!oficina) throw new NotFoundException(`Oficina #${id} no encontrada`);
    return oficina;
  }

  async actualizar(id: number, dto: ActualizarOficinaDto): Promise<Oficina> {
    const oficina = await this.buscarPorId(id);
    Object.assign(oficina, dto);
    return this.oficinasRepo.save(oficina);
  }

  /** Soft-delete: marca como inactiva en lugar de borrar físicamente */
  async eliminar(id: number): Promise<void> {
    const oficina = await this.buscarPorId(id);
    oficina.activo = false;
    await this.oficinasRepo.save(oficina);
  }
}
