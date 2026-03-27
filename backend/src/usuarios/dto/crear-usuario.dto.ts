import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * DTO para la creación de un nuevo usuario.
 * Define y valida los campos requeridos y opcionales en el body de la petición.
 */
export class CrearUsuarioDto {
  /** ID del cliente al que pertenece el usuario. Omitir si es superadmin interno */
  @IsOptional()
  clienteId?: number;

  /** Nombre completo del usuario. Campo obligatorio */
  @IsNotEmpty()
  @IsString()
  nombre: string;

  /** Correo electrónico válido. Se usa como identificador único de login */
  @IsEmail()
  correo: string;

  /** Contraseña en texto plano. Mínimo 8 caracteres. Se hashea antes de persistir */
  @IsNotEmpty()
  @MinLength(8)
  contrasena: string;

  /** Departamento del usuario dentro de su empresa. Opcional */
  @IsOptional()
  @IsString()
  departamento?: string;

  /** Rol asignado al usuario. Por defecto 'empleado' si no se especifica */
  @IsOptional()
  @IsEnum(['superadmin', 'admin', 'empleado'])
  rol?: 'superadmin' | 'admin' | 'empleado';
}