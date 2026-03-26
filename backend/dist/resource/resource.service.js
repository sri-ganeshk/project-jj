"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ResourceService = class ResourceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createResourceDto) {
        const data = {
            ...createResourceDto,
            skillSet: createResourceDto.skillSet || '',
        };
        return this.prisma.resource.create({
            data,
        });
    }
    async findAll() {
        return this.prisma.resource.findMany({ include: { project: true } });
    }
    async findOne(id) {
        const resource = await this.prisma.resource.findUnique({
            where: { id },
        });
        if (!resource)
            throw new common_1.NotFoundException(`Resource with ID ${id} not found`);
        return resource;
    }
    async update(id, updateResourceDto) {
        return this.prisma.resource.update({
            where: { id },
            data: updateResourceDto,
        });
    }
    async remove(id) {
        return this.prisma.resource.delete({
            where: { id },
        });
    }
};
exports.ResourceService = ResourceService;
exports.ResourceService = ResourceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResourceService);
//# sourceMappingURL=resource.service.js.map