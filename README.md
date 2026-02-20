# AI-Based Decision Support System for Software Project Management
## High-Level Design (HLD) & Low-Level Design (LLD)

**Student:** Kollimarla Srikrupa (2024TM93132) | **Program:** M.Tech Software Engineering, BITS Pilani  
**Organization:** Amazon, Bengaluru | **Supervisor:** D Surya Sai

---

## 1. System Overview

The system is an **AI-powered Decision Support System (DSS)** that assists software project managers with three core capabilities:

| Module | Purpose | AI Technique |
|--------|---------|-------------|
| **Task Scheduling** | Optimizes resource allocation and task ordering | Rule-based algorithms + constraint satisfaction |
| **Risk Prediction** | Identifies potential bottlenecks early | ML classification (Random Forest, XGBoost) |
| **Automated Reporting** | Generates real-time reports and suggests re-scheduling | Data-driven analytics + NLP |

---

## 2. High-Level Design (HLD)

### 2.1 System Architecture — Layered View

```mermaid
graph TB
    subgraph PL["🖥️ Presentation Layer"]
        UI["Web Dashboard<br/>(React.js)"]
        Charts["Interactive Charts<br/>(Chart.js / D3.js)"]
        Notif["Notification Panel"]
    end

    subgraph AL["⚙️ Application Layer (Backend API)"]
        API["REST API Server<br/>(Flask / FastAPI)"]
        Auth["Auth & Session<br/>Manager"]
        Orch["Orchestration<br/>Engine"]
    end

    subgraph BL["🧠 Business Logic Layer"]
        TS["Task Scheduling<br/>Module"]
        RP["Risk Prediction<br/>Module"]
        AR["Automated Reporting<br/>Module"]
    end

    subgraph DL["🗄️ Data Layer"]
        DB["PostgreSQL<br/>(Relational DB)"]
        Cache["Redis Cache"]
        FS["File Storage<br/>(Reports / Exports)"]
    end

    UI --> API
    Charts --> API
    Notif --> API
    API --> Auth
    API --> Orch
    Orch --> TS
    Orch --> RP
    Orch --> AR
    TS --> DB
    RP --> DB
    AR --> DB
    RP --> Cache
    AR --> FS
```

### 2.2 High-Level Data Flow

```mermaid
flowchart LR
    A["📥 Project Data Input<br/>(Tasks, Resources, History)"] --> B["⚙️ Data Preprocessing<br/>& Feature Engineering"]
    B --> C{"🧠 AI Engine"}
    C --> D["📅 Optimized Schedule"]
    C --> E["⚠️ Risk Predictions"]
    C --> F["📊 Auto-Generated Reports"]
    D --> G["🖥️ Dashboard"]
    E --> G
    F --> G
    G --> H["👤 Project Manager<br/>Reviews & Acts"]
    H -->|Feedback| A
```

### 2.3 Module Interaction Diagram

```mermaid
sequenceDiagram
    participant PM as Project Manager
    participant UI as Web Dashboard
    participant API as Backend API
    participant TSM as Task Scheduler
    participant RPM as Risk Predictor
    participant ARM as Report Generator
    participant DB as Database

    PM->>UI: Input project data / tasks
    UI->>API: POST /api/projects
    API->>DB: Store project & task data
    API-->>UI: Confirmation

    PM->>UI: Request schedule optimization
    UI->>API: POST /api/schedule/optimize
    API->>TSM: Run scheduling algorithm
    TSM->>DB: Fetch tasks, resources, constraints
    TSM->>TSM: Apply constraint-based scheduling
    TSM->>DB: Save optimized schedule
    TSM-->>API: Return optimized schedule
    API-->>UI: Display Gantt chart

    PM->>UI: Request risk analysis
    UI->>API: GET /api/risks/predict
    API->>RPM: Run ML prediction
    RPM->>DB: Fetch historical + current metrics
    RPM->>RPM: Feature extraction & model inference
    RPM-->>API: Risk scores & bottleneck alerts
    API-->>UI: Display risk heatmap

    PM->>UI: Generate report
    UI->>API: POST /api/reports/generate
    API->>ARM: Compile report
    ARM->>DB: Aggregate metrics
    ARM->>TSM: Get schedule status
    ARM->>RPM: Get risk summary
    ARM-->>API: PDF/HTML report
    API-->>UI: Download link
```

