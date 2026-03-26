import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entidades/usuario.entidad';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async crear(dto: CrearUsuarioDto): Promise<Usuario> {
    const existe = await this.usuariosRepo.findOneBy({ correo: dto.correo });
    if (existe) throw new ConflictException('El correo ya está registrado');

    const hash = await bcrypt.hash(dto.contrasena, 10);
    const usuario = this.usuariosRepo.create({
      ...dto,
      contrasenaHash: hash,
    });
    return this.usuariosRepo.save(usuario);
  }

  async buscarTodos(): Promise<Usuario[]> {
    return this.usuariosRepo.find({ relations: ['cliente'] });
  }

  async buscarPorId(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepo.findOne({
      where: { id },
      relations: ['cliente'],
    });
    if (!usuario) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return usuario;
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    return this.usuariosRepo
      .createQueryBuilder('usuario')
      .addSelect('usuario.contrasenaHash')
      .where('usuario.correo = :correo', { correo })
      .getOne();
  }

  async actualizar(id: number, dto: ActualizarUsuarioDto): Promise<Usuario> {
    const usuario = await this.buscarPorId(id);
    const { contrasena, ...resto } = dto as ActualizarUsuarioDto & {
      contrasena?: string;
    };
    if (contrasena) {
      usuario.contrasenaHash = await bcrypt.hash(contrasena, 10);
    }
    Object.assign(usuario, resto);
    return this.usuariosRepo.save(usuario);
  }

  async eliminar(id: number): Promise<void> {
    const usuario = await this.buscarPorId(id);
    await this.usuariosRepo.remove(usuario);
  }
}
