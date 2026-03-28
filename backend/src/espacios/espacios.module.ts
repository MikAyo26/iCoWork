import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Espacio } from './entidades/espacio.entidad';
import { EspaciosService } from './espacios.service';
import { EspaciosController } from './espacios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Espacio])],
  controllers: [EspaciosController],
  providers: [EspaciosService],
  exports: [EspaciosService],
})
export class EspaciosModule {}
