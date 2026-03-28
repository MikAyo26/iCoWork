import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entidades/reserva.entidad';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { EspaciosModule } from '../espacios/espacios.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { ListaEsperaModule } from '../lista-espera/lista-espera.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva]),
    EspaciosModule,
    NotificacionesModule,
    ListaEsperaModule,
    EventsModule,
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
