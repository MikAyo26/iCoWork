import { SetMetadata } from '@nestjs/common';
import { Rol } from '../../usuarios/entidades/usuario.entidad';

export const ROLES_KEY = 'roles';

/** Decorador para especificar qué roles tienen acceso a un endpoint */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
