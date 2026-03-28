import { IsEnum, IsInt, IsString, Min } from 'class-validator';
import type { TipoNotificacion } from '../entidades/notificacion.entidad';

export class CrearNotificacionDto {
  @IsInt()
  @Min(1)
  usuarioId: number;

  @IsEnum(['reserva_confirmada', 'reserva_cancelada', 'espera_disponible', 'recibo_pago'])
  tipo: TipoNotificacion;

  @IsString()
  titulo: string;

  @IsString()
  cuerpo: string;
}