---

## 3. Low-Level Design (LLD)

### 3.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React.js + Ant Design | Component-based UI, rich charting support |
| **Backend API** | Python FastAPI | Async support, auto-docs, ML ecosystem |
| **ML/AI** | scikit-learn, XGBoost, pandas | Industry-standard ML libraries |
| **Database** | PostgreSQL | Relational integrity, JSON support |
| **Cache** | Redis | Fast lookups for risk scores |
| **Task Queue** | Celery + RabbitMQ | Async model training & report generation |
| **Deployment** | Docker + AWS EC2 | Containerized, scalable |

### 3.2 Database Schema (ER Diagram)

```mermaid
erDiagram
    PROJECT ||--o{ TASK : contains
    PROJECT ||--o{ RESOURCE : allocates
    PROJECT ||--o{ RISK_PREDICTION : has
    PROJECT ||--o{ REPORT : generates
    TASK ||--o{ TASK_DEPENDENCY : depends_on
    TASK }o--|| RESOURCE : assigned_to
    TASK ||--o{ TASK_HISTORY : tracks

    PROJECT {
        int id PK
        string name
        date start_date
        date end_date
        string status
        float budget
        timestamp created_at
    }

    TASK {
        int id PK
        int project_id FK
        string title
        string priority
        int estimated_hours
        int actual_hours
        string status
        date due_date
        int assigned_to FK
        int complexity_score
    }

    RESOURCE {
        int id PK
        string name
        string role
        int availability_hours
        string skill_set
        int project_id FK
    }

    TASK_DEPENDENCY {
        int id PK
        int task_id FK
        int depends_on_task_id FK
        string dependency_type
    }

    TASK_HISTORY {
        int id PK
        int task_id FK
        string old_status
        string new_status
        timestamp changed_at
        string changed_by
    }

    RISK_PREDICTION {
        int id PK
        int project_id FK
        string risk_type
        float risk_score
        string severity
        string affected_area
        string mitigation_suggestion
        timestamp predicted_at
    }

    REPORT {
        int id PK
        int project_id FK
        string report_type
        string format
        string file_path
        timestamp generated_at
    }
```

### 3.3 Module-Level Low-Level Design

---

#### 3.3.1 Task Scheduling Module

**Algorithm:** Constraint Satisfaction + Priority-Based Scheduling

```mermaid
flowchart TD
    A["Input: Tasks, Resources,<br/>Dependencies, Deadlines"] --> B["Parse Constraints"]
    B --> C["Build Dependency Graph<br/>(DAG - Topological Sort)"]
    C --> D["Calculate Task Priority<br/>(Urgency × Complexity × Dependencies)"]
    D --> E{"Resource Available?"}
    E -->|Yes| F["Assign Task to<br/>Best-Fit Resource"]
    E -->|No| G["Queue Task /<br/>Flag Conflict"]
    F --> H["Update Schedule<br/>& Gantt Data"]
    G --> H
    H --> I["Output: Optimized<br/>Schedule + Conflicts"]
```

**Key Classes:**

```
┌───────────────────────────────────┐
│      TaskScheduler                │
├───────────────────────────────────┤
│ - tasks: List[Task]               │
│ - resources: List[Resource]       │
│ - constraints: ConstraintGraph    │
├───────────────────────────────────┤
│ + optimize_schedule()             │
│ + resolve_conflicts()             │
│ + get_gantt_data()                │
│ + suggest_reschedule(task_id)     │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│      ConstraintGraph              │
├───────────────────────────────────┤
│ - adjacency_list: Dict            │
│ - in_degree: Dict                 │
├───────────────────────────────────┤
│ + topological_sort()              │
│ + detect_cycles()                 │
│ + get_critical_path()             │
└───────────────────────────────────┘
```

---

#### 3.3.2 Risk Prediction Module

**ML Pipeline:**

```mermaid
flowchart TD
    A["Historical Project Data"] --> B["Feature Engineering"]
    B --> C["Features:<br/>• Task completion rate<br/>• Resource utilization %<br/>• Dependency chain length<br/>• Velocity deviation<br/>• Bug density<br/>• Scope change frequency"]
    C --> D["Train/Test Split<br/>(80/20)"]
    D --> E["Model Training"]
    E --> F["Random Forest"]
    E --> G["XGBoost"]
    E --> H["Logistic Regression"]
    F --> I["Model Evaluation<br/>(Accuracy, Precision,<br/>Recall, F1, AUC-ROC)"]
    G --> I
    H --> I
    I --> J["Select Best Model"]
    J --> K["Deploy for Inference"]
    K --> L["Real-time Risk Score<br/>(0.0 - 1.0)"]
```

