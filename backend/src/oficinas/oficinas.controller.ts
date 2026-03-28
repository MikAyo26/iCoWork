import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OficinasService } from './oficinas.service';
import { CrearOficinaDto } from './dto/crear-oficina.dto';
import { ActualizarOficinaDto } from './dto/actualizar-oficina.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decoradores/roles.decorator';

/**
 * Controlador REST para el recurso oficinas.
 * GET activas: accesible para cualquier usuario autenticado.
 * Mutaciones: solo superadmin.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('oficinas')
export class OficinasController {
  constructor(private readonly oficinasService: OficinasService) {}

  /** POST /api/oficinas — superadmin */
  @Roles('superadmin')
  @Post()
  crear(@Body() dto: CrearOficinaDto) {
    return this.oficinasService.crear(dto);
  }

  /** GET /api/oficinas — admin y superadmin */
  @Roles('superadmin', 'admin')
  @Get()
  buscarTodos() {
    return this.oficinasService.buscarTodos();
  }

  /** GET /api/oficinas/activas — todos los roles autenticados */
  @Get('activas')
  buscarActivas() {
    return this.oficinasService.buscarActivas();
  }

  /** GET /api/oficinas/:id — admin y superadmin */
  @Roles('superadmin', 'admin')
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.oficinasService.buscarPorId(id);
  }

  /** PATCH /api/oficinas/:id — superadmin */
  @Roles('superadmin')
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarOficinaDto,
  ) {
    return this.oficinasService.actualizar(id, dto);
  }

  /** DELETE /api/oficinas/:id — superadmin (soft-delete) */
  @Roles('superadmin')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.oficinasService.eliminar(id);
  }
}
