import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';
import { Task } from './schemas/task.schema';
import { Resource } from './schemas/resource.schema';
import { RiskPrediction } from './schemas/risk-prediction.schema';

const ROLES = [
  'Frontend Engineer',
  'Backend Engineer',
  'DevOps Engineer',
  'QA Tester',
  'Product Manager',
  'UX Designer',
  'Data Scientist',
  'Scrum Master',
  'Technical Writer',
  'Database Admin',
  'Security Engineer',
  'Solutions Architect',
  'Cloud Engineer',
  'ML Engineer',
  'Business Analyst',
  'IT Support',
];

const SKILLSETS = [
  'React, TypeScript, CSS',
  'Node.js, MongoDB, NestJS',
  'AWS, Docker, CI/CD',
  'Selenium, Jest, Cypress',
  'Agile, Roadmap Planning',
  'Figma, User Research',
  'Python, TensorFlow, SQL',
  'Scrum, Agile, Leadership',
  'Markdown, Docusaurus',
  'PostgreSQL, Redis, MongoDB',
  'Kubernetes, Terraform, GCP',
  'System Design, Architecture',
  'TensorFlow, PyTorch, Python',
  'Excel, SQL, Data Analysis',
  'Linux, Windows, Azure',
  'React, Vue, Angular',
  'Java, Spring Boot, Microservices',
  'GraphQL, REST APIs, WebSockets',
  'Mobile Dev, React Native, Swift',
  'Python, Django, FastAPI',
];

const NAMES = [
  'Alice Johnson',
  'Bob Smith',
  'Charlie Davis',
  'Diana Prince',
  'Evan Wright',
  'Fiona Gallagher',
  'George Miller',
  'Hannah Abbott',
  'Ian Malcolm',
  'Julia Roberts',
  'Kevin Spacey',
  'Laura Dern',
  'Michael Scott',
  'Nina Dobrev',
  'Oscar Isaac',
  'Pam Beesly',
  'Quinn Fabray',
  'Rachel Green',
  'Steve Rogers',
  'Tony Stark',
  'Uma Thurman',
  'Victor Stone',
  'Wanda Maximoff',
  'Xander Cage',
  'Yelena Belova',
  'Zoe Kazan',
  'Aaron Paul',
  'Bella Swan',
  'Chris Pratt',
  'Diana Ross',
  'Ethan Hunt',
  'Freya Allan',
  'Greg House',
  'Holly Berry',
  'Ivy League',
  'Jake Gyllenhaal',
  'Kate Winslet',
  'Leonardo DiCaprio',
  'Margot Robbie',
  'Nathan Drake',
  'Olivia Wilde',
  'Peter Parker',
  'Quinn Adams',
  'Ryan Reynolds',
  'Scarlett Johansson',
];

const PROJECT_NAMES = [
  'Project Alpha: E-Commerce Relaunch',
  'Project Beta: Internal HR Tool',
  'Project Gamma: Mobile App V2',
  'Project Delta: AI Chatbot Platform',
  'Project Epsilon: Analytics Dashboard',
  'Project Zeta: API Gateway Modernization',
  'Project Eta: Customer Portal Redesign',
  'Project Theta: Real-time Collaboration Tool',
  'Project Iota: Microservices Migration',
  'Project Kappa: Machine Learning Pipeline',
];

