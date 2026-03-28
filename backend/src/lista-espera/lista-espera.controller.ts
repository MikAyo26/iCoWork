import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ListaEsperaService } from './lista-espera.service';
import { UnirseListaEsperaDto } from './dto/unirse-lista-espera.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator';
import { UsuarioAutenticado } from '../auth/estrategias/jwt.estrategia';

@UseGuards(JwtAuthGuard)
@Controller('lista-espera')
export class ListaEsperaController {
  constructor(private readonly listaEsperaService: ListaEsperaService) {}

  /** POST /api/lista-espera — cualquier usuario autenticado */
  @Post()
  unirse(
    @Body() dto: UnirseListaEsperaDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.listaEsperaService.unirse(
      usuario.id,
      dto.espacioId,
      new Date(dto.fechaDeseada),
    );
  }

  /** GET /api/lista-espera/mia — entradas propias */
  @Get('mia')
  buscarMia(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.listaEsperaService.buscarPorUsuario(usuario.id);
  }

  /** DELETE /api/lista-espera/:id — eliminar propia entrada */
  @Delete(':id')
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.listaEsperaService.eliminar(id, usuario.id);
  }
}
