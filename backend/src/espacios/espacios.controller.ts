import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { EspaciosService } from './espacios.service';
import { CrearEspacioDto } from './dto/crear-espacio.dto';
import { ActualizarEspacioDto } from './dto/actualizar-espacio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decoradores/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('espacios')
export class EspaciosController {
  constructor(private readonly espaciosService: EspaciosService) {}

  /** POST /api/espacios — superadmin */
  @Roles('superadmin')
  @Post()
  crear(@Body() dto: CrearEspacioDto) {
    return this.espaciosService.crear(dto);
  }

  /** GET /api/espacios — admin y superadmin */
  @Roles('superadmin', 'admin')
  @Get()
  buscarTodos() {
    return this.espaciosService.buscarTodos();
  }

  /**
   * GET /api/espacios/disponibilidad?espacioId=&inicio=&fin=
   * Accesible para todos los roles autenticados.
   */
  @Get('disponibilidad')
  async verificarDisponibilidad(
    @Query('espacioId', ParseIntPipe) espacioId: number,
    @Query('inicio') inicioStr: string,
    @Query('fin') finStr: string,
  ) {
    if (!inicioStr || !finStr) {
      throw new BadRequestException('Los parámetros inicio y fin son obligatorios');
    }
    const inicio = new Date(inicioStr);
    const fin = new Date(finStr);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new BadRequestException('Las fechas inicio y fin deben ser fechas válidas en formato ISO');
    }
    const disponible = await this.espaciosService.verificarDisponibilidad(espacioId, inicio, fin);
    return { espacioId, inicio, fin, disponible };
  }

  /** GET /api/espacios/oficina/:id — todos los roles autenticados */
  @Get('oficina/:id')
  buscarPorOficina(@Param('id', ParseIntPipe) id: number) {
    return this.espaciosService.buscarPorOficina(id);
  }

  /** GET /api/espacios/:id — admin y superadmin */
  @Roles('superadmin', 'admin')
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.espaciosService.buscarPorId(id);
  }

  /** PATCH /api/espacios/:id — superadmin */
  @Roles('superadmin')
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEspacioDto,
  ) {
    return this.espaciosService.actualizar(id, dto);
  }

  /** DELETE /api/espacios/:id — superadmin (soft-delete) */
  @Roles('superadmin')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.espaciosService.eliminar(id);
  }
}
