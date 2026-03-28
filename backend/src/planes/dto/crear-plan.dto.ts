import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsInt } from 'class-validator';

export class CrearPlanDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @Min(0)
  precioMensual: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxUsuarios?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
