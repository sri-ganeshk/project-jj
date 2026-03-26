import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        dueDate: new Date(createTaskDto.dueDate),
      },
    });
  }

  async findAll() {
    return this.prisma.task.findMany({
      include: { resource: true },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        dependencies: true,
        dependentOn: true,
        resource: true,
        history: true,
      },
    });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const data = {
      ...updateTaskDto,
      ...(updateTaskDto.dueDate && {
        dueDate: new Date(updateTaskDto.dueDate),
      }),
    };

    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
