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

  async attachResource(
    projectId: string,
    resourceId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify project exists
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Verify resource exists
    const resource = await this.resourceModel.findById(resourceId).exec();
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    // Check if resource is already assigned to another project
    if (
      resource.projectId &&
      resource.projectId.toString() !== projectId.toString()
    ) {
      throw new Error(
        `Resource is already assigned to another project. Please detach it first.`,
      );
    }

    // Assign resource to project
    await this.resourceModel.findByIdAndUpdate(
      resourceId,
      { projectId },
      { new: true },
    );

    return {
      success: true,
      message: `Resource assigned to project successfully`,
    };
  }

  async detachResource(
    projectId: string,
    resourceId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify project exists
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Verify resource exists and is assigned to this project
    const resource = await this.resourceModel.findById(resourceId).exec();
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    if (!resource.projectId || resource.projectId.toString() !== projectId) {
      throw new Error(
        `Resource is not assigned to this project or already unassigned`,
      );
    }

    // Detach resource from project (set projectId to null)
    await this.resourceModel.findByIdAndUpdate(
      resourceId,
      { $unset: { projectId: 1 } },
      { new: true },
    );

    return {
      success: true,
      message: `Resource detached from project successfully`,
    };
  }
}
