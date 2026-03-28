import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entidades/cliente.entidad';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';

/**
 * Módulo que agrupa todos los componentes relacionados con la gestión de clientes.
 * Exporta ClientesService para uso en otros módulos como suscripciones.
 */
@Module({
    imports: [TypeOrmModule.forFeature([Cliente])],
    controllers: [ClientesController],
    providers: [ClientesService],
    exports: [ClientesService],
})
export class ClientesModule {}