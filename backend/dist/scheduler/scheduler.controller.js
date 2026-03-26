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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerController = void 0;
const common_1 = require("@nestjs/common");
const scheduler_service_1 = require("./scheduler.service");
let SchedulerController = class SchedulerController {
    schedulerService;
    constructor(schedulerService) {
        this.schedulerService = schedulerService;
    }
    optimizeSchedule(projectId) {
        return this.schedulerService.optimizeSchedule(projectId);
    }
};
exports.SchedulerController = SchedulerController;
__decorate([
    (0, common_1.Post)('optimize/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "optimizeSchedule", null);
exports.SchedulerController = SchedulerController = __decorate([
    (0, common_1.Controller)('api/v1/scheduler'),
    __metadata("design:paramtypes", [scheduler_service_1.SchedulerService])
], SchedulerController);
//# sourceMappingURL=scheduler.controller.js.map