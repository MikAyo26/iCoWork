import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

/**
 * Gateway de WebSockets.
 * Gestiona conexiones en tiempo real para disponibilidad de espacios
 * y notificaciones de lista de espera.
 */
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/ws' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify<{ sub: number }>(token);
      await client.join(`usuario:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {
    // Cleanup automático gestionado por socket.io
  }

  /** El cliente solicita suscribirse a actualizaciones de un espacio */
  @SubscribeMessage('espacio:suscribir')
  async suscribirEspacio(
    @MessageBody() espacioId: number,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`espacio:${espacioId}`);
    return { suscrito: true, espacioId };
  }

  /** Emite a todos los suscritos de un espacio que su disponibilidad cambió */
  emitirDisponibilidadCambiada(espacioId: number, disponible: boolean) {
    this.server.to(`espacio:${espacioId}`).emit('disponibilidad:cambio', { espacioId, disponible });
  }

  /** Emite al usuario específico que un espacio de su lista de espera está libre */
  emitirListaEsperaNotificacion(usuarioId: number, payload: { espacioId: number; fecha: Date }) {
    this.server.to(`usuario:${usuarioId}`).emit('espera:disponible', payload);
  }
}