**Risk Classification:**

| Risk Score | Severity | Action |
|-----------|----------|--------|
| 0.0 – 0.3 | 🟢 Low | Monitor |
| 0.3 – 0.6 | 🟡 Medium | Review & plan mitigation |
| 0.6 – 0.8 | 🟠 High | Immediate attention required |
| 0.8 – 1.0 | 🔴 Critical | Escalate & reschedule |

**Key Classes:**

```
┌───────────────────────────────────┐
│      RiskPredictor                │
├───────────────────────────────────┤
│ - model: TrainedModel             │
│ - feature_extractor: FeatureEng   │
│ - threshold: float                │
├───────────────────────────────────┤
│ + train(historical_data)          │
│ + predict_risk(project_id)        │
│ + get_feature_importance()        │
│ + explain_prediction(task_id)     │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│      FeatureEngineering           │
├───────────────────────────────────┤
│ - raw_data: DataFrame             │
├───────────────────────────────────┤
│ + extract_velocity_features()     │
│ + extract_complexity_features()   │
│ + extract_dependency_features()   │
│ + normalize()                     │
└───────────────────────────────────┘
```

---

#### 3.3.3 Automated Reporting Module

```mermaid
flowchart TD
    A["Trigger: Scheduled /<br/>Manual Request"] --> B["Data Aggregation"]
    B --> C["Fetch Schedule Status<br/>from Task Scheduler"]
    B --> D["Fetch Risk Summary<br/>from Risk Predictor"]
    B --> E["Fetch Metrics<br/>from Database"]
    C --> F["Report Composition Engine"]
    D --> F
    E --> F
    F --> G["Generate Visualizations<br/>(Charts, Heatmaps)"]
    G --> H{"Rescheduling<br/>Needed?"}
    H -->|Yes| I["Generate Reschedule<br/>Suggestions"]
    H -->|No| J["Compile Final Report"]
    I --> J
    J --> K["Export<br/>(PDF / HTML / Dashboard)"]
```

**Report Types:**

| Report | Content | Frequency |
|--------|---------|-----------|
| Sprint Status | Task progress, burndown chart, blockers | Weekly |
| Risk Assessment | Risk heatmap, top-5 risks, trends | On-demand |
| Resource Utilization | Allocation %, idle time, skill gaps | Bi-weekly |
| Executive Summary | KPIs, milestones, budget burn | Monthly |

---

### 3.4 API Design

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/{id}` | Get project details |
| `POST` | `/api/projects/{id}/tasks` | Add tasks to project |
| `PUT` | `/api/tasks/{id}` | Update task details |
| `POST` | `/api/schedule/optimize` | Run schedule optimization |
| `GET` | `/api/schedule/{project_id}` | Get current schedule |
| `GET` | `/api/risks/predict/{project_id}` | Run risk prediction |
| `GET` | `/api/risks/{project_id}/history` | Get historical risk data |
| `POST` | `/api/reports/generate` | Generate a report |
| `GET` | `/api/reports/{id}/download` | Download report file |
| `POST` | `/api/resources` | Add a resource |
| `GET` | `/api/dashboard/{project_id}` | Get dashboard metrics |

---

### 3.5 Frontend Component Hierarchy

```mermaid
graph TD
    App["App Component"] --> Nav["Navigation Bar"]
    App --> Dash["Dashboard View"]
    App --> Sched["Schedule View"]
    App --> Risk["Risk View"]
    App --> Rep["Reports View"]

    Dash --> KPI["KPI Cards"]
    Dash --> BChart["Burndown Chart"]
    Dash --> Timeline["Mini Timeline"]

    Sched --> Gantt["Gantt Chart"]
    Sched --> ResPanel["Resource Panel"]
    Sched --> OptBtn["Optimize Button"]

    Risk --> Heatmap["Risk Heatmap"]
    Risk --> RiskTable["Risk Details Table"]
    Risk --> Trends["Trend Chart"]

    Rep --> RepForm["Report Config Form"]
    Rep --> RepList["Report History List"]
    Rep --> Preview["Report Preview"]
