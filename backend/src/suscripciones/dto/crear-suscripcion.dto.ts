import { IsInt, IsISO8601, IsOptional, Min } from 'class-validator';

export class CrearSuscripcionDto {
  @IsInt()
  @Min(1)
  clienteId: number;

  @IsInt()
  @Min(1)
  planId: number;

  @IsISO8601()
  @IsOptional()
  fechaInicio?: string;
}
