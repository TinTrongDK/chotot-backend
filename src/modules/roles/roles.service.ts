import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    return await this.prismaService.role.create({
      data: {
        name: createRoleDto.name,
        permissions: {
          create: createRoleDto.permissions,
        },
      },
    });
  }

  findAll() {
    return `This action returns all roles`;
  }

  async findOne(id: number) {
    return await this.prismaService.role.findUnique({
      where: { id: id },
      include: { permissions: true },
    });
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return 'Update Role';
    /* return await this.prismaService.role.update({
      where: {id: id},
      data: {
        name: updateRoleDto.name,
        permissions: {
          create: updateRoleDto.permissions
        }
      }
    }); */
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
