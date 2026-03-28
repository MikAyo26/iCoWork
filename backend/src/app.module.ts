import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { AuthModule } from './auth/auth.module';
import { OficinasModule } from './oficinas/oficinas.module';
import { EspaciosModule } from './espacios/espacios.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ListaEsperaModule } from './lista-espera/lista-espera.module';
import { ReservasModule } from './reservas/reservas.module';
import { EventsModule } from './events/events.module';
import { CorreoModule } from './correo/correo.module';
import { PlanesModule } from './planes/planes.module';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { PagosModule } from './pagos/pagos.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT', '3306'), 10),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entidad{.ts,.js}'],
        synchronize: false,
      }),
    }),
    AuthModule,
    EventsModule,
    UsuariosModule,
    ClientesModule,
    OficinasModule,
    EspaciosModule,
    NotificacionesModule,
    ListaEsperaModule,
    ReservasModule,
    CorreoModule,
    PlanesModule,
    SuscripcionesModule,
    PagosModule,
    DashboardModule,
  ],
})
export class AppModule {}
