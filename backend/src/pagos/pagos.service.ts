import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entidades/pago.entidad';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { CorreoService } from '../correo/correo.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { UsuariosService } from '../usuarios/usuarios.service';

/**
 * Servicio que encapsula la lógica de negocio del módulo pagos.
 * Gestiona el registro, confirmación y consulta de pagos.
 */
@Injectable()
export class PagosService {
  constructor(
    /** Repositorio TypeORM inyectado para la entidad Pago */
    @InjectRepository(Pago)
    private readonly pagosRepo: Repository<Pago>,
    private readonly correoService: CorreoService,
    private readonly notificacionesService: NotificacionesService,
    private readonly usuariosService: UsuariosService,
  ) {}

  /**
   * Registra un nuevo pago con estado pendiente.
   * @param dto Datos del pago a registrar
   */
  async registrar(dto: CrearPagoDto): Promise<Pago> {
    const pago = this.pagosRepo.create({
      ...dto,
      estado: 'pendiente',
    });
    return this.pagosRepo.save(pago);
  }

  /**
   * Confirma un pago pendiente, actualiza su estado a completado,
   * envía un email de confirmación al usuario y crea una notificación en BD.
   * @param id Identificador del pago a confirmar
   * @throws NotFoundException si no se encuentra el pago
   */
  async confirmar(id: number): Promise<Pago> {
    const pago = await this.pagosRepo.findOneBy({ id });
    if (!pago) throw new NotFoundException(`Pago #${id} no encontrado`);

    pago.estado = 'completado';
    pago.pagadoEn = new Date();
    await this.pagosRepo.save(pago);

    const usuario = await this.usuariosService.buscarPorId(pago.usuarioId);

    /** Envía email de confirmación al usuario */
    await this.correoService.enviarConfirmacionPago(
      { nombre: usuario.nombre, correo: usuario.correo },
      {
        id: pago.id,
        importe: pago.importe,
        moneda: pago.moneda,
        pagadoEn: pago.pagadoEn,
      },
    );

    /** Crea notificación en BD para el usuario */
    await this.notificacionesService.crear({
      usuarioId: pago.usuarioId,
      tipo: 'recibo_pago',
      titulo: 'Pago confirmado',
      cuerpo: `Tu pago de ${pago.importe} ${pago.moneda} ha sido procesado. Referencia: #${pago.id}.`,
    });

    return pago;
  }

  /**
   * Devuelve todos los pagos del sistema ordenados por fecha de creación.
   * Usado por superadmin para ver el historial completo de pagos.
   */
  async buscarTodos(): Promise<Pago[]> {
    return this.pagosRepo.find({
      order: { creadoEn: 'DESC' },
    });
  }

  /**
   * Devuelve todos los pagos de un usuario específico.
   * @param usuarioId Identificador del usuario
   */
  async buscarPorUsuario(usuarioId: number): Promise<Pago[]> {
    return this.pagosRepo.find({
      where: { usuarioId },
      order: { creadoEn: 'DESC' },
    });
  }

  /**
   * Devuelve todos los pagos asociados a una suscripción específica.
   * @param suscripcionId Identificador de la suscripción
   */
  async buscarPorSuscripcion(suscripcionId: number): Promise<Pago[]> {
    return this.pagosRepo.find({
      where: { suscripcionId },
      order: { creadoEn: 'DESC' },
    });
  }

  /**
   * Calcula las estadísticas de pagos completados de un cliente.
   * Devuelve el total pagado y el número total de pagos.
   * @param clienteId Identificador del cliente
   */
  async estadisticasPorCliente(clienteId: number): Promise<{
    totalPagado: number;
    totalPagos: number;
  }> {
    const result = await this.pagosRepo
      .createQueryBuilder('p')
      .innerJoin('p.usuario', 'u')
      .where('u.cliente_id = :clienteId', { clienteId })
      .andWhere("p.estado = 'completado'")
      .select('SUM(p.importe)', 'totalPagado')
      .addSelect('COUNT(p.id)', 'totalPagos')
      .getRawOne<{ totalPagado: string; totalPagos: string }>();

    return {
      totalPagado: parseFloat(result?.totalPagado ?? '0'),
      totalPagos: parseInt(result?.totalPagos ?? '0', 10),
    };
  }
}
