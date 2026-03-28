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
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decoradores/roles.decorator';

/**
 * Controlador REST para el recurso usuarios.
 * Expone los endpoints bajo el prefijo global /api/usuarios.
 * Todos los endpoints requieren autenticación JWT y rol superadmin.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * POST /api/usuarios
   * Crea un nuevo usuario con los datos del body.
   */
  @Post()
  crear(@Body() dto: CrearUsuarioDto) {
    return this.usuariosService.crear(dto);
  }

  /**
   * GET /api/usuarios
   * Devuelve la lista completa de usuarios.
   */
  @Get()
  buscarTodos() {
    return this.usuariosService.buscarTodos();
  }

  /**
   * GET /api/usuarios/:id
   * Devuelve un usuario por su ID.
   */
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.buscarPorId(id);
  }

  /**
   * PATCH /api/usuarios/:id
   * Actualiza parcialmente un usuario por su ID.
   */
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
  ) {
    return this.usuariosService.actualizar(id, dto);
  }

  /**
   * DELETE /api/usuarios/:id
   * Elimina un usuario por su ID.
   */
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.eliminar(id);
  }
}
