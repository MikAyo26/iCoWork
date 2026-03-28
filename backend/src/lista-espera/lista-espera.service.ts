import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListaEspera } from './entidades/lista-espera.entidad';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ListaEsperaService {
  constructor(
    @InjectRepository(ListaEspera)
    private readonly listaEsperaRepo: Repository<ListaEspera>,
    private readonly notificacionesService: NotificacionesService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async unirse(usuarioId: number, espacioId: number, fechaDeseada: Date): Promise<ListaEspera> {
    const existe = await this.listaEsperaRepo.findOneBy({
      usuarioId,
      espacioId,
      fechaDeseada,
    });
    if (existe) {
      throw new ConflictException('Ya estás en la lista de espera para este espacio y fecha');
    }

    const entrada = this.listaEsperaRepo.create({ usuarioId, espacioId, fechaDeseada });
    return this.listaEsperaRepo.save(entrada);
  }

  async buscarPorUsuario(usuarioId: number): Promise<ListaEspera[]> {
    return this.listaEsperaRepo.find({
      where: { usuarioId },
      relations: ['espacio', 'espacio.oficina'],
      order: { creadoEn: 'DESC' },
    });
  }

  async eliminar(id: number, usuarioId: number): Promise<void> {
    const entrada = await this.listaEsperaRepo.findOneBy({ id });
    if (!entrada) throw new NotFoundException(`Entrada #${id} no encontrada en lista de espera`);
    if (entrada.usuarioId !== usuarioId) throw new ForbiddenException();
    await this.listaEsperaRepo.remove(entrada);
  }

  /**
   * Notifica al siguiente usuario en la lista de espera para un espacio y fecha.
   * Marca la entrada como notificada y crea la notificación en BD.
   * Retorna el usuarioId notificado (o null si la lista estaba vacía).
   */
  async notificarSiguiente(espacioId: number, fecha: Date): Promise<number | null> {
    const fechaSolo = new Date(fecha);
    fechaSolo.setHours(0, 0, 0, 0);

    const siguiente = await this.listaEsperaRepo
      .createQueryBuilder('le')
      .where('le.espacio_id = :espacioId', { espacioId })
      .andWhere('le.fecha_deseada = :fecha', { fecha: fechaSolo })
      .andWhere('le.notificado_en IS NULL')
      .orderBy('le.creado_en', 'ASC')
      .getOne();

    if (!siguiente) return null;

    siguiente.notificadoEn = new Date();
    await this.listaEsperaRepo.save(siguiente);

    await this.notificacionesService.crear({
      usuarioId: siguiente.usuarioId,
      tipo: 'espera_disponible',
      titulo: 'Espacio disponible',
      cuerpo: `El espacio #${espacioId} que seguías está ahora disponible para el día ${fechaSolo.toLocaleDateString('es-ES')}.`,
    });

    this.eventsGateway.emitirListaEsperaNotificacion(siguiente.usuarioId, {
      espacioId,
      fecha: fechaSolo,
    });

    return siguiente.usuarioId;
  }
}