const TASK_TITLES = [
  'Setup CI/CD Pipeline',
  'Design Landing Page',
  'Implement Auth API',
  'Write Unit Tests',
  'Optimize Database Queries',
  'Conduct User Interviews',
  'Create Wireframes',
  'Setup Redux Store',
  'Fix Login Bug',
  'Update Documentation',
  'Migrate to TypeScript',
  'Configure Webpack',
  'Develop Dashboard UI',
  'Integrate Payment Gateway',
  'Setup Monitoring',
  'Review Pull Requests',
  'Plan Sprint 2',
  'Create Logo',
  'Write E2E Tests',
  'Deploy to Staging',
  'Analyze User Feedback',
  'Refactor Legacy Code',
  'Implement Search Feature',
  'Setup Logging System',
  'Create Database Backups',
  'Optimize Image Assets',
  'Build Mobile Responsive Layout',
  'Setup Error Tracking',
  'Document API Endpoints',
  'Configure Load Balancer',
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

  console.log('Creating 10 projects with required skills...');
  const projects = await projectModel.create([
    {
      name: PROJECT_NAMES[0],
      status: 'Active',
      budget: 120000,
      requiredSkills: 'React, TypeScript, Node.js, MongoDB',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 86_400_000),
    },
    {
      name: PROJECT_NAMES[1],
      status: 'Planning',
      budget: 45000,
      requiredSkills: 'React, Angular, UX Design, Figma',
      startDate: new Date(Date.now() + 15 * 86_400_000),
      endDate: new Date(Date.now() + 120 * 86_400_000),
    },
    {
      name: PROJECT_NAMES[2],
      status: 'Active',
      budget: 200000,
      requiredSkills: 'React Native, Swift, JavaScript, Testing',
      startDate: new Date(Date.now() - 30 * 86_400_000),
      endDate: new Date(Date.now() + 60 * 86_400_000),
    },
    {
      name: PROJECT_NAMES[3],
      status: 'Active',
      budget: 180000,
      requiredSkills: 'Python, TensorFlow, Machine Learning, FastAPI',
      startDate: new Date(Date.now() - 15 * 86_400_000),
      endDate: new Date(Date.now() + 75 * 86_400_000),
    },
    {
      name: PROJECT_NAMES[4],
      status: 'Active',
      budget: 95000,
      requiredSkills: 'React, D3.js, SQL, Data Analysis',
      startDate: new Date(Date.now() - 20 * 86_400_000),
      endDate: new Date(Date.now() + 40 * 86_400_000),
    },
    {
      name: PROJECT_NAMES[5],
      status: 'Planning',
      budget: 155000,
      requiredSkills: 'AWS, Docker, Kubernetes, Terraform',
      startDate: new Date(Date.now() + 10 * 86_400_000),
      endDate: new Date(Date.now() + 100 * 86_400_000),
    },
    {
      name: PROJECT_NAMES[6],
      status: 'In Progress',
      budget: 75000,
      requiredSkills: 'Figma, UX Design, React, CSS',
      startDate: new Date(Date.now() - 45 * 86_400_000),
      endDate: new Date(Date.now() + 30 * 86_400_000),
    },
    {
      name: PROJECT_NAMES[7],
      status: 'Active',
      budget: 220000,
      requiredSkills: 'WebSocket, Node.js, React, Redis',
      startDate: new Date(Date.now() - 10 * 86_400_000),
      endDate: new Date(Date.now() + 80 * 86_400_000),
    },
    {
      name: PROJECT_NAMES[8],
      status: 'Planning',
      budget: 310000,
      requiredSkills: 'Microservices, Java, Spring Boot, Kubernetes',
      startDate: new Date(Date.now() + 20 * 86_400_000),
      endDate: new Date(Date.now() + 150 * 86_400_000),
    },
    {
      name: PROJECT_NAMES[9],
      status: 'Active',
      budget: 165000,
      requiredSkills: 'Python, PyTorch, Data Pipeline, SQL',
      startDate: new Date(Date.now() - 25 * 86_400_000),
      endDate: new Date(Date.now() + 55 * 86_400_000),
    }
  ]);

  console.log('Creating assigned resources for each project...');
  const allResources: any[] = [];
  
  for (const project of projects) {
    const numResources = getRandomInt(8, 15);
    for (let i = 0; i < numResources; i++) {
      const roleIndex = getRandomInt(0, ROLES.length - 1);
      const res = await resourceModel.create({
        projectId: project._id.toString(),
        name: getRandomItem(NAMES),
        role: ROLES[roleIndex],
        availabilityHours: getRandomInt(15, 40),
        skillSet: SKILLSETS[roleIndex],
      });
      allResources.push(res);
    }
  }

  console.log('Creating 25 unassigned global resources...');
  for (let i = 0; i < 25; i++) {
    const roleIndex = getRandomInt(0, ROLES.length - 1);
    const res = await resourceModel.create({
      name: getRandomItem(NAMES),
      role: ROLES[roleIndex],
      availabilityHours: getRandomInt(20, 40),
      skillSet: SKILLSETS[roleIndex],
      // No projectId - these are available globally
    });
    allResources.push(res);
  }

  console.log('Creating 100 tasks...');
  // We want exactly 100 tasks total distributed across projects
  for (let i = 0; i < 100; i++) {
    const project = getRandomItem(projects);
    // Find resources belonging to this project
    const projectResources = allResources.filter(r => r.projectId === project._id.toString());
    const assignee = projectResources.length > 0 ? getRandomItem(projectResources)._id.toString() : null;
    
    await taskModel.create({
      projectId: project._id.toString(),
      title: `${getRandomItem(TASK_TITLES)} - Task ${i + 1}`,
      priority: getRandomItem(PRIORITIES),
      status: getRandomItem(STATUSES),
      estimatedHours: getRandomInt(2, 40),
      dueDate: new Date(Date.now() + getRandomInt(-30, 60) * 86_400_000),
      complexityScore: getRandomInt(1, 10),
      assignedTo: assignee,
    });
  }

  console.log('Creating risk predictions...');
  await riskModel.create([
    {
      projectId: projects[0]._id.toString(),
      riskType: 'Resource Bottleneck',
      severity: 'High',
      riskScore: 0.85,
      affectedArea: 'Frontend Engineering',
      mitigationSuggestion: 'Reallocate tasks to external contractors or extend timeline.',
    },
    {
      projectId: projects[2]._id.toString(),
      riskType: 'Timeline Slippage',
      severity: 'Critical',
      riskScore: 0.95,
      affectedArea: 'QA Phase',
      mitigationSuggestion: 'Reduce scope of release V2.1 to meet the deadline.',
    },
    {
      projectId: projects[3]._id.toString(),
      riskType: 'Data Quality Issues',
      severity: 'High',
      riskScore: 0.78,
      affectedArea: 'ML Pipeline',
      mitigationSuggestion: 'Implement additional data validation and cleansing steps.',
    },
    {
      projectId: projects[5]._id.toString(),
      riskType: 'Infrastructure Complexity',
      severity: 'Medium',
      riskScore: 0.62,
      affectedArea: 'DevOps',
      mitigationSuggestion: 'Hire experienced Kubernetes specialist to manage cloud infrastructure.',
    },
    {
      projectId: projects[1]._id.toString(),
      riskType: 'Scope Creep',
      severity: 'Medium',
      riskScore: 0.71,
      affectedArea: 'Requirements Management',
      mitigationSuggestion: 'Establish strict change control process and stakeholder alignment meetings.',
    },
    {
      projectId: projects[4]._id.toString(),
      riskType: 'Integration Challenge',
      severity: 'High',
      riskScore: 0.82,
      affectedArea: 'Backend Integration',
      mitigationSuggestion: 'Start integration testing early and allocate more QA resources.',
    },
    {
      projectId: projects[6]._id.toString(),
      riskType: 'Design Rework Required',
      severity: 'Medium',
      riskScore: 0.65,
      affectedArea: 'UX Design',
      mitigationSuggestion: 'Conduct additional user research and A/B testing.',
    },
    {
      projectId: projects[7]._id.toString(),
      riskType: 'Performance Degradation',
      severity: 'High',
      riskScore: 0.88,
      affectedArea: 'Real-time Communication',
      mitigationSuggestion: 'Load test early and implement caching strategies.',
    },
    {
      projectId: projects[8]._id.toString(),
      riskType: 'Migration Complexity',
      severity: 'Critical',
      riskScore: 0.92,
      affectedArea: 'System Architecture',
      mitigationSuggestion: 'Plan phased migration approach and maintain rollback strategy.',
    },
    {
      projectId: projects[9]._id.toString(),
      riskType: 'Model Accuracy Issues',
      severity: 'High',
      riskScore: 0.79,
      affectedArea: 'ML Model Development',
      mitigationSuggestion: 'Increase training dataset size and improve feature engineering.',
    }
  ]);

  console.log('Seeding complete!');
  await app.close();
  process.exit(0);
}

bootstrap();
