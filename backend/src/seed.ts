import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from './schemas/project.schema';
import { Task } from './schemas/task.schema';
import { Resource } from './schemas/resource.schema';
import { RiskPrediction } from './schemas/risk-prediction.schema';

const ROLES = [
  'Frontend Engineer', 'Backend Engineer', 'DevOps Engineer', 
  'QA Tester', 'Product Manager', 'UX Designer', 'Data Scientist',
  'Scrum Master', 'Technical Writer', 'Database Admin'
];

const SKILLSETS = [
  'React, TypeScript, CSS', 'Node.js, MongoDB, NestJS', 'AWS, Docker, CI/CD',
  'Selenium, Jest, Cypress', 'Agile, Roadmap Planning', 'Figma, User Research',
  'Python, TensorFlow, SQL', 'Scrum, Agile, Leadership', 'Markdown, Docusaurus',
  'PostgreSQL, Redis, MongoDB'
];

const NAMES = [
  'Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Prince', 'Evan Wright',
  'Fiona Gallagher', 'George Miller', 'Hannah Abbott', 'Ian Malcolm', 'Julia Roberts',
  'Kevin Spacey', 'Laura Dern', 'Michael Scott', 'Nina Dobrev', 'Oscar Isaac',
  'Pam Beesly', 'Quinn Fabray', 'Rachel Green', 'Steve Rogers', 'Tony Stark',
  'Uma Thurman', 'Victor Stone', 'Wanda Maximoff', 'Xander Cage', 'Yelena Belova'
];

const TASK_TITLES = [
  'Setup CI/CD Pipeline', 'Design Landing Page', 'Implement Auth API',
  'Write Unit Tests', 'Optimize Database Queries', 'Conduct User Interviews',
  'Create Wireframes', 'Setup Redux Store', 'Fix Login Bug',
  'Update Documentation', 'Migrate to TypeScript', 'Configure Webpack',
  'Develop Dashboard UI', 'Integrate Payment Gateway', 'Setup Monitoring',
  'Review Pull Requests', 'Plan Sprint 2', 'Create Logo',
  'Write E2E Tests', 'Deploy to Staging', 'Analyze User Feedback',
  'Refactor Legacy Code', 'Setup CI/CD Pipeline', 'Design Landing Page',
  'Implement Auth API', 'Write Unit Tests', 'Optimize Database Queries',
  'Conduct User Interviews', 'Create Wireframes', 'Setup Redux Store',
  'Fix Login Bug', 'Update Documentation', 'Migrate to TypeScript',
  'Configure Webpack', 'Develop Dashboard UI', 'Integrate Payment Gateway',
  'Setup Monitoring', 'Review Pull Requests', 'Plan Sprint 2',
  'Create Logo', 'Write E2E Tests', 'Deploy to Staging',
  'Analyze User Feedback', 'Refactor Legacy Code'
];

const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const projectModel = app.get<Model<Project>>(getModelToken(Project.name));
  const taskModel = app.get<Model<Task>>(getModelToken(Task.name));
  const resourceModel = app.get<Model<Resource>>(getModelToken(Resource.name));
  const riskModel = app.get<Model<RiskPrediction>>(getModelToken(RiskPrediction.name));

  console.log('Clearing old data...');
  await Promise.all([
    projectModel.deleteMany({}),
    taskModel.deleteMany({}),
    resourceModel.deleteMany({}),
    riskModel.deleteMany({}),
  ]);

  console.log('Creating 3 projects...');
  const projects = await projectModel.create([
    {
      name: 'Project Alpha: E-Commerce Relaunch',
      status: 'Active',
      budget: 120000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 86_400_000),
    },
    {
      name: 'Project Beta: Internal HR Tool',
      status: 'Planning',
      budget: 45000,
      startDate: new Date(Date.now() + 15 * 86_400_000),
      endDate: new Date(Date.now() + 120 * 86_400_000),
    },
    {
      name: 'Project Gamma: Mobile App V2',
      status: 'Active',
      budget: 200000,
      startDate: new Date(Date.now() - 30 * 86_400_000),
      endDate: new Date(Date.now() + 60 * 86_400_000),
    }
  ]);

  console.log('Creating resources for each project...');
  const allResources: any[] = [];
  
  for (const project of projects) {
    const numResources = getRandomInt(5, 10);
    for (let i = 0; i < numResources; i++) {
      const roleIndex = getRandomInt(0, ROLES.length - 1);
      const res = await resourceModel.create({
        projectId: project._id.toString(),
        name: getRandomItem(NAMES),
        role: ROLES[roleIndex],
        availabilityHours: getRandomInt(20, 40),
        skillSet: SKILLSETS[roleIndex],
      });
      allResources.push(res);
    }
  }

  console.log('Creating 35 tasks...');
  // We want exactly 35 tasks total
  for (let i = 0; i < 35; i++) {
    const project = getRandomItem(projects);
    // Find resources belonging to this project
    const projectResources = allResources.filter(r => r.projectId === project._id.toString());
    const assignee = projectResources.length > 0 ? getRandomItem(projectResources)._id.toString() : null;
    
    await taskModel.create({
      projectId: project._id.toString(),
      title: `${getRandomItem(TASK_TITLES)} - Part ${getRandomInt(1, 3)}`,
      priority: getRandomItem(PRIORITIES),
      status: getRandomItem(STATUSES),
      estimatedHours: getRandomInt(2, 24),
      dueDate: new Date(Date.now() + getRandomInt(-10, 30) * 86_400_000),
      complexityScore: getRandomInt(1, 10),
      assignedTo: assignee,
    });
  }

  console.log('Creating some dummy risks...');
  await riskModel.create([
    {
      projectId: projects[0]._id.toString(),
      riskType: 'Resource Bottleneck',
      severity: 'High',
      riskScore: 0.85,
      affectedArea: 'Frontend Engineering',
      mitigationSuggestion: 'Reallocate tasks to external contractors.',
    },
    {
      projectId: projects[2]._id.toString(),
      riskType: 'Timeline Slippage',
      severity: 'Critical',
      riskScore: 0.95,
      affectedArea: 'QA Phase',
      mitigationSuggestion: 'Reduce scope of release V2.1 to meet the deadline.',
    }
  ]);

  console.log('Seeding complete!');
  await app.close();
  process.exit(0);
}

bootstrap();
