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
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator';
import { UsuarioAutenticado } from '../auth/estrategias/jwt.estrategia';

/**
 * Controlador REST para el recurso usuarios.
 * Expone los endpoints bajo el prefijo global /api/usuarios.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * POST /api/usuarios — solo superadmin
   * Crea un nuevo usuario con los datos del body.
   */
  @Roles('superadmin')
  @Post()
  crear(@Body() dto: CrearUsuarioDto) {
    return this.usuariosService.crear(dto);
  }

  /**
   * GET /api/usuarios — superadmin y admin
   * Superadmin devuelve todos los usuarios.
   * Admin devuelve solo los usuarios de su cliente.
   */
  @Roles('superadmin', 'admin')
  @Get()
  buscarTodos(@UsuarioActual() usuarioActual: UsuarioAutenticado) {
    if (usuarioActual.rol === 'admin' && usuarioActual.clienteId) {
      return this.usuariosService.buscarPorCliente(usuarioActual.clienteId)
    }
    return this.usuariosService.buscarTodos()
  }

  /**
   * GET /api/usuarios/:id — superadmin y admin
   * Devuelve un usuario por su ID.
   */
  @Roles('superadmin', 'admin')
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.buscarPorId(id);
  }

  /**
   * PATCH /api/usuarios/:id — solo superadmin
   * Actualiza parcialmente un usuario por su ID.
   */
  @Roles('superadmin')
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
  ) {
    return this.usuariosService.actualizar(id, dto);
  }

  /**
   * DELETE /api/usuarios/:id — solo superadmin
   * Elimina un usuario por su ID.
   */
  @Roles('superadmin')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.eliminar(id);
  }
}