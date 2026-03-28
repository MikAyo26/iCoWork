import { PartialType } from '@nestjs/mapped-types';
import { CrearEspacioDto } from './crear-espacio.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class ActualizarEspacioDto extends PartialType(CrearEspacioDto) {
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
