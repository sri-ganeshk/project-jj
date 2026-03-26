import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResourceService {
  constructor(private prisma: PrismaService) {}

  async create(createResourceDto: CreateResourceDto) {
    const data = {
      ...createResourceDto,
      skillSet: createResourceDto.skillSet || '',
    };
    return this.prisma.resource.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.resource.findMany({ include: { project: true } });
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });
    if (!resource)
      throw new NotFoundException(`Resource with ID ${id} not found`);
    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto) {
    return this.prisma.resource.update({
      where: { id },
      data: updateResourceDto,
    });
  }

  async remove(id: string) {
    return this.prisma.resource.delete({
      where: { id },
    });
  }
}
