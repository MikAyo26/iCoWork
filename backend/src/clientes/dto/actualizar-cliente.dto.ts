import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * DTO para la actualización parcial de un cliente.
 * Todos los campos son opcionales.
 */
export class ActualizarClienteDto {
  /** Nuevo nombre. Opcional */
    @IsOptional()
    @IsString()
    nombre?: string;

  /** Nuevo correo electrónico. Opcional */
    @IsOptional()
    @IsEmail()
    correo?: string;

  /** Nuevo teléfono. Opcional */
    @IsOptional()
    @IsString()
    telefono?: string;
}