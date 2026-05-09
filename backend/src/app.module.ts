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
        type: 'mysql', //Motor de BBDD
        host: config.get<string>('DB_HOST'), //Lee del .env
        port: parseInt(config.get<string>('DB_PORT', '3306'), 10), //Puerto Mysql
        username: config.get<string>('DB_USER'), // Usuario BBDD
        password: config.get<string>('DB_PASSWORD'), // Pass BBDD
        database: config.get<string>('DB_NAME'), // Nombre BBDD
        entities: [__dirname + '/**/*.entidad{.ts,.js}'], // Busca todas las entidades
        synchronize: false, //Produccion, no autocrear tablas, true: desarrollo, crea tablas.
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
