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

/**
 * Servicio que encapsula la lógica de negocio del módulo usuarios.
 * Gestiona operaciones CRUD e interactúa con el repositorio de TypeORM.
 */
@Injectable()
export class UsuariosService {
  constructor(
    /** Repositorio TypeORM inyectado para la entidad Usuario */
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  /**
   * Crea un nuevo usuario en la base de datos.
   * Verifica que el correo no esté ya registrado y hashea la contraseña.
   * @param dto Datos del usuario a crear
   * @throws ConflictException si el correo ya existe
   */
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

  /**
   * Devuelve todos los usuarios junto con la relación de su cliente.
   * Usado por superadmin para ver todos los usuarios del sistema.
   */
  async buscarTodos(): Promise<Usuario[]> {
    return this.usuariosRepo.find({ relations: ['cliente'] });
  }

  /**
   * Devuelve los usuarios de un cliente específico más los superadmins.
   * Usado por admin para ver sus empleados y poder contactar con soporte.
   * @param clienteId Identificador del cliente
   */
  async buscarPorCliente(clienteId: number): Promise<Usuario[]> {
    return this.usuariosRepo
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.cliente', 'cliente')
      .where('usuario.cliente_id = :clienteId', { clienteId })
      .orWhere('usuario.rol = :rol', { rol: 'superadmin' })
      .orderBy('usuario.rol', 'ASC')
      .getMany();
  }

  /**
   * Busca un usuario por su ID incluyendo la relación con el cliente.
   * @param id Identificador del usuario
   * @throws NotFoundException si no se encuentra el usuario
   */
  async buscarPorId(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepo.findOne({
      where: { id },
      relations: ['cliente'],
    });
    if (!usuario) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return usuario;
  }

  /**
   * Busca un usuario por correo incluyendo el hash de contraseña.
   * Usado internamente por el módulo de autenticación.
   * @param correo Correo electrónico del usuario
   */
  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    return this.usuariosRepo
      .createQueryBuilder('usuario')
      .addSelect('usuario.contrasenaHash') // se incluye explicitamente por select:false
      .where('usuario.correo = :correo', { correo })
      .getOne();
  }

  /**
   * Actualiza parcialmente un usuario existente.
   * Si se envía nueva contraseña, se hashea antes de persistir.
   * @param id Identificador del usuario a actualizar
   * @param dto Campos a actualizar
   * @throws NotFoundException si no se encuentra el usuario
   */
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

  /**
   * Elimina un usuario de la base de datos.
   * @param id Identificador del usuario a eliminar
   * @throws NotFoundException si no se encuentra el usuario
   */
  async eliminar(id: number): Promise<void> {
    const usuario = await this.buscarPorId(id);
    await this.usuariosRepo.remove(usuario);
  }
}