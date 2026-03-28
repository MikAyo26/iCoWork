import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO para la creación de un nuevo cliente.
 */
export class CrearClienteDto {
  /** Nombre de la empresa o autónomo. Obligatorio */
    @IsNotEmpty()
    @IsString()
    nombre: string;

  /** Correo electrónico único de contacto. Obligatorio */
    @IsEmail()
    correo: string;

  /** Teléfono de contacto. Opcional */
    @IsOptional()
    @IsString()
    telefono?: string;
}