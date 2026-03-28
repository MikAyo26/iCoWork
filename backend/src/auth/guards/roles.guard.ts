import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '../../usuarios/entidades/usuario.entidad';
import { ROLES_KEY } from '../decoradores/roles.decorator';

/**
 * Guard que comprueba si el usuario autenticado tiene el rol requerido.
 * Debe usarse siempre junto a JwtAuthGuard.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return rolesRequeridos.includes(user?.rol);
  }
}
