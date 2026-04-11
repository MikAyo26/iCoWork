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
import { SuscripcionesService } from './suscripciones.service';
import { CrearSuscripcionDto } from './dto/crear-suscripcion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decoradores/roles.decorator';

/**
 * Controlador REST para el recurso suscripciones.
 * Expone los endpoints bajo el prefijo global /api/suscripciones.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  /**
   * POST /api/suscripciones
   * Crea una nueva suscripción para un cliente.
   * Solo accesible para superadmin.
   */
  @Roles('superadmin')
  @Post()
  suscribir(@Body() dto: CrearSuscripcionDto) {
    return this.suscripcionesService.suscribir(dto);
  }

  /**
   * GET /api/suscripciones
   * Devuelve todas las suscripciones del sistema con su plan asociado.
   * Solo accesible para superadmin.
   */
  @Roles('superadmin')
  @Get()
  buscarTodas() {
    return this.suscripcionesService.buscarTodas();
  }

  /**
   * GET /api/suscripciones/cliente/:id
   * Devuelve las suscripciones de un cliente específico.
   * Accesible para superadmin y admin.
   */
  @Roles('superadmin', 'admin')
  @Get('cliente/:id')
  buscarPorCliente(@Param('id', ParseIntPipe) id: number) {
    return this.suscripcionesService.buscarPorCliente(id);
  }

  /**
   * PATCH /api/suscripciones/:id/cancelar
   * Cancela una suscripción existente marcando su fecha de fin.
   * Solo accesible para superadmin.
   */
  @Roles('superadmin')
  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.suscripcionesService.cancelar(id);
  }
}
