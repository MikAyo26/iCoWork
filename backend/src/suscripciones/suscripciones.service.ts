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

/**
 * Servicio que encapsula la lógica de negocio del módulo suscripciones.
 * Gestiona la creación, cancelación y consulta de suscripciones de clientes.
 */
@Injectable()
export class SuscripcionesService {
  constructor(
    /** Repositorio TypeORM inyectado para la entidad Suscripcion */
    @InjectRepository(Suscripcion)
    private readonly suscripcionesRepo: Repository<Suscripcion>,
    private readonly planesService: PlanesService,
  ) {}

  /**
   * Crea una nueva suscripción para un cliente.
   * Verifica que el cliente no tenga ya una suscripción activa
   * y que el plan exista y esté activo.
   * @param dto Datos de la suscripción a crear
   * @throws ConflictException si el cliente ya tiene una suscripción activa
   */
  async suscribir(dto: CrearSuscripcionDto): Promise<Suscripcion> {
    const activa = await this.suscripcionesRepo.findOne({
      where: { clienteId: dto.clienteId, estado: 'activa' },
    });
    if (activa) {
      throw new ConflictException('El cliente ya tiene una suscripción activa');
    }

    // Verifica que el plan existe y está activo
    await this.planesService.buscarPorId(dto.planId);

    const suscripcion = this.suscripcionesRepo.create({
      clienteId: dto.clienteId,
      planId: dto.planId,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : new Date(),
      estado: 'activa',
    });
    return this.suscripcionesRepo.save(suscripcion);
  }

  /**
   * Cancela una suscripción existente marcando su fecha de fin.
   * @param id Identificador de la suscripción
   * @throws NotFoundException si no se encuentra la suscripción
   */
  async cancelar(id: number): Promise<Suscripcion> {
    const suscripcion = await this.suscripcionesRepo.findOneBy({ id });
    if (!suscripcion)
      throw new NotFoundException(`Suscripción #${id} no encontrada`);
    suscripcion.estado = 'cancelada';
    suscripcion.fechaFin = new Date();
    return this.suscripcionesRepo.save(suscripcion);
  }

  /**
   * Devuelve todas las suscripciones de un cliente ordenadas por fecha de creación.
   * @param clienteId Identificador del cliente
   */
  async buscarPorCliente(clienteId: number): Promise<Suscripcion[]> {
    return this.suscripcionesRepo.find({
      where: { clienteId },
      relations: ['plan'],
      order: { creadoEn: 'DESC' },
    });
  }

  /**
   * Devuelve la suscripción activa de un cliente o null si no tiene ninguna.
   * @param clienteId Identificador del cliente
   */
  async buscarActiva(clienteId: number): Promise<Suscripcion | null> {
    return this.suscripcionesRepo.findOne({
      where: { clienteId, estado: 'activa' },
      relations: ['plan'],
    });
  }

  /**
   * Devuelve todas las suscripciones del sistema con su plan asociado.
   * Endpoint reservado para superadmin.
   */
  async buscarTodas(): Promise<Suscripcion[]> {
    return this.suscripcionesRepo.find({
      relations: ['plan'],
      order: { creadoEn: 'DESC' },
    });
  }

  /**
   * Verifica si el cliente puede añadir más usuarios según su plan activo.
   * Si no tiene suscripción activa no aplica ningún límite.
   * @param clienteId Identificador del cliente
   * @param usuariosActivos Número actual de usuarios activos del cliente
   * @throws ForbiddenException si se supera el límite de usuarios del plan
   */
  async verificarLimiteUsuarios(
    clienteId: number,
    usuariosActivos: number,
  ): Promise<void> {
    const suscripcion = await this.buscarActiva(clienteId);
    if (!suscripcion) return;

    const maxUsuarios = suscripcion.plan.maxUsuarios;
    if (maxUsuarios !== null && usuariosActivos >= maxUsuarios) {
      throw new ForbiddenException(
        `El plan "${suscripcion.plan.nombre}" permite un máximo de ${maxUsuarios} usuarios`,
      );
    }
  }
}
