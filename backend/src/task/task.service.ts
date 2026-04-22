import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = new this.taskModel({
      ...createTaskDto,
      dueDate: new Date(createTaskDto.dueDate),
    });
    return task.save();
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().populate('assignedTo', 'name role').exec();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel
      .findById(id)
      .populate('assignedTo', 'name role')
      .exec();
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  async findByProject(projectId: string): Promise<Task[]> {
    return this.taskModel
      .find({ projectId })
      .populate('assignedTo', 'name role')
      .exec();
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const data: Record<string, unknown> = { ...updateTaskDto };
    if (updateTaskDto.dueDate) data.dueDate = new Date(updateTaskDto.dueDate);

    const task = await this.taskModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.taskModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
