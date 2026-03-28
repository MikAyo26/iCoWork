import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsuarioActual } from './decoradores/usuario-actual.decorator';

/**
 * Controlador de autenticación.
 * Gestiona login y consulta del perfil autenticado.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Endpoint público que valida credenciales y retorna JWT.
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.correo, dto.contrasena);
  }

  /**
   * GET /api/auth/perfil
   * Retorna los datos del usuario extraídos del token JWT.
   */
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  perfil(@UsuarioActual() usuario: unknown) {
    return usuario;
  }
}