```

---

### 3.6 Deployment Architecture

```mermaid
graph LR
    subgraph Client["Client (Browser)"]
        Browser["React SPA"]
    end

    subgraph Cloud["AWS Cloud"]
        subgraph LB["Load Balancer"]
            ALB["Application<br/>Load Balancer"]
        end

        subgraph App["EC2 / ECS"]
            API1["FastAPI<br/>Instance 1"]
            API2["FastAPI<br/>Instance 2"]
        end

        subgraph Worker["Background Workers"]
            Celery1["Celery Worker<br/>(ML Training)"]
            Celery2["Celery Worker<br/>(Report Gen)"]
        end

        subgraph Data["Data Services"]
            RDS["Amazon RDS<br/>(PostgreSQL)"]
            ElastiCache["ElastiCache<br/>(Redis)"]
            S3["S3 Bucket<br/>(Reports)"]
        end

        RabbitMQ["RabbitMQ<br/>(Message Broker)"]
    end

    Browser --> ALB
    ALB --> API1
    ALB --> API2
    API1 --> RDS
    API2 --> RDS
    API1 --> ElastiCache
    API1 --> RabbitMQ
    RabbitMQ --> Celery1
    RabbitMQ --> Celery2
    Celery1 --> RDS
    Celery2 --> S3
```

---

## 4. Directory Structure (Recommended)

```
ai-dss-project-management/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── config.py               # App configuration
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   ├── resource.py
│   │   │   └── risk.py
│   │   ├── routers/                # API route handlers
│   │   │   ├── projects.py
│   │   │   ├── tasks.py
│   │   │   ├── schedule.py
│   │   │   ├── risks.py
│   │   │   └── reports.py
│   │   ├── services/               # Business logic
│   │   │   ├── scheduler.py        # Task Scheduling Module
│   │   │   ├── risk_predictor.py   # Risk Prediction Module
│   │   │   └── report_generator.py # Reporting Module
│   │   ├── ml/                     # ML pipeline
│   │   │   ├── feature_engineering.py
│   │   │   ├── model_training.py
│   │   │   ├── model_evaluation.py
│   │   │   └── models/             # Saved .pkl models
│   │   └── utils/
│   │       ├── graph.py            # DAG utilities
│   │       └── pdf_generator.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   ├── Schedule/
│   │   │   ├── RiskView/
│   │   │   └── Reports/
│   │   ├── services/               # API client calls
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 5. Evaluation Metrics

| Metric | What It Measures | Target |
|--------|-----------------|--------|
| **Schedule Deviation** | % difference between AI-generated vs actual completion | < 15% |
| **Risk Prediction Accuracy** | F1-score of ML model on test data | ≥ 0.80 |
| **Time Savings** | Reduction in manual planning effort | ≥ 40% |
| **User Satisfaction** | Survey score from project managers | ≥ 4/5 |
| **Report Generation Time** | Time to produce a full status report | < 30 seconds |

---

## 6. Build Approach — Phase-Wise Implementation

```mermaid
gantt
    title Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1 - Foundation
        Database Schema & Models          :a1, 2026-01-22, 5d
        Backend API Skeleton              :a2, after a1, 3d
        Frontend Scaffold                 :a3, after a1, 3d
    section Phase 2 - Core Modules
        Task Scheduling Module            :b1, after a2, 7d
        Risk Prediction ML Pipeline       :b2, after a2, 10d
        Gantt Chart UI                    :b3, after a3, 5d
    section Phase 3 - Reporting
        Report Generator                  :c1, after b1, 5d
        Dashboard & Visualizations        :c2, after b3, 5d
    section Phase 4 - Integration & Testing
        End-to-End Integration            :d1, after c1, 5d
        Testing & Performance Tuning      :d2, after d1, 7d
        User Evaluation                   :d3, after d2, 3d
```

> [!TIP]
> **Start with Phase 1** — get the database and API skeleton working first. This gives you a solid foundation to build all three modules incrementally.

> [!IMPORTANT]
> **Data Collection is key** — For the Risk Prediction module, ensure you have access to historical project data (at least 100+ project records with outcome labels) for meaningful model training. Synthetic data generation is acceptable for the prototype.
