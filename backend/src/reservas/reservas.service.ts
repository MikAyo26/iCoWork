import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva, TipoRecurrencia } from './entidades/reserva.entidad';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { EspaciosService } from '../espacios/espacios.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { ListaEsperaService } from '../lista-espera/lista-espera.service';
import { EventsGateway } from '../events/events.gateway';
import { UsuarioAutenticado } from '../auth/estrategias/jwt.estrategia';

type UsuarioToken = Pick<UsuarioAutenticado, 'id' | 'rol' | 'clienteId'>;

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservasRepo: Repository<Reserva>,
    private readonly espaciosService: EspaciosService,
    private readonly notificacionesService: NotificacionesService,
    private readonly listaEsperaService: ListaEsperaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async crear(dto: CrearReservaDto, usuarioActual: UsuarioToken): Promise<{
    reserva: Reserva;
    hijosCreados: number;
    fechasOmitidas: Date[];
  }> {
    const inicio = new Date(dto.inicio);
    const fin = new Date(dto.fin);

    if (fin <= inicio) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la de inicio');
    }

    const disponible = await this.espaciosService.verificarDisponibilidad(dto.espacioId, inicio, fin);
    if (!disponible) {
      throw new ConflictException('El espacio no está disponible en el horario indicado');
    }

    const reservaPadre = this.reservasRepo.create({
      usuarioId: usuarioActual.id,
      espacioId: dto.espacioId,
      inicio,
      fin,
      estado: 'confirmada',
      tipoRecurrencia: dto.tipoRecurrencia ?? 'ninguna',
      finRecurrencia: dto.finRecurrencia ? new Date(dto.finRecurrencia) : null,
    });
    await this.reservasRepo.save(reservaPadre);

    let hijosCreados = 0;
    const fechasOmitidas: Date[] = [];

    if (dto.tipoRecurrencia && dto.tipoRecurrencia !== 'ninguna' && dto.finRecurrencia) {
      const resultado = await this.generarHijos(reservaPadre, new Date(dto.finRecurrencia));
      hijosCreados = resultado.creados;
      fechasOmitidas.push(...resultado.omitidas);
    }

    await this.notificacionesService.crear({
      usuarioId: usuarioActual.id,
      tipo: 'reserva_confirmada',
      titulo: 'Reserva confirmada',
      cuerpo: `Tu reserva del espacio #${dto.espacioId} del ${inicio.toLocaleString('es-ES')} ha sido confirmada.`,
    });

    this.eventsGateway.emitirDisponibilidadCambiada(dto.espacioId, false);

    return { reserva: reservaPadre, hijosCreados, fechasOmitidas };
  }

  private async generarHijos(
    padre: Reserva,
    finRecurrencia: Date,
  ): Promise<{ creados: number; omitidas: Date[] }> {
    const hijos: Reserva[] = [];
    const omitidas: Date[] = [];

    let inicioActual = new Date(padre.inicio);
    let finActual = new Date(padre.fin);
    const duracionMs = finActual.getTime() - inicioActual.getTime();

    inicioActual = avanzarFecha(inicioActual, padre.tipoRecurrencia);
    finActual = new Date(inicioActual.getTime() + duracionMs);

    while (inicioActual <= finRecurrencia) {
      const disponible = await this.espaciosService.verificarDisponibilidad(
        padre.espacioId,
        inicioActual,
        finActual,
      );

      if (disponible) {
        hijos.push(
          this.reservasRepo.create({
            usuarioId: padre.usuarioId,
            espacioId: padre.espacioId,
            inicio: new Date(inicioActual),
            fin: new Date(finActual),
            estado: 'confirmada',
            tipoRecurrencia: 'ninguna',
            reservaPadreId: padre.id,
          }),
        );
      } else {
        omitidas.push(new Date(inicioActual));
      }

      inicioActual = avanzarFecha(inicioActual, padre.tipoRecurrencia);
      finActual = new Date(inicioActual.getTime() + duracionMs);
    }

    if (hijos.length > 0) {
      await this.reservasRepo.save(hijos);
    }

    return { creados: hijos.length, omitidas };
  }

  async cancelar(id: number, usuarioActual: UsuarioToken): Promise<Reserva> {
    const reserva = await this.reservasRepo.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!reserva) throw new NotFoundException(`Reserva #${id} no encontrada`);

    this.verificarPermisoCancelar(reserva, usuarioActual);

    reserva.estado = 'cancelada';
    await this.reservasRepo.save(reserva);

    this.eventsGateway.emitirDisponibilidadCambiada(reserva.espacioId, true);

    const fecha = new Date(reserva.inicio);
    const usuarioNotificado = await this.listaEsperaService.notificarSiguiente(reserva.espacioId, fecha);

    if (reserva.usuarioId !== usuarioActual.id) {
      await this.notificacionesService.crear({
        usuarioId: reserva.usuarioId,
        tipo: 'reserva_cancelada',
        titulo: 'Reserva cancelada',
        cuerpo: `Tu reserva del espacio #${reserva.espacioId} del ${fecha.toLocaleString('es-ES')} ha sido cancelada.`,
      });
    }

    // Evita referencia unused
    void usuarioNotificado;

    return reserva;
  }

  async cancelarSerie(reservaPadreId: number, usuarioActual: UsuarioToken): Promise<number> {
    const padre = await this.reservasRepo.findOneBy({ id: reservaPadreId });
    if (!padre) throw new NotFoundException(`Reserva padre #${reservaPadreId} no encontrada`);

    this.verificarPermisoCancelar(padre, usuarioActual);

    const ahora = new Date();
    const hijos = await this.reservasRepo
      .createQueryBuilder('r')
      .where('r.reserva_padre_id = :id', { id: reservaPadreId })
      .andWhere('r.inicio > :ahora', { ahora })
      .andWhere("r.estado != 'cancelada'")
      .getMany();

    for (const hijo of hijos) {
      hijo.estado = 'cancelada';
    }
    await this.reservasRepo.save(hijos);

    return hijos.length;
  }

  async buscarMisReservas(usuarioId: number): Promise<Reserva[]> {
    return this.reservasRepo.find({
      where: { usuarioId },
      relations: ['espacio', 'espacio.oficina'],
      order: { inicio: 'DESC' },
    });
  }

  async buscarPorEspacio(espacioId: number): Promise<Reserva[]> {
    return this.reservasRepo.find({
      where: { espacioId },
      relations: ['usuario'],
      order: { inicio: 'ASC' },
    });
  }

  async buscarPorCliente(clienteId: number): Promise<Reserva[]> {
    return this.reservasRepo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.usuario', 'u')
      .innerJoinAndSelect('r.espacio', 'e')
      .innerJoinAndSelect('e.oficina', 'o')
      .where('u.cliente_id = :clienteId', { clienteId })
      .orderBy('r.inicio', 'DESC')
      .getMany();
  }

  private verificarPermisoCancelar(reserva: Reserva, usuarioActual: UsuarioToken): void {
    if (usuarioActual.rol === 'superadmin') return;

    if (usuarioActual.rol === 'admin') {
      if (reserva.usuario?.clienteId !== usuarioActual.clienteId) {
        throw new ForbiddenException('No puedes cancelar reservas fuera de tu cliente');
      }
      return;
    }

    // empleado: solo las propias y solo futuras
    if (reserva.usuarioId !== usuarioActual.id) {
      throw new ForbiddenException('Solo puedes cancelar tus propias reservas');
    }
    if (reserva.inicio <= new Date()) {
      throw new ForbiddenException('No puedes cancelar una reserva que ya ha comenzado o finalizado');
    }
  }
}

function avanzarFecha(fecha: Date, tipo: TipoRecurrencia): Date {
  const nueva = new Date(fecha);
  switch (tipo) {
    case 'diaria':
      nueva.setDate(nueva.getDate() + 1);
      break;
    case 'semanal':
      nueva.setDate(nueva.getDate() + 7);
      break;
    case 'mensual':
      nueva.setMonth(nueva.getMonth() + 1);
      break;
  }
  return nueva;
}
