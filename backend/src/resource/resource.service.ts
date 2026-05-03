import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource, ResourceDocument } from '../schemas/resource.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createResourceDto: CreateResourceDto): Promise<Resource> {
    const resource = new this.resourceModel({
      ...createResourceDto,
      skillSet: createResourceDto.skillSet || '',
    });
    return resource.save();
  }

  async findAll(): Promise<Resource[]> {
    return this.resourceModel
      .find()
      .populate('projectId', 'name status')
      .exec();
  }

  async findByProject(projectId: string): Promise<Resource[]> {
    return this.resourceModel.find({ projectId }).exec();
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourceModel.findById(id).exec();
    if (!resource)
      throw new NotFoundException(`Resource with ID ${id} not found`);
    return resource;
  }

  async update(
    id: string,
    updateResourceDto: UpdateResourceDto,
  ): Promise<Resource> {
    const resource = await this.resourceModel
      .findByIdAndUpdate(id, { $set: updateResourceDto }, { new: true })
      .exec();
    if (!resource)
      throw new NotFoundException(`Resource with ID ${id} not found`);
    return resource;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.resourceModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }

  async getSuggestedResources(projectId: string): Promise<Resource[]> {
    // Get project to retrieve required skills
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Get all unassigned resources (no projectId)
    const unassignedResources = await this.resourceModel
      .find({ projectId: { $exists: false } })
      .exec();

    // If project has no required skills, return all unassigned resources
    if (!project.requiredSkills || project.requiredSkills.trim() === '') {
      return unassignedResources;
    }

    // Parse required skills from comma-separated string
    const requiredSkillsArray = project.requiredSkills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s);

    // Filter resources with matching skills
    const suggestedResources = unassignedResources.filter((resource) => {
      if (!resource.skillSet || resource.skillSet.trim() === '') {
        return false; // Skip resources with no skills
      }

      const resourceSkillsArray = resource.skillSet
        .split(',')
        .map((s) => s.trim().toLowerCase());

      // Check if resource has at least one matching required skill
      return requiredSkillsArray.some((skill) =>
        resourceSkillsArray.includes(skill),
      );
    });

    return suggestedResources;
  }
}
