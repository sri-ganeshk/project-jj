import { ReportService } from './report.service';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    generateReport(projectId: string): Promise<Record<string, unknown>>;
}
