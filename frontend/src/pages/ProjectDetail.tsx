import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Sparkles, Calendar, DollarSign, Users, Plus, ArrowLeft, RefreshCw, CheckSquare, FileText, LayoutList } from 'lucide-react';
import type { Project, Task, Resource, RiskPrediction, CreateTaskPayload, OptimizedSchedule, Report } from '../types';
import Modal from '../components/Modal';
import ReportView from '../components/ReportView';

type Tab = 'overview' | 'tasks' | 'resources' | 'schedule' | 'report';

const COLUMNS = ['To Do', 'In Progress', 'In Review', 'Done'] as const;

// ── Status colour map ─────────────────────────────────────
const statusColor: Record<string, string> = {
  'To Do':      'bg-surfaceHigh text-[#cbc3d9]',
  'In Progress': 'bg-primary/20 text-primary',
  'In Review':  'bg-[#4635a7]/40 text-[#c7bfff]',
  Done:         'bg-[#10b981]/20 text-[#10b981]',
};

const priorityColor: Record<string, string> = {
  Low:      'text-[#10b981]',
  Medium:   'text-primary',
  High:     'text-error',
  Critical: 'text-red-400 font-bold',
};

const severityStyle: Record<string, { pill: string }> = {
  Low:      { pill: 'badge bg-[#10b981]/20 text-[#10b981]' },
  Medium:   { pill: 'badge bg-[#4635a7]/60 text-[#c7bfff]' },
  High:     { pill: 'badge bg-errorContainer text-error' },
  Critical: { pill: 'badge bg-error text-white' },
};

