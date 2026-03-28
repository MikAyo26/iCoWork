import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard que valida el token JWT en el header Authorization */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
