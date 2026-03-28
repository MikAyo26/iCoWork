import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Al menos uno de suscripcionId o reservaId debe estar presente */
@ValidatorConstraint({ name: 'tieneReferencia', async: false })
class TieneReferenciaConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments) {
    const obj = args.object as CrearPagoDto;
    return !!(obj.suscripcionId || obj.reservaId);
  }
  defaultMessage() {
    return 'Debe especificarse suscripcionId o reservaId';
  }
}

export class CrearPagoDto {
  @IsInt()
  @Min(1)
  usuarioId: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  suscripcionId?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  reservaId?: number;

  @IsNumber()
  @Min(0.01)
  importe: number;

  @IsString()
  @IsOptional()
  moneda?: string;

  @IsString()
  @IsOptional()
  metodo?: string;

  @IsString()
  @IsOptional()
  referenciaExterna?: string;

  @Validate(TieneReferenciaConstraint)
  _validacionReferencia?: unknown;
}