// ── Task form defaults ────────────────────────────────────
const emptyTaskForm = (projectId: string): CreateTaskPayload => ({
  projectId,
  title: '',
  priority: 'Medium',
  status: 'To Do',
  estimatedHours: 4,
  dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString().split('T')[0],
  assignedTo: '',
  complexityScore: 1,
});

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject]   = useState<Project | null>(null);
  const [risks, setRisks]       = useState<RiskPrediction[]>([]);
  const [schedules, setSchedules] = useState<OptimizedSchedule[]>([]);
  const [reports, setReports]     = useState<Report[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>('overview');

  // Task modal
  const [showTask, setShowTask]       = useState(false);
  const [taskForm, setTaskForm]       = useState<CreateTaskPayload>(emptyTaskForm(id ?? ''));
  const [taskSaving, setTaskSaving]   = useState(false);
  const [taskError, setTaskError]     = useState('');

  // Resource modal
  const [showResource, setShowResource] = useState(false);
  const [resourceForm, setResourceForm] = useState({ name: '', role: '', availabilityHours: 40, skillSet: '' });
  const [resourceSaving, setResourceSaving] = useState(false);
  const [resourceError, setResourceError] = useState('');

  // AI panel
  const [aiRunning, setAiRunning]   = useState(false);

  const loadProjectData = useCallback(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/risk/project/${id}`).catch(() => ({ data: [] })),
      api.get(`/scheduler/history/${id}`).catch(() => ({ data: [] })),
      api.get(`/report/project/${id}`).catch(() => ({ data: [] })),
    ])
      .then(([pRes, rRes, sRes, repRes]) => {
        const p = pRes.data;
        if (p) {
          p.id = p.id || p._id;
          if (p.tasks) p.tasks = p.tasks.map((x: Task) => ({ ...x, id: x.id || x._id! }));
          if (p.resources) p.resources = p.resources.map((x: Resource) => ({ ...x, id: x.id || x._id! }));
        }
        setProject(p);
        setRisks(rRes.data);
        setSchedules(sRes.data);
        setReports(repRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadProjectData(); }, [loadProjectData]);

  // ── Create task ────────────────────────────────────────
  const handleTaskField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setTaskForm((f) => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  };

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskError('');
    if (!taskForm.title.trim()) { setTaskError('Title is required.'); return; }
    setTaskSaving(true);
    try {
      await api.post('/tasks', {
        ...taskForm,
        dueDate: new Date(taskForm.dueDate).toISOString(),
        assignedTo: taskForm.assignedTo || undefined,
      });
      setShowTask(false);
      loadProjectData();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setTaskError(error?.response?.data?.message ?? 'Failed to create task.');
    } finally {
      setTaskSaving(false);
    }
  };

  // ── Create resource ────────────────────────────────────────
  const handleResourceField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setResourceForm((f) => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  };

  const submitResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setResourceError('');
    if (!resourceForm.name.trim() || !resourceForm.role.trim()) { setResourceError('Name and Role are required.'); return; }
    setResourceSaving(true);
    try {
      await api.post('/resources', {
        ...resourceForm,
        projectId: project?.id,
      });
      setShowResource(false);
      loadProjectData();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setResourceError(error?.response?.data?.message ?? 'Failed to add resource.');
    } finally {
      setResourceSaving(false);
    }
  };

  // ── AI actions ────────────────────────────────────────
  const handleRisk = async () => {
    if (!project) return;
    setAiRunning(true);
    try {
      await api.get(`/risk/predict/${project.id}`);
      loadProjectData();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message ?? 'Failed to run risk assessment.');
    } finally {
      setAiRunning(false);
    }
  };

  const handleOptimize = async () => {
    if (!project) return;
    setAiRunning(true);
    try {
      await api.post(`/scheduler/optimize/${project.id}`);
      loadProjectData();
      setTab('schedule');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message ?? 'Failed to optimize schedule.');
    } finally {
      setAiRunning(false);
    }
  };

  const handleReport = async () => {
    if (!project) return;
    setAiRunning(true);
    try {
      await api.get(`/report/generate/${project.id}`);
      loadProjectData();
      setTab('report');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message ?? 'Failed to generate report.');
    } finally {
      setAiRunning(false);
    }
  };

  if (loading && !project) {
    return (
      <div className="p-8 flex items-center gap-3 text-[#cbc3d9] animate-pulse">
        <RefreshCw className="w-5 h-5 animate-spin" /> Loading project…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#cbc3d9] mb-4">Project not found.</p>
        <button onClick={() => navigate('/projects')} className="btn-secondary">← Back to Projects</button>
      </div>
    );
  }

  const latestRisk = risks[0];
  const latestSchedule = schedules[0];
  const latestReport = reports[0];
  const tasksByStatus = COLUMNS.map((col) => ({
    col,
    count: (project.tasks ?? []).filter((t: Task) => t.status === col).length,
  }));

  return (
    <div className="p-8 flex gap-8 min-h-full">
      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">

        {/* Back + header */}
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-[#cbc3d9] hover:text-white text-sm transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> All Projects
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <span className="badge badge-active">{project.status}</span>
              </div>
              <p className="text-[#cbc3d9] mt-2 flex flex-wrap gap-5 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'N/A'}
                  {' — '}
                  {project.endDate ? new Date(project.endDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'N/A'}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> ${project.budget?.toLocaleString() ?? 0}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-outlineVariant/20 overflow-x-auto">
          {(['overview', 'tasks', 'resources', 'schedule', 'report'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 whitespace-nowrap -mb-px flex items-center gap-2
                ${tab === t
                  ? 'text-primary border-primary'
                  : 'text-[#cbc3d9] border-transparent hover:text-white hover:border-outlineVariant/40'}`}
            >
              {t === 'schedule' && <LayoutList className="w-4 h-4" />}
              {t === 'report' && <FileText className="w-4 h-4" />}
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div>
          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Task status breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {tasksByStatus.map(({ col, count }) => (
                  <div key={col} className="surface-card text-center py-5">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-[#cbc3d9] mt-1 uppercase tracking-wider">{col}</p>
                  </div>
                ))}
              </div>

              {/* Latest risk */}
              {latestRisk && (
                <div className="surface-card ghost-border">
                  <h3 className="text-sm uppercase tracking-wider text-[#cbc3d9] mb-4">Latest Risk Assessment</h3>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-outlineVariant/20">
                    <div>
                      <p className="font-semibold text-white text-lg">{latestRisk.riskType}</p>
                      <p className="text-sm text-[#cbc3d9] mt-1">Severity mapping to predictive score limits.</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={severityStyle[latestRisk.severity]?.pill ?? 'badge badge-done'}>
                        {latestRisk.severity}
                      </span>
                      <p className="text-3xl font-bold mt-2 text-white">{latestRisk.riskScore.toFixed(2)}</p>
                      <p className="text-xs text-[#cbc3d9]">risk score</p>
                    </div>
                  </div>
                  
                  {latestRisk.topRisks && latestRisk.topRisks.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-[#cbc3d9] mb-3">Top Risk Areas</h4>
                      <div className="space-y-3">
                        {latestRisk.topRisks.map((tr, idx) => (
                          <div key={idx} className="bg-surfaceHigh/50 p-3 rounded-lg border border-outlineVariant/10">
                            <p className="font-medium text-sm text-white">{tr.area}</p>
                            <p className="text-sm text-[#cbc3d9] mt-1.5"><strong className="text-primary/90">Mitigation:</strong> {tr.mitigationSuggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!latestRisk && (
                <div className="surface-card ghost-border text-[#cbc3d9] text-sm flex flex-col items-center justify-center py-10">
                  <p>No risk assessments yet.</p>
                  <button onClick={handleRisk} className="btn-secondary mt-4" disabled={aiRunning}>Run Initial Assessment</button>
                </div>
              )}
            </div>
          )}

          {/* Tasks */}
          {tab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  Tasks ({project.tasks?.length ?? 0})
                </h3>
                <button
                  onClick={() => { setTaskForm(emptyTaskForm(project.id)); setTaskError(''); setShowTask(true); }}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>

              {project.tasks && project.tasks.length > 0 ? (
                <div className="divide-y divide-outlineVariant/10 surface-card ghost-border p-0 overflow-hidden !hover:bg-surface">
                  {project.tasks.map((t: Task) => (
                    <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surfaceHigh transition-colors">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-3">
                          <CheckSquare className="w-4 h-4 text-[#cbc3d9] flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{t.title}</span>
                        </div>
                        {typeof t.assignedTo === 'object' && t.assignedTo?.name && <span className="text-xs text-[#cbc3d9] ml-7 mt-1">Assigned to: {t.assignedTo.name}</span>}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className={`text-xs font-semibold ${priorityColor[t.priority] ?? 'text-[#cbc3d9]'}`}>
                          {t.priority}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[t.status] ?? 'bg-surfaceHigh text-[#cbc3d9]'}`}>
                          {t.status}
                        </span>
                        <span className="text-xs text-[#cbc3d9]">
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) : 'TBD'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-[#cbc3d9] surface-card ghost-border text-sm">
                  No tasks yet. Click <strong className="text-primary">Add Task</strong> above.
                </div>
              )}
            </div>
          )}

          {/* Resources */}
          {tab === 'resources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" /> Assigned Resources ({project.resources?.length ?? 0})
                </h3>
                <button
                  onClick={() => { setResourceForm({ name: '', role: '', availabilityHours: 40, skillSet: '' }); setResourceError(''); setShowResource(true); }}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Resource
                </button>
              </div>
              {project.resources && project.resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.resources.map((r: Resource) => (
                    <div key={r.id} className="surface-card ghost-border flex items-center gap-4 py-4">
                      <div className="w-12 h-12 rounded-full bg-primaryContainer flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {r.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{r.name}</p>
                        <p className="text-sm text-primary/80 font-medium">{r.role}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-[#cbc3d9]">
                          {r.availabilityHours && <span>{r.availabilityHours}h available</span>}
                          {r.skillSet && <span>Skills: {r.skillSet}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-[#cbc3d9] surface-card ghost-border text-sm">
                  No resources assigned to this project.
                </div>
              )}
            </div>
          )}

          {/* AI Schedule */}
          {tab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">AI Optimized Schedule</h3>
                <button onClick={handleOptimize} disabled={aiRunning} className="btn-secondary text-sm px-4 py-1.5 flex items-center gap-2">
                  {aiRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Regenerate Schedule
                </button>
              </div>

              {latestSchedule ? (
                <div className="space-y-4">
                  {latestSchedule.summary && (
                    <div className="surface-card border-l-4 border-l-primary bg-primary/5 p-4 text-sm text-[#e1e1ef]">
                      {latestSchedule.summary}
                    </div>
                  )}

                  {latestSchedule.conflicts && latestSchedule.conflicts.length > 0 && (
                    <div className="surface-card border-l-4 border-l-error bg-error/5 p-4 text-sm text-error">
                      <strong>Conflicts detected:</strong>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {latestSchedule.conflicts.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="surface-card ghost-border p-0 overflow-hidden !hover:bg-surface overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#191b24] border-b border-outlineVariant/20 text-[#cbc3d9] text-xs uppercase tracking-wider">
                          <th className="p-4 font-semibold">Task</th>
                          <th className="p-4 font-semibold">Suggested Start</th>
                          <th className="p-4 font-semibold">Resource</th>
                          <th className="p-4 font-semibold">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outlineVariant/10">
                        {latestSchedule.schedule.map((entry, idx) => (
                          <tr key={idx} className="hover:bg-surfaceHigh/60 transition-colors">
                            <td className="p-4 font-medium text-sm text-white">{entry.taskTitle}</td>
                            <td className="p-4 text-sm">{entry.suggestedStartDate}</td>
                            <td className="p-4 text-sm text-primary font-medium">{entry.resourceName}</td>
                            <td className="p-4 text-xs text-[#cbc3d9] max-w-xs truncate" title={entry.reason}>{entry.reason || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-[#cbc3d9] surface-card ghost-border">
                  <Sparkles className="w-8 h-8 text-outlineVariant mx-auto mb-3" />
                  <p className="mb-4">No AI schedules generated yet.</p>
                  <button onClick={handleOptimize} disabled={aiRunning} className="btn-primary">
                    {aiRunning ? 'Generating...' : 'Generate Optimized Schedule'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Report */}
          {tab === 'report' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Executive Report</h3>
                <button onClick={handleReport} disabled={aiRunning} className="btn-secondary text-sm px-4 py-1.5 flex items-center gap-2">
                  {aiRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                  Generate New Report
                </button>
              </div>

              {latestReport ? (
                <ReportView content={latestReport.reportContent} />
              ) : (
                <div className="p-10 text-center text-[#cbc3d9] surface-card ghost-border">
                  <FileText className="w-8 h-8 text-outlineVariant mx-auto mb-3" />
                  <p className="mb-4">No reports generated yet.</p>
                  <button onClick={handleReport} disabled={aiRunning} className="btn-primary">
                    {aiRunning ? 'Generating...' : 'Generate Executive Report'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Action Side Panel ── */}
      <aside className="w-72 flex-shrink-0 flex flex-col gap-4">
        <div className="surface-card ghost-border p-5">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[#cbc3d9] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> AI Assistants
          </h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRisk}
              disabled={aiRunning}
              className="btn-secondary flex items-center gap-2 py-2.5 text-sm"
            >
              <span className="text-xl leading-none">⚠️</span> Risk Assessment
            </button>
            <button
              onClick={handleOptimize}
              disabled={aiRunning}
              className="btn-secondary flex items-center gap-2 py-2.5 text-sm"
            >
              <span className="text-xl leading-none">⚡</span> Optimize Schedule
            </button>
            <button
              onClick={handleReport}
              disabled={aiRunning}
              className="btn-secondary flex items-center gap-2 py-2.5 text-sm"
            >
              <span className="text-xl leading-none">📄</span> Generate Report
            </button>
          </div>
          {aiRunning && (
            <div className="mt-4 text-xs text-primary flex items-center gap-2 animate-pulse justify-center">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> AI is processing...
            </div>
          )}
        </div>

        {/* History Summaries */}
        {schedules.length > 0 && (
          <div className="surface-card p-4 border border-outlineVariant/10">
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-[#cbc3d9]">
              Schedule History
            </h4>
            <ul className="space-y-2">
              {schedules.slice(0, 3).map((s) => (
                <li key={s.id} className="text-xs flex justify-between">
                  <span className="text-[#cbc3d9]">{new Date(s.generatedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {reports.length > 0 && (
          <div className="surface-card p-4 border border-outlineVariant/10">
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-[#cbc3d9]">
              Report History
            </h4>
            <ul className="space-y-2">
              {reports.slice(0, 3).map((r) => (
                <li key={r.id} className="text-xs flex justify-between">
                  <span className="text-[#cbc3d9]">{new Date(r.generatedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* ── Add Task Modal ── */}
      <Modal
        open={showTask}
        onClose={() => setShowTask(false)}
        title={`Add Task`}
        maxWidth="max-w-xl"
        footer={
          <>
            <button onClick={() => setShowTask(false)} className="btn-secondary px-5">Cancel</button>
            <button
              form="add-task-form"
              type="submit"
              disabled={taskSaving}
              className="btn-primary px-6"
            >
              {taskSaving ? 'Saving…' : 'Add Task'}
            </button>
          </>
        }
      >
        <form id="add-task-form" onSubmit={submitTask} className="space-y-4" autoComplete="off">
          {taskError && (
            <div className="px-4 py-3 bg-errorContainer/30 border border-error/30 rounded-lg text-error text-sm">
              {taskError}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="dt-title" className="form-label">Title *</label>
            <input id="dt-title" name="title" type="text" className="form-input"
              placeholder="e.g. Set up CI/CD pipeline" value={taskForm.title} onChange={handleTaskField} autoFocus required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <label htmlFor="dt-priority" className="form-label">Priority</label>
              <select id="dt-priority" name="priority" className="form-select" value={taskForm.priority} onChange={handleTaskField}>
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="dt-status" className="form-label">Status</label>
              <select id="dt-status" name="status" className="form-select" value={taskForm.status} onChange={handleTaskField}>
                {COLUMNS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <label htmlFor="dt-hours" className="form-label">Est. Hours</label>
              <input id="dt-hours" name="estimatedHours" type="number" min={1} className="form-input"
                value={taskForm.estimatedHours} onChange={handleTaskField} />
            </div>
            <div className="form-field">
              <label htmlFor="dt-complexity" className="form-label">Complexity (1–5)</label>
              <input id="dt-complexity" name="complexityScore" type="number" min={1} max={5} className="form-input"
                value={taskForm.complexityScore} onChange={handleTaskField} />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="dt-due" className="form-label">Due Date</label>
            <input id="dt-due" name="dueDate" type="date" className="form-date"
              value={taskForm.dueDate} onChange={handleTaskField} />
          </div>

          {project.resources && project.resources.length > 0 && (
            <div className="form-field">
              <label htmlFor="dt-resource" className="form-label">Assign To (optional)</label>
              <select id="dt-resource" name="assignedTo" className="form-select" value={taskForm.assignedTo} onChange={handleTaskField}>
                <option value="">— Unassigned —</option>
                {project.resources.map((r: Resource) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                ))}
              </select>
            </div>
          )}
        </form>
      </Modal>

      {/* ── Add Resource Modal ── */}
      <Modal
        open={showResource}
        onClose={() => setShowResource(false)}
        title={`Add Resource`}
        maxWidth="max-w-md"
        footer={
          <>
            <button onClick={() => setShowResource(false)} className="btn-secondary px-5">Cancel</button>
            <button
              form="add-resource-form"
              type="submit"
              disabled={resourceSaving}
              className="btn-primary px-6"
            >
              {resourceSaving ? 'Saving…' : 'Add Resource'}
            </button>
          </>
        }
      >
        <form id="add-resource-form" onSubmit={submitResource} className="space-y-4" autoComplete="off">
          {resourceError && (
            <div className="px-4 py-3 bg-errorContainer/30 border border-error/30 rounded-lg text-error text-sm">
              {resourceError}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="r-name" className="form-label">Name *</label>
            <input id="r-name" name="name" type="text" className="form-input"
              placeholder="e.g. Alice Smith" value={resourceForm.name} onChange={handleResourceField} autoFocus required />
          </div>

          <div className="form-field">
            <label htmlFor="r-role" className="form-label">Role *</label>
            <input id="r-role" name="role" type="text" className="form-input"
              placeholder="e.g. Backend Developer" value={resourceForm.role} onChange={handleResourceField} required />
          </div>

          <div className="form-field">
            <label htmlFor="r-skills" className="form-label">Skill Set</label>
            <input id="r-skills" name="skillSet" type="text" className="form-input"
              placeholder="e.g. Node.js, MongoDB, React" value={resourceForm.skillSet} onChange={handleResourceField} />
          </div>

          <div className="form-field">
            <label htmlFor="r-hours" className="form-label">Availability (Hours/Week)</label>
            <input id="r-hours" name="availabilityHours" type="number" min={1} className="form-input"
              value={resourceForm.availabilityHours} onChange={handleResourceField} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
