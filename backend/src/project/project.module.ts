import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Task, TaskSchema } from '../schemas/task.schema';
import { Resource, ResourceSchema } from '../schemas/resource.schema';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Resource.name, schema: ResourceSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [MongooseModule],
})
export class ProjectModule {}
