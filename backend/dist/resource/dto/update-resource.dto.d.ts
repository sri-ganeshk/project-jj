import { CreateResourceDto } from './create-resource.dto';
declare const UpdateResourceDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateResourceDto>>;
export declare class UpdateResourceDto extends UpdateResourceDto_base {
    name?: string;
    role?: string;
    availabilityHours?: number;
    skillSet?: string;
}
export {};
