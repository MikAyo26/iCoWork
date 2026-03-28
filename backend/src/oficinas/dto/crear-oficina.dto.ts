import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class CrearOficinaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @IsNotEmpty()
  ciudad: string;

  @IsString()
  @IsOptional()
  pais?: string;

  @IsInt()
  @Min(0)
  totalPuestos: number;
}
