import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Sparkles, Calendar, DollarSign, Users, Plus, ArrowLeft, RefreshCw, CheckSquare } from 'lucide-react';
import type { Project, Task, Resource, RiskPrediction, CreateTaskPayload } from '../types';
import Modal from '../components/Modal';

type Tab = 'overview' | 'tasks' | 'resources';

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
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>('overview');

  // Task modal
  const [showTask, setShowTask]       = useState(false);
  const [taskForm, setTaskForm]       = useState<CreateTaskPayload>(emptyTaskForm(id ?? ''));
  const [taskSaving, setTaskSaving]   = useState(false);
  const [taskError, setTaskError]     = useState('');

  // AI panel
  const [aiRunning, setAiRunning]   = useState(false);
  const [aiResult, setAiResult]     = useState<{ type: string; data: any } | null>(null);

  const loadProject = useCallback(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/risk/project/${id}`).catch(() => ({ data: [] })),
    ])
      .then(([p, r]) => {
        setProject(p.data);
        setRisks(r.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadProject(); }, [loadProject]);

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
      loadProject();
    } catch (err: any) {
      setTaskError(err?.response?.data?.message ?? 'Failed to create task.');
    } finally {
      setTaskSaving(false);
    }
  };

  // ── AI: Run Risk ──────────────────────────────────────
  const handleRisk = async () => {
    if (!project) return;
    setAiRunning(true);
    setAiResult(null);
    try {
      const res = await api.get(`/risk/predict/${project.id}`);
      setAiResult({ type: 'risk', data: res.data });
      loadProject(); // refresh risk data
    } catch (err: any) {
      setAiResult({ type: 'error', data: err?.response?.data?.message ?? 'Failed to run risk assessment.' });
    } finally {
      setAiRunning(false);
    }
  };

  // ── AI: Optimize ──────────────────────────────────────
  const handleOptimize = async () => {
    if (!project) return;
    setAiRunning(true);
    setAiResult(null);
    try {
      const res = await api.post(`/scheduler/optimize/${project.id}`);
      setAiResult({ type: 'optimize', data: res.data });
    } catch (err: any) {
      setAiResult({ type: 'error', data: err?.response?.data?.message ?? 'Failed to optimize schedule.' });
    } finally {
      setAiRunning(false);
    }
  };

  if (loading) {
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

  const latestRisk = risks[risks.length - 1];
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
        <div className="flex gap-0 border-b border-outlineVariant/20">
          {(['overview', 'tasks', 'resources'] as Tab[]).map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
                ${tab === t
                  ? 'text-primary border-primary'
                  : 'text-[#cbc3d9] border-transparent hover:text-white hover:border-outlineVariant/40'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div>
          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-5">
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
                  <h3 className="text-sm uppercase tracking-wider text-[#cbc3d9] mb-3">Latest Risk Assessment</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{latestRisk.riskType}</p>
                      <p className="text-sm text-[#cbc3d9] mt-1">{latestRisk.mitigationSuggestion}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={severityStyle[latestRisk.severity]?.pill ?? 'badge badge-done'}>
                        {latestRisk.severity}
                      </span>
                      <p className="text-2xl font-bold mt-2 text-white">{latestRisk.riskScore.toFixed(2)}</p>
                      <p className="text-xs text-[#cbc3d9]">risk score</p>
                    </div>
                  </div>
                </div>
              )}

              {!latestRisk && (
                <div className="surface-card ghost-border text-[#cbc3d9] text-sm">
                  No risk assessments yet. Use the <strong className="text-primary">Run AI Risk Assessment</strong> button in the side panel.
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
                  id="add-task-detail-btn"
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
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckSquare className="w-4 h-4 text-[#cbc3d9] flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{t.title}</span>
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
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" /> Assigned Resources ({project.resources?.length ?? 0})
              </h3>
              {project.resources && project.resources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.resources.map((r: Resource) => (
                    <div key={r.id} className="surface-card ghost-border flex items-center gap-4 py-4">
                      <div className="w-10 h-10 rounded-full bg-primaryContainer flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {r.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-sm text-[#cbc3d9]">{r.role}</p>
                        {r.availabilityHours && (
                          <p className="text-xs text-[#cbc3d9] mt-0.5">{r.availabilityHours}h available</p>
                        )}
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
        </div>
      </div>

      {/* ── AI Side Panel ── */}
      <aside className="w-80 flex-shrink-0 flex flex-col gap-5">
        <div className="ai-glass flex flex-col gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Strategic AI
          </h3>
          <div className="flex flex-col gap-3">
            <button
              id="run-risk-btn"
              onClick={handleRisk}
              disabled={aiRunning}
              className="btn-primary flex items-center justify-center gap-2 py-3"
            >
              {aiRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : '⚠️'}
              Run AI Risk Assessment
            </button>
            <button
              id="run-optimize-btn"
              onClick={handleOptimize}
              disabled={aiRunning}
              className="btn-secondary flex items-center justify-center gap-2 py-3"
            >
              {aiRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : '⚡'}
              Optimize Schedule
            </button>
          </div>

          {/* Inline AI Result */}
          {aiResult && (
            <div className={`mt-2 p-4 rounded-lg text-sm border ${
              aiResult.type === 'error'
                ? 'bg-errorContainer/20 border-error/30 text-error'
                : 'bg-surfaceHigh border-outlineVariant/20 text-[#e1e1ef]'
            }`}>
              <p className="text-xs uppercase tracking-wider text-[#cbc3d9] mb-2 font-semibold">
                {aiResult.type === 'risk' ? 'Risk Result' : aiResult.type === 'optimize' ? 'Schedule Result' : 'Error'}
              </p>
              {aiResult.type === 'risk' && typeof aiResult.data === 'object' ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#cbc3d9]">Risk Score</span>
                    <span className="font-bold">{aiResult.data.riskScore?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cbc3d9]">Severity</span>
                    <span className={`font-semibold ${aiResult.data.severity === 'High' || aiResult.data.severity === 'Critical' ? 'text-error' : 'text-primary'}`}>
                      {aiResult.data.severity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cbc3d9]">Risk Type</span>
                    <span className="text-right ml-4">{aiResult.data.riskType}</span>
                  </div>
                  {aiResult.data.topRisks?.[0] && (
                    <div className="mt-2 pt-2 border-t border-outlineVariant/20 text-xs text-[#cbc3d9]">
                      <strong className="text-white">Mitigation:</strong> {aiResult.data.topRisks[0].mitigationSuggestion}
                    </div>
                  )}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words text-xs">
                  {typeof aiResult.data === 'string' ? aiResult.data : JSON.stringify(aiResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Risk history */}
        {risks.length > 0 && (
          <div className="surface-card ghost-border">
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-[#cbc3d9]">
              Risk History ({risks.length})
            </h4>
            <ul className="space-y-2">
              {risks.slice(-4).reverse().map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#cbc3d9] text-xs">
                    {new Date(r.predictedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                  </span>
                  <span className="font-mono font-semibold">{r.riskScore.toFixed(2)}</span>
                  <span className={severityStyle[r.severity]?.pill ?? 'badge badge-done'}>{r.severity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* ── Add Task Modal (pre-filled with projectId) ── */}
      <Modal
        open={showTask}
        onClose={() => setShowTask(false)}
        title={`Add Task to ${project.name}`}
        maxWidth="max-w-xl"
        footer={
          <>
            <button onClick={() => setShowTask(false)} className="btn-secondary px-5">Cancel</button>
            <button
              id="create-task-detail-submit"
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
    </div>
  );
}
