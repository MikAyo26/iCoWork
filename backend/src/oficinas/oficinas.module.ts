import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oficina } from './entidades/oficina.entidad';
import { OficinasService } from './oficinas.service';
import { OficinasController } from './oficinas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Oficina])],
  controllers: [OficinasController],
  providers: [OficinasService],
  exports: [OficinasService],
})
export class OficinasModule {}
