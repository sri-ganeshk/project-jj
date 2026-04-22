import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Task, TaskDocument } from '../schemas/task.schema';
import { Resource, ResourceDocument } from '../schemas/resource.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = new this.projectModel({
      ...createProjectDto,
      startDate: new Date(createProjectDto.startDate),
      endDate: new Date(createProjectDto.endDate),
    });
    return project.save();
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const [tasks, resources] = await Promise.all([
      this.taskModel.find({ projectId: id }).exec(),
      this.resourceModel.find({ projectId: id }).exec(),
    ]);

    return {
      ...project.toObject(),
      id: String(project._id),
      tasks,
      resources,
    };
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const data: Record<string, unknown> = { ...updateProjectDto };
    if (updateProjectDto.startDate)
      data.startDate = new Date(updateProjectDto.startDate);
    if (updateProjectDto.endDate)
      data.endDate = new Date(updateProjectDto.endDate);

    const project = await this.projectModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.projectModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
