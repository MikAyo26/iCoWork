import { IsString, IsNotEmpty, IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import type { TipoEspacio } from '../entidades/espacio.entidad';

export class CrearEspacioDto {
  @IsInt()
  @Min(1)
  oficinaId: number;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(['puesto', 'sala_juntas', 'cabina', 'otro'])
  @IsOptional()
  tipo?: TipoEspacio;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacidad?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
