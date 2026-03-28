import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Extrae el usuario autenticado del request (inyectado por JwtAuthGuard) */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
