import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entidades/cliente.entidad';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

/**
 * Servicio que encapsula la lógica de negocio del módulo clientes.
 */
@Injectable()
export class ClientesService {
    constructor(
    /** Repositorio TypeORM inyectado para la entidad Cliente */
    @InjectRepository(Cliente)
    private readonly clientesRepo: Repository<Cliente>,
    ) {}

    /**
    * Crea un nuevo cliente.
    * Verifica que el correo no esté ya registrado.
    * @param dto Datos del cliente a crear
    * @throws ConflictException si el correo ya existe
    */
    async crear(dto: CrearClienteDto): Promise<Cliente> {
    const existe = await this.clientesRepo.findOneBy({ correo: dto.correo });
    if (existe) throw new ConflictException('El correo ya está registrado');
    const cliente = this.clientesRepo.create(dto);
    return this.clientesRepo.save(cliente);
    }

    /**
     * Devuelve todos los clientes con sus usuarios asociados.
     */
    async buscarTodos(): Promise<Cliente[]> {
    return this.clientesRepo.find({ relations: ['usuarios'] });
    }

    /**
     * Busca un cliente por su ID.
     * @param id Identificador del cliente
     * @throws NotFoundException si no se encuentra
     */
    async buscarPorId(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepo.findOne({
        where: { id },
        relations: ['usuarios'],
    });
    if (!cliente) throw new NotFoundException(`Cliente #${id} no encontrado`);
    return cliente;
    }

    /**
     * Actualiza parcialmente un cliente existente.
     * @param id Identificador del cliente
     * @param dto Campos a actualizar
     * @throws NotFoundException si no se encuentra
     */
    async actualizar(id: number, dto: ActualizarClienteDto): Promise<Cliente> {
    const cliente = await this.buscarPorId(id);
    Object.assign(cliente, dto);
    return this.clientesRepo.save(cliente);
    }

    /**
     * Elimina un cliente de la base de datos.
     * @param id Identificador del cliente
     * @throws NotFoundException si no se encuentra
     */
    async eliminar(id: number): Promise<void> {
    const cliente = await this.buscarPorId(id);
    await this.clientesRepo.remove(cliente);
    }
}