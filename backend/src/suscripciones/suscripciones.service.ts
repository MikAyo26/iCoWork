import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suscripcion } from './entidades/suscripcion.entidad';
import { CrearSuscripcionDto } from './dto/crear-suscripcion.dto';
import { PlanesService } from '../planes/planes.service';

@Injectable()
export class SuscripcionesService {
  constructor(
    @InjectRepository(Suscripcion)
    private readonly suscripcionesRepo: Repository<Suscripcion>,
    private readonly planesService: PlanesService,
  ) {}

  async suscribir(dto: CrearSuscripcionDto): Promise<Suscripcion> {
    const activa = await this.suscripcionesRepo.findOne({
      where: { clienteId: dto.clienteId, estado: 'activa' },
    });
    if (activa) {
      throw new ConflictException('El cliente ya tiene una suscripción activa');
    }

    // Verificar que el plan existe y está activo
    await this.planesService.buscarPorId(dto.planId);

    const suscripcion = this.suscripcionesRepo.create({
      clienteId: dto.clienteId,
      planId: dto.planId,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : new Date(),
      estado: 'activa',
    });
    return this.suscripcionesRepo.save(suscripcion);
  }

  async cancelar(id: number): Promise<Suscripcion> {
    const suscripcion = await this.suscripcionesRepo.findOneBy({ id });
    if (!suscripcion) throw new NotFoundException(`Suscripción #${id} no encontrada`);
    suscripcion.estado = 'cancelada';
    suscripcion.fechaFin = new Date();
    return this.suscripcionesRepo.save(suscripcion);
  }

  async buscarPorCliente(clienteId: number): Promise<Suscripcion[]> {
    return this.suscripcionesRepo.find({
      where: { clienteId },
      relations: ['plan'],
      order: { creadoEn: 'DESC' },
    });
  }

  async buscarActiva(clienteId: number): Promise<Suscripcion | null> {
    return this.suscripcionesRepo.findOne({
      where: { clienteId, estado: 'activa' },
      relations: ['plan'],
    });
  }

  /**
   * Verifica si el cliente puede añadir más usuarios según su plan.
   * @throws ForbiddenException si se supera el límite del plan
   */
  async verificarLimiteUsuarios(clienteId: number, usuariosActivos: number): Promise<void> {
    const suscripcion = await this.buscarActiva(clienteId);
    if (!suscripcion) return; // Sin suscripción activa, sin límite aplicable

    const maxUsuarios = suscripcion.plan.maxUsuarios;
    if (maxUsuarios !== null && usuariosActivos >= maxUsuarios) {
      throw new ForbiddenException(
        `El plan "${suscripcion.plan.nombre}" permite un máximo de ${maxUsuarios} usuarios`,
      );
    }
  }
}
