import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class ActualizarUsuarioDto {
  @IsOptional()
  clienteId?: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @MinLength(8)
  contrasena?: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsEnum(['superadmin', 'admin', 'empleado'])
  rol?: 'superadmin' | 'admin' | 'empleado';
}
