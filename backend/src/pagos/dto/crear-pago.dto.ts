import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/**
 * DTO para el registro de un nuevo pago.
 * suscripcionId y reservaId son opcionales — el pago puede ser manual.
 */
export class CrearPagoDto {
  /** ID del usuario al que pertenece el pago */
  @IsInt()
  @Min(1)
  usuarioId: number;

  /** ID de la suscripción asociada. Opcional */
  @IsInt()
  @Min(1)
  @IsOptional()
  suscripcionId?: number;

  /** ID de la reserva asociada. Opcional */
  @IsInt()
  @Min(1)
  @IsOptional()
  reservaId?: number;

  /** Importe del pago */
  @IsNumber()
  @Min(0.01)
  importe: number;

  /** Moneda del pago. Por defecto EUR */
  @IsString()
  @IsOptional()
  moneda?: string;

  /** Método de pago. Ej: tarjeta, transferencia */
  @IsString()
  @IsOptional()
  metodo?: string;

  /** Referencia externa del pago. Ej: ID de Stripe */
  @IsString()
  @IsOptional()
  referenciaExterna?: string;
}