import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator';
import { UsuarioAutenticado } from '../auth/estrategias/jwt.estrategia';

@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  /** GET /api/notificaciones — propias del usuario autenticado */
  @Get()
  buscarMias(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.notificacionesService.buscarPorUsuario(usuario.id);
  }

  /** PATCH /api/notificaciones/:id/leer */
  @Patch(':id/leer')
  marcarLeida(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.notificacionesService.marcarLeida(id, usuario.id);
  }

  /** PATCH /api/notificaciones/leer-todas */
  @Patch('leer-todas')
  marcarTodasLeidas(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.notificacionesService.marcarTodasLeidas(usuario.id);
  }
}
