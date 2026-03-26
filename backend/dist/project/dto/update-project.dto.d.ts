import { CreateProjectDto } from './create-project.dto';
declare const UpdateProjectDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateProjectDto>>;
export declare class UpdateProjectDto extends UpdateProjectDto_base {
    name?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    budget?: number;
}
export {};
