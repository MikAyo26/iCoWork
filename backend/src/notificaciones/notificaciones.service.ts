import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entidades/notificacion.entidad';
import { CrearNotificacionDto } from './dto/crear-notificacion.dto';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionesRepo: Repository<Notificacion>,
  ) {}

  async crear(dto: CrearNotificacionDto): Promise<Notificacion> {
    const notificacion = this.notificacionesRepo.create(dto);
    return this.notificacionesRepo.save(notificacion);
  }

  async buscarPorUsuario(usuarioId: number): Promise<Notificacion[]> {
    return this.notificacionesRepo.find({
      where: { usuarioId },
      order: { enviadoEn: 'DESC' },
    });
  }

  async marcarLeida(id: number, usuarioId: number): Promise<Notificacion> {
    const notificacion = await this.notificacionesRepo.findOneBy({ id });
    if (!notificacion) throw new NotFoundException(`Notificación #${id} no encontrada`);
    if (notificacion.usuarioId !== usuarioId) throw new ForbiddenException();
    notificacion.leida = true;
    return this.notificacionesRepo.save(notificacion);
  }

  async marcarTodasLeidas(usuarioId: number): Promise<void> {
    await this.notificacionesRepo.update({ usuarioId, leida: false }, { leida: true });
  }
}
