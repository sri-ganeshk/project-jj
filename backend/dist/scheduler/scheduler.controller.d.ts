import { SchedulerService } from './scheduler.service';
export declare class SchedulerController {
    private readonly schedulerService;
    constructor(schedulerService: SchedulerService);
    optimizeSchedule(projectId: string): Promise<{
        projectId: string;
        optimizedSchedule: {
            taskId: string;
            suggestedStartDate: string;
            suggestedResource: string;
        }[];
        conflicts: unknown[];
    }>;
}
