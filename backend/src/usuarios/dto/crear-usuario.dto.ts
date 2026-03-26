import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CrearUsuarioDto {
  @IsOptional()
  clienteId?: number;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsEmail()
  correo: string;

  @IsNotEmpty()
  @MinLength(8)
  contrasena: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsEnum(['superadmin', 'admin', 'empleado'])
  rol?: 'superadmin' | 'admin' | 'empleado';
}
