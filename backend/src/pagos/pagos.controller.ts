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
import { PagosService } from './pagos.service';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decoradores/roles.decorator';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator';
import { UsuarioAutenticado } from '../auth/estrategias/jwt.estrategia';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  /** POST /api/pagos — superadmin o admin */
  @Roles('superadmin', 'admin')
  @Post()
  registrar(@Body() dto: CrearPagoDto) {
    return this.pagosService.registrar(dto);
  }

  /** PATCH /api/pagos/:id/confirmar — superadmin */
  @Roles('superadmin')
  @Patch(':id/confirmar')
  confirmar(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.confirmar(id);
  }

  /** GET /api/pagos/mis-pagos — propios del usuario autenticado */
  @Get('mis-pagos')
  misPagos(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.pagosService.buscarPorUsuario(usuario.id);
  }

  /** GET /api/pagos/cliente/:id/estadisticas — admin o superadmin */
  @Roles('superadmin', 'admin')
  @Get('cliente/:id/estadisticas')
  estadisticas(@Param('id', ParseIntPipe) clienteId: number) {
    return this.pagosService.estadisticasPorCliente(clienteId);
  }
}
