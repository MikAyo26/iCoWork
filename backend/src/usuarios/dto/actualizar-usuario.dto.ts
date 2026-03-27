import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * DTO para la actualización parcial de un usuario.
 * Todos los campos son opcionales, solo se actualizan los que se envíen.
 * 
 */
export class ActualizarUsuarioDto {
  /** Nuevo ID de cliente asociado. Opcional */
  @IsOptional()
  clienteId?: number;

  /** Nuevo nombre completo. Opcional */
  @IsOptional()
  @IsString()
  nombre?: string;

  /** Nuevo correo electrónico válido. Opcional */
  @IsOptional()
  @IsEmail()
  correo?: string;

  /** Nueva contraseña en texto plano. Mínimo 8 caracteres. Se hashea antes de persistir */
  @IsOptional()
  @MinLength(8)
  contrasena?: string;

  /** Nuevo departamento. Opcional */
  @IsOptional()
  @IsString()
  departamento?: string;

  /** Nuevo rol del usuario. Opcional */
  @IsOptional()
  @IsEnum(['superadmin', 'admin', 'empleado'])
  rol?: 'superadmin' | 'admin' | 'empleado';
}