import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entidades/pago.entidad';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { CorreoService } from '../correo/correo.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagosRepo: Repository<Pago>,
    private readonly correoService: CorreoService,
    private readonly notificacionesService: NotificacionesService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async registrar(dto: CrearPagoDto): Promise<Pago> {
    const pago = this.pagosRepo.create({
      ...dto,
      estado: 'pendiente',
    });
    return this.pagosRepo.save(pago);
  }

  async confirmar(id: number): Promise<Pago> {
    const pago = await this.pagosRepo.findOneBy({ id });
    if (!pago) throw new NotFoundException(`Pago #${id} no encontrado`);

    pago.estado = 'completado';
    pago.pagadoEn = new Date();
    await this.pagosRepo.save(pago);

    const usuario = await this.usuariosService.buscarPorId(pago.usuarioId);

    await this.correoService.enviarConfirmacionPago(
      { nombre: usuario.nombre, correo: usuario.correo },
      {
        id: pago.id,
        importe: pago.importe,
        moneda: pago.moneda,
        pagadoEn: pago.pagadoEn,
      },
    );

    await this.notificacionesService.crear({
      usuarioId: pago.usuarioId,
      tipo: 'recibo_pago',
      titulo: 'Pago confirmado',
      cuerpo: `Tu pago de ${pago.importe} ${pago.moneda} ha sido procesado. Referencia: #${pago.id}.`,
    });

    return pago;
  }

  async buscarPorUsuario(usuarioId: number): Promise<Pago[]> {
    return this.pagosRepo.find({
      where: { usuarioId },
      order: { creadoEn: 'DESC' },
    });
  }

  async buscarPorSuscripcion(suscripcionId: number): Promise<Pago[]> {
    return this.pagosRepo.find({ where: { suscripcionId }, order: { creadoEn: 'DESC' } });
  }

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
