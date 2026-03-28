import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decoradores/roles.decorator';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator';
import { UsuarioAutenticado } from '../auth/estrategias/jwt.estrategia';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  /** POST /api/reservas — cualquier rol autenticado */
  @Post()
  crear(@Body() dto: CrearReservaDto, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.reservasService.crear(dto, usuario);
  }

  /** GET /api/reservas/mis-reservas — propias del usuario autenticado */
  @Get('mis-reservas')
  misReservas(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.reservasService.buscarMisReservas(usuario.id);
  }

  /** GET /api/reservas/espacio/:id — admin y superadmin */
  @Roles('superadmin', 'admin')
  @Get('espacio/:id')
  porEspacio(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.buscarPorEspacio(id);
  }

  /** GET /api/reservas/cliente/:id — admin (propio) o superadmin */
  @Roles('superadmin', 'admin')
  @Get('cliente/:id')
  porCliente(
    @Param('id', ParseIntPipe) clienteId: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    if (usuario.rol === 'admin' && usuario.clienteId !== clienteId) {
      return [];
    }
    return this.reservasService.buscarPorCliente(clienteId);
  }

  /** PATCH /api/reservas/:id/cancelar */
  @Patch(':id/cancelar')
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.reservasService.cancelar(id, usuario);
  }

  /** PATCH /api/reservas/:id/cancelar-serie — admin y superadmin */
  @Roles('superadmin', 'admin')
  @Patch(':id/cancelar-serie')
  cancelarSerie(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.reservasService.cancelarSerie(id, usuario);
  }
}
