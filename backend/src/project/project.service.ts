import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        startDate: new Date(createProjectDto.startDate),
        endDate: new Date(createProjectDto.endDate),
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany();
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { tasks: true, resources: true },
    });
    if (!project)
      throw new NotFoundException(`Project with ID ${id} not found`);
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const data = {
      ...updateProjectDto,
      ...(updateProjectDto.startDate && {
        startDate: new Date(updateProjectDto.startDate),
      }),
      ...(updateProjectDto.endDate && {
        endDate: new Date(updateProjectDto.endDate),
      }),
    };

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
