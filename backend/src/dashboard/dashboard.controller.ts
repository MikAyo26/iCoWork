import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decoradores/roles.decorator';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator';
import { UsuarioAutenticado } from '../auth/estrategias/jwt.estrategia';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /api/dashboard/cliente/:id
   * Admin puede ver solo su propio cliente.
   */
  @Roles('superadmin', 'admin')
  @Get('cliente/:id')
  resumenCliente(
    @Param('id', ParseIntPipe) clienteId: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Query('desde') desdeStr?: string,
    @Query('hasta') hastaStr?: string,
  ) {
    if (usuario.rol === 'admin' && usuario.clienteId !== clienteId) {
      return { masReservados: [], menosReservados: [] };
    }
    const desde = desdeStr ? new Date(desdeStr) : undefined;
    const hasta = hastaStr ? new Date(hastaStr) : undefined;
    return this.dashboardService.resumenCliente(clienteId, desde, hasta);
  }

  /** GET /api/dashboard/global — superadmin */
  @Roles('superadmin')
  @Get('global')
  ocupacionGlobal(
    @Query('desde') desdeStr?: string,
    @Query('hasta') hastaStr?: string,
  ) {
    const desde = desdeStr ? new Date(desdeStr) : undefined;
    const hasta = hastaStr ? new Date(hastaStr) : undefined;
    return this.dashboardService.ocupacionGlobal(desde, hasta);
  }

  /** GET /api/dashboard/horas-pico — superadmin */
  @Roles('superadmin')
  @Get('horas-pico')
  horasPico(
    @Query('desde') desdeStr?: string,
    @Query('hasta') hastaStr?: string,
  ) {
    const desde = desdeStr ? new Date(desdeStr) : undefined;
    const hasta = hastaStr ? new Date(hastaStr) : undefined;
    return this.dashboardService.horasPico(desde, hasta);
  }

  /** GET /api/dashboard/cliente/:id/asistencia — admin o superadmin */
  @Roles('superadmin', 'admin')
  @Get('cliente/:id/asistencia')
  asistencia(
    @Param('id', ParseIntPipe) clienteId: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Query('desde') desdeStr?: string,
    @Query('hasta') hastaStr?: string,
  ) {
    if (usuario.rol === 'admin' && usuario.clienteId !== clienteId) return [];
    const desde = desdeStr ? new Date(desdeStr) : undefined;
    const hasta = hastaStr ? new Date(hastaStr) : undefined;
    return this.dashboardService.asistenciaEmpleados(clienteId, desde, hasta);
  }

  /** GET /api/dashboard/cliente/:id/exportar — admin o superadmin, descarga CSV */
  @Roles('superadmin', 'admin')
  @Get('cliente/:id/exportar')
  async exportarCsv(
    @Param('id', ParseIntPipe) clienteId: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Res() res: Response,
    @Query('desde') desdeStr?: string,
    @Query('hasta') hastaStr?: string,
  ) {
    if (usuario.rol === 'admin' && usuario.clienteId !== clienteId) {
      res.status(403).send();
      return;
    }
    const desde = desdeStr ? new Date(desdeStr) : undefined;
    const hasta = hastaStr ? new Date(hastaStr) : undefined;
    const csv = await this.dashboardService.exportarCsvCliente(clienteId, desde, hasta);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=dashboard_cliente_${clienteId}.csv`);
    res.send(csv);
  }
}
