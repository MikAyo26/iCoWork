import { PartialType } from '@nestjs/mapped-types';
import { CrearOficinaDto } from './crear-oficina.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class ActualizarOficinaDto extends PartialType(CrearOficinaDto) {
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
