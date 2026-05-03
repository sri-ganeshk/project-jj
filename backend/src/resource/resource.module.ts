import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Resource, ResourceSchema } from '../schemas/resource.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [ResourceController],
  providers: [ResourceService],
  exports: [MongooseModule],
})
export class ResourceModule {}
