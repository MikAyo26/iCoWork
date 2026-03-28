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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  /** POST /api/suscripciones — superadmin */
  @Roles('superadmin')
  @Post()
  suscribir(@Body() dto: CrearSuscripcionDto) {
    return this.suscripcionesService.suscribir(dto);
  }

  /** GET /api/suscripciones/cliente/:id — superadmin o admin propio */
  @Roles('superadmin', 'admin')
  @Get('cliente/:id')
  buscarPorCliente(@Param('id', ParseIntPipe) id: number) {
    return this.suscripcionesService.buscarPorCliente(id);
  }

  /** PATCH /api/suscripciones/:id/cancelar — superadmin */
  @Roles('superadmin')
  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.suscripcionesService.cancelar(id);
  }
}
