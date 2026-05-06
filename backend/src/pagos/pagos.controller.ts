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

/**
 * Controlador REST para el recurso pagos.
 * Expone los endpoints bajo el prefijo global /api/pagos.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  /**
   * POST /api/pagos — superadmin o admin
   * Registra un nuevo pago con estado pendiente.
   */
  @Roles('superadmin', 'admin')
  @Post()
  registrar(@Body() dto: CrearPagoDto) {
    return this.pagosService.registrar(dto);
  }

  /**
   * GET /api/pagos — superadmin
   * Devuelve todos los pagos del sistema.
   */
  @Roles('superadmin')
  @Get()
  buscarTodos() {
    return this.pagosService.buscarTodos();
  }

  /**
   * GET /api/pagos/estadisticas — superadmin
   * Devuelve estadísticas globales de todos los pagos del sistema.
   */
  @Roles('superadmin')
  @Get('estadisticas')
  estadisticasGlobales() {
    return this.pagosService.estadisticasGlobales();
  }

  /**
   * PATCH /api/pagos/:id/confirmar — superadmin
   * Confirma un pago pendiente y envía email de confirmación.
   */
  @Roles('superadmin')
  @Patch(':id/confirmar')
  confirmar(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.confirmar(id);
  }

  /**
   * GET /api/pagos/mis-pagos — todos los roles
   * Devuelve los pagos del usuario autenticado.
   */
  @Get('mis-pagos')
  misPagos(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.pagosService.buscarPorUsuario(usuario.id);
  }

  /**
   * GET /api/pagos/cliente/:id/estadisticas — superadmin o admin
   * Devuelve estadísticas de pagos de un cliente específico.
   */
  @Roles('superadmin', 'admin')
  @Get('cliente/:id/estadisticas')
  estadisticas(@Param('id', ParseIntPipe) clienteId: number) {
    return this.pagosService.estadisticasPorCliente(clienteId);
  }
}
