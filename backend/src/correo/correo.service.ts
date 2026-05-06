import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class CorreoService {
  private readonly logger = new Logger(CorreoService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.from = this.config.get<string>(
      'MAIL_FROM',
      'iCoWork <onboarding@resend.dev>',
    );
  }

  async enviarConfirmacionPago(
    destinatario: { nombre: string; correo: string },
    pago: { id: number; importe: number; moneda: string; pagadoEn: Date },
  ): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: destinatario.correo,
        subject: `iCoWork — Confirmación de pago #${pago.id}`,
        html: `
          <h2>Pago confirmado</h2>
          <p>Hola ${destinatario.nombre},</p>
          <p>Tu pago ha sido procesado correctamente.</p>
          <ul>
            <li><strong>Referencia:</strong> #${pago.id}</li>
            <li><strong>Importe:</strong> ${pago.importe} ${pago.moneda}</li>
            <li><strong>Fecha:</strong> ${pago.pagadoEn.toLocaleString('es-ES')}</li>
          </ul>
          <p>Gracias por usar iCoWork.</p>
        `,
      });
      if (error) {
        this.logger.error(
          `Error enviando email de pago a ${destinatario.correo}: ${error.message}`,
        );
      } else {
        this.logger.log(`Email de pago enviado a ${destinatario.correo}`);
      }
    } catch (error) {
      this.logger.error(
        `Error enviando email de pago a ${destinatario.correo}: ${error}`,
      );
    }
  }

  async enviarConfirmacionReserva(
    destinatario: { nombre: string; correo: string },
    reserva: { id: number; espacioNombre: string; inicio: Date; fin: Date },
  ): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: destinatario.correo,
        subject: `iCoWork — Reserva confirmada #${reserva.id}`,
        html: `
          <h2>Reserva confirmada</h2>
          <p>Hola ${destinatario.nombre},</p>
          <p>Tu reserva ha sido confirmada.</p>
          <ul>
            <li><strong>Espacio:</strong> ${reserva.espacioNombre}</li>
            <li><strong>Inicio:</strong> ${reserva.inicio.toLocaleString('es-ES')}</li>
            <li><strong>Fin:</strong> ${reserva.fin.toLocaleString('es-ES')}</li>
          </ul>
          <p>Gracias por usar iCoWork.</p>
        `,
      });
      if (error) {
        this.logger.error(
          `Error enviando email de reserva a ${destinatario.correo}: ${error.message}`,
        );
      } else {
        this.logger.log(`Email de reserva enviado a ${destinatario.correo}`);
      }
    } catch (error) {
      this.logger.error(
        `Error enviando email de reserva a ${destinatario.correo}: ${error}`,
      );
    }
  }
}
