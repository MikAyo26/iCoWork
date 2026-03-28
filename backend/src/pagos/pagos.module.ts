import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entidades/pago.entidad';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { CorreoModule } from '../correo/correo.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago]),
    CorreoModule,
    NotificacionesModule,
    UsuariosModule,
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
