import { IsEmail, IsString, MinLength } from 'class-validator';

/** DTO para el endpoint de login */
export class LoginDto {
  @IsEmail({}, { message: 'El correo debe ser una dirección de email válida' })
  correo: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena: string;
}
