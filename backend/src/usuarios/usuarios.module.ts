import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entidades/usuario.entidad';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

/**
 * Módulo que agrupa todos los componentes relacionados con la gestión de usuarios.
 * Exporta UsuariosService para que otros módulos (como auth) puedan inyectarlo.
 */
@Module({
  imports: [
    /** Registra la entidad Usuario en el contexto de TypeORM para este módulo */
    TypeOrmModule.forFeature([Usuario]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  /** Se exporta el servicio para uso en el módulo de autenticación */
  exports: [UsuariosService],
})
export class UsuariosModule {}