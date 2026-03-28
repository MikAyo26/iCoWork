import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entidades/plan.entidad';
import { CrearPlanDto } from './dto/crear-plan.dto';

@Injectable()
export class PlanesService {
  constructor(
    @InjectRepository(Plan)
    private readonly planesRepo: Repository<Plan>,
  ) {}

  async crear(dto: CrearPlanDto): Promise<Plan> {
    const plan = this.planesRepo.create(dto);
    return this.planesRepo.save(plan);
  }

  async buscarTodos(soloActivos = true): Promise<Plan[]> {
    return this.planesRepo.find({
      where: soloActivos ? { activo: true } : {},
      order: { precioMensual: 'ASC' },
    });
  }

  async buscarPorId(id: number): Promise<Plan> {
    const plan = await this.planesRepo.findOneBy({ id });
    if (!plan) throw new NotFoundException(`Plan #${id} no encontrado`);
    return plan;
  }

  async actualizar(id: number, dto: Partial<CrearPlanDto>): Promise<Plan> {
    const plan = await this.buscarPorId(id);
    Object.assign(plan, dto);
    return this.planesRepo.save(plan);
  }

  async desactivar(id: number): Promise<void> {
    const plan = await this.buscarPorId(id);
    plan.activo = false;
    await this.planesRepo.save(plan);
  }
}
