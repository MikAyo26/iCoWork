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
import { PlanesService } from './planes.service';
import { CrearPlanDto } from './dto/crear-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decoradores/roles.decorator';

@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  /** GET /api/planes — público, lista planes activos */
  @Get()
  buscarActivos() {
    return this.planesService.buscarTodos(true);
  }

  /** POST /api/planes — superadmin */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Post()
  crear(@Body() dto: CrearPlanDto) {
    return this.planesService.crear(dto);
  }

  /** GET /api/planes/todos — superadmin (incluye inactivos) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Get('todos')
  buscarTodos() {
    return this.planesService.buscarTodos(false);
  }

  /** PATCH /api/planes/:id — superadmin */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CrearPlanDto>) {
    return this.planesService.actualizar(id, dto);
  }

  /** DELETE /api/planes/:id — superadmin (desactiva) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Delete(':id')
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.planesService.desactivar(id);
  }
}
