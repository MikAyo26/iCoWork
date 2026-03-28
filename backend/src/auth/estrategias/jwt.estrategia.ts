import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  correo: string;
  rol: string;
  clienteId: number | null;
}

/** Tipo que representa el usuario autenticado adjunto a request.user */
export class UsuarioAutenticado {
  id: number;
  correo: string;
  rol: string;
  clienteId: number | null;
}

/**
 * Estrategia JWT de Passport.
 * Extrae el token del header Authorization (Bearer) y valida la firma.
 * El objeto retornado por `validate` se adjunta a `request.user`.
 */
@Injectable()
export class JwtEstrategia extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRETO') as string,
    });
  }

  validate(payload: JwtPayload): UsuarioAutenticado {
    const user = new UsuarioAutenticado();
    user.id = payload.sub;
    user.correo = payload.correo;
    user.rol = payload.rol;
    user.clienteId = payload.clienteId;
    return user;
  }
}
