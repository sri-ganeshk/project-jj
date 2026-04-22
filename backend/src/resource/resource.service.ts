import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource, ResourceDocument } from '../schemas/resource.schema';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
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
}
