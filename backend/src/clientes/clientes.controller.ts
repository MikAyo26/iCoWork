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
import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decoradores/roles.decorator';

/**
 * Controlador REST para el recurso clientes.
 * Expone los endpoints bajo el prefijo global /api/clientes.
 * Todos los endpoints requieren autenticación JWT y rol superadmin.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  /**
   * POST /api/clientes
   * Crea un nuevo cliente.
   */
  @Post()
  crear(@Body() dto: CrearClienteDto) {
    return this.clientesService.crear(dto);
  }

  /**
   * GET /api/clientes
   * Devuelve todos los clientes con sus usuarios.
   */
  @Get()
  buscarTodos() {
    return this.clientesService.buscarTodos();
  }

  /**
   * GET /api/clientes/:id
   * Devuelve un cliente por su ID.
   */
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.buscarPorId(id);
  }

  /**
   * PATCH /api/clientes/:id
   * Actualiza parcialmente un cliente por su ID.
   */
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarClienteDto,
  ) {
    return this.clientesService.actualizar(id, dto);
  }

  /**
   * DELETE /api/clientes/:id
   * Elimina un cliente por su ID.
   */
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.eliminar(id);
  }
}
