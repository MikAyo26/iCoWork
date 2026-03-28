import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsEnum,
  Min,
  ValidateIf,
} from 'class-validator';
import type { TipoRecurrencia } from '../entidades/reserva.entidad';

export class CrearReservaDto {
  @IsInt()
  @Min(1)
  espacioId: number;

  @IsISO8601()
  inicio: string;

  @IsISO8601()
  fin: string;

  @IsEnum(['ninguna', 'diaria', 'semanal', 'mensual'])
  @IsOptional()
  tipoRecurrencia?: TipoRecurrencia;

  /** Obligatorio si tipoRecurrencia !== 'ninguna' */
  @ValidateIf((o: CrearReservaDto) => o.tipoRecurrencia != null && o.tipoRecurrencia !== 'ninguna')
  @IsISO8601()
  finRecurrencia?: string;
}
