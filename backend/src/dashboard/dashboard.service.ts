import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

export interface ResumenEspacio {
  id: number;
  nombre: string;
  tipo: string;
  totalReservas: number;
  minutosTotales: number;
  horasTotales: number;
}

export interface OcupacionCliente {
  clienteId: number;
  nombreCliente: string;
  totalReservas: number;
  horasTotales: number;
  usuariosActivos: number;
}

export interface HoraPico {
  hora: number;
  cantidad: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectEntityManager()
    private readonly em: EntityManager,
  ) {}

  async resumenCliente(
    clienteId: number,
    desde?: Date,
    hasta?: Date,
  ): Promise<{ masReservados: ResumenEspacio[]; menosReservados: ResumenEspacio[] }> {
    const qb = this.em
      .createQueryBuilder()
      .select('e.id', 'id')
      .addSelect('e.nombre', 'nombre')
      .addSelect('e.tipo', 'tipo')
      .addSelect('COUNT(r.id)', 'totalReservas')
      .addSelect('COALESCE(SUM(TIMESTAMPDIFF(MINUTE, r.inicio, r.fin)), 0)', 'minutosTotales')
      .from('reservas', 'r')
      .innerJoin('espacios', 'e', 'r.espacio_id = e.id')
      .innerJoin('usuarios', 'u', 'r.usuario_id = u.id')
      .where('u.cliente_id = :clienteId', { clienteId })
      .andWhere("r.estado = 'confirmada'")
      .groupBy('e.id')
      .addGroupBy('e.nombre')
      .addGroupBy('e.tipo')
      .orderBy('totalReservas', 'DESC');

    if (desde) qb.andWhere('r.inicio >= :desde', { desde });
    if (hasta) qb.andWhere('r.fin <= :hasta', { hasta });

    const raw = await qb.getRawMany<{
      id: string;
      nombre: string;
      tipo: string;
      totalReservas: string;
      minutosTotales: string;
    }>();

    const datos: ResumenEspacio[] = raw.map((r) => ({
      id: parseInt(r.id, 10),
      nombre: r.nombre,
      tipo: r.tipo,
      totalReservas: parseInt(r.totalReservas, 10),
      minutosTotales: parseInt(r.minutosTotales, 10),
      horasTotales: Math.round(parseInt(r.minutosTotales, 10) / 60 * 100) / 100,
    }));

    return {
      masReservados: datos.slice(0, 5),
      menosReservados: [...datos].reverse().slice(0, 5),
    };
  }

  async ocupacionGlobal(desde?: Date, hasta?: Date): Promise<OcupacionCliente[]> {
    const qb = this.em
      .createQueryBuilder()
      .select('u.cliente_id', 'clienteId')
      .addSelect('c.nombre', 'nombreCliente')
      .addSelect('COUNT(r.id)', 'totalReservas')
      .addSelect('COALESCE(SUM(TIMESTAMPDIFF(MINUTE, r.inicio, r.fin)) / 60, 0)', 'horasTotales')
      .addSelect(
        '(SELECT COUNT(*) FROM usuarios u2 WHERE u2.cliente_id = u.cliente_id AND u2.activo = 1)',
        'usuariosActivos',
      )
      .from('reservas', 'r')
      .innerJoin('usuarios', 'u', 'r.usuario_id = u.id')
      .innerJoin('clientes', 'c', 'u.cliente_id = c.id')
      .where("r.estado = 'confirmada'")
      .andWhere('u.cliente_id IS NOT NULL')
      .groupBy('u.cliente_id')
      .addGroupBy('c.nombre')
      .orderBy('horasTotales', 'DESC');

    if (desde) qb.andWhere('r.inicio >= :desde', { desde });
    if (hasta) qb.andWhere('r.fin <= :hasta', { hasta });

    const raw = await qb.getRawMany<{
      clienteId: string;
      nombreCliente: string;
      totalReservas: string;
      horasTotales: string;
      usuariosActivos: string;
    }>();

    return raw.map((r) => ({
      clienteId: parseInt(r.clienteId, 10),
      nombreCliente: r.nombreCliente,
      totalReservas: parseInt(r.totalReservas, 10),
      horasTotales: Math.round(parseFloat(r.horasTotales) * 100) / 100,
      usuariosActivos: parseInt(r.usuariosActivos, 10),
    }));
  }

  async horasPico(desde?: Date, hasta?: Date): Promise<HoraPico[]> {
    const qb = this.em
      .createQueryBuilder()
      .select('HOUR(r.inicio)', 'hora')
      .addSelect('COUNT(*)', 'cantidad')
      .from('reservas', 'r')
      .where("r.estado = 'confirmada'")
      .groupBy('HOUR(r.inicio)')
      .orderBy('cantidad', 'DESC');

    if (desde) qb.andWhere('r.inicio >= :desde', { desde });
    if (hasta) qb.andWhere('r.fin <= :hasta', { hasta });

    const raw = await qb.getRawMany<{ hora: string; cantidad: string }>();

    return raw.map((r) => ({
      hora: parseInt(r.hora, 10),
      cantidad: parseInt(r.cantidad, 10),
    }));
  }

  async asistenciaEmpleados(
    clienteId: number,
    desde?: Date,
    hasta?: Date,
  ): Promise<{ usuarioId: number; nombre: string; departamento: string | null; totalReservas: number; horasTotales: number }[]> {
    const qb = this.em
      .createQueryBuilder()
      .select('u.id', 'usuarioId')
      .addSelect('u.nombre', 'nombre')
      .addSelect('u.departamento', 'departamento')
      .addSelect('COUNT(r.id)', 'totalReservas')
      .addSelect('COALESCE(SUM(TIMESTAMPDIFF(MINUTE, r.inicio, r.fin)) / 60, 0)', 'horasTotales')
      .from('reservas', 'r')
      .innerJoin('usuarios', 'u', 'r.usuario_id = u.id')
      .where('u.cliente_id = :clienteId', { clienteId })
      .andWhere("r.estado = 'confirmada'")
      .groupBy('u.id')
      .addGroupBy('u.nombre')
      .addGroupBy('u.departamento')
      .orderBy('totalReservas', 'DESC');

    if (desde) qb.andWhere('r.inicio >= :desde', { desde });
    if (hasta) qb.andWhere('r.fin <= :hasta', { hasta });

    const raw = await qb.getRawMany<{
      usuarioId: string;
      nombre: string;
      departamento: string | null;
      totalReservas: string;
      horasTotales: string;
    }>();

    return raw.map((r) => ({
      usuarioId: parseInt(r.usuarioId, 10),
      nombre: r.nombre,
      departamento: r.departamento,
      totalReservas: parseInt(r.totalReservas, 10),
      horasTotales: Math.round(parseFloat(r.horasTotales) * 100) / 100,
    }));
  }

  async exportarCsvCliente(clienteId: number, desde?: Date, hasta?: Date): Promise<string> {
    const { masReservados } = await this.resumenCliente(clienteId, desde, hasta);

    // Obtener todos los datos (sin límite de top 5)
    const qb = this.em
      .createQueryBuilder()
      .select('e.nombre', 'nombre')
      .addSelect('e.tipo', 'tipo')
      .addSelect('COUNT(r.id)', 'totalReservas')
      .addSelect('COALESCE(SUM(TIMESTAMPDIFF(MINUTE, r.inicio, r.fin)), 0)', 'minutosTotales')
      .from('reservas', 'r')
      .innerJoin('espacios', 'e', 'r.espacio_id = e.id')
      .innerJoin('usuarios', 'u', 'r.usuario_id = u.id')
      .where('u.cliente_id = :clienteId', { clienteId })
      .andWhere("r.estado = 'confirmada'")
      .groupBy('e.id')
      .addGroupBy('e.nombre')
      .addGroupBy('e.tipo')
      .orderBy('totalReservas', 'DESC');

    if (desde) qb.andWhere('r.inicio >= :desde', { desde });
    if (hasta) qb.andWhere('r.fin <= :hasta', { hasta });

    const raw = await qb.getRawMany<{
      nombre: string;
      tipo: string;
      totalReservas: string;
      minutosTotales: string;
    }>();

    void masReservados;

    const header = '"Espacio","Tipo","Total Reservas","Horas Totales"';
    const filas = raw.map((r) => {
      const horas = (parseInt(r.minutosTotales, 10) / 60).toFixed(2);
      return `"${r.nombre}","${r.tipo}",${r.totalReservas},${horas}`;
    });

    return [header, ...filas].join('\n');
  }
}
