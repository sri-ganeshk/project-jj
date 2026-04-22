import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { Activity, Layout, AlertTriangle, Sparkles, RefreshCw, FileText, Zap } from 'lucide-react';
import type { Project, RiskPrediction, Task, Report, OptimizedSchedule } from '../types';
import Modal from '../components/Modal';
import ReportView from '../components/ReportView';

// ── Severity colour map ──────────────────────────────────
const severityStyle: Record<string, { pill: string; dot: string }> = {
  Low:      { pill: 'bg-[#10b981]/20 text-[#10b981]', dot: 'bg-[#10b981]' },
  Medium:   { pill: 'bg-[#4635a7]/60 text-[#c7bfff]', dot: 'bg-[#c7bfff]' },
  High:     { pill: 'bg-errorContainer text-error',   dot: 'bg-error' },
  Critical: { pill: 'bg-error text-white',             dot: 'bg-red-300' },
};

// ── KPI Card ────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className={`surface-card flex items-center justify-between border-t-2 ${accent}`}>
      <div>
        <p className="text-[#cbc3d9] text-xs uppercase tracking-widest font-semibold">{label}</p>
        <h2 className="text-4xl font-bold mt-2 tracking-tight">{value}</h2>
        {sub && <p className="text-xs text-[#cbc3d9] mt-1">{sub}</p>}
      </div>
      <div className={`p-3 bg-surfaceHighest rounded-2xl`}>
        <Icon className="w-8 h-8" style={{ color: accent.replace('border-', '') }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<{ id: string; status: string }[]>([]);
  const [risks, setRisks] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  // AI action state
  const [showReportModal, setShowReportModal]   = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [aiRunning, setAiRunning] = useState(false);
  const [aiReportResult, setAiReportResult] = useState<Report | null>(null);
  const [aiOptimizeResult, setAiOptimizeResult] = useState<OptimizedSchedule | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/projects'),
      api.get('/tasks'),
      api.get('/risk').catch(() => ({ data: [] })),
    ])
      .then(([p, t, r]) => {
        const mapId = (x: Project | Task | RiskPrediction) => ({ ...x, id: x.id || x._id! });
        setProjects(p.data.map(mapId));
        setTasks(t.data.map(mapId));
        setRisks(r.data.map(mapId));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Computed stats ────────────────────────────────────
  const totalProjects  = projects.length;
  const activeTasks    = tasks.filter((t) => t.status !== 'Done').length;
  const avgRisk        = risks.length
    ? (risks.reduce((s, r) => s + r.riskScore, 0) / risks.length).toFixed(2)
    : '—';
  const highRisks = risks.filter((r) => r.severity === 'High' || r.severity === 'Critical');

  // ── Run AI Report ──────────────────────────────────────
  const runReport = async () => {
    if (!selectedProjectId) return;
    setAiRunning(true);
    setAiReportResult(null);
    setAiError(null);
    try {
      const res = await api.get(`/report/generate/${selectedProjectId}`);
      setAiReportResult(res.data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message: string };
      setAiError(`Error: ${error?.response?.data?.message ?? error.message}`);
    } finally {
      setAiRunning(false);
    }
  };

  // ── Run AI Optimizer ───────────────────────────────────
  const runOptimize = async () => {
    if (!selectedProjectId) return;
    setAiRunning(true);
    setAiOptimizeResult(null);
    setAiError(null);
    try {
      const res = await api.post(`/scheduler/optimize/${selectedProjectId}`);
      setAiOptimizeResult(res.data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message: string };
      setAiError(`Error: ${error?.response?.data?.message ?? error.message}`);
    } finally {
      setAiRunning(false);
    }
  };

  // ── Open AI modal helper ───────────────────────────────
  const openAiModal = (type: 'report' | 'optimize') => {
    setSelectedProjectId(projects[0]?.id ?? '');
    setAiReportResult(null);
    setAiOptimizeResult(null);
    setAiError(null);
    if (type === 'report')   setShowReportModal(true);
    if (type === 'optimize') setShowOptimizeModal(true);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[#cbc3d9] mt-1">Your AI-powered project intelligence center.</p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 px-4 py-2"
          id="dashboard-refresh-btn"
          title="Refresh all data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          label="Total Projects"
          value={loading ? '…' : totalProjects}
          sub={`${projects.filter(p => p.status === 'Active').length} active`}
          icon={Layout}
          accent="border-primaryContainer"
        />
        <KpiCard
          label="Active Tasks"
          value={loading ? '…' : activeTasks}
          sub={`${tasks.filter(t => t.status === 'Done').length} completed`}
          icon={Activity}
          accent="border-[#10b981]"
        />
        <KpiCard
          label="Avg Risk Score"
          value={loading ? '…' : avgRisk}
          sub={`${highRisks.length} high / critical findings`}
          icon={AlertTriangle}
          accent="border-[#ffb4ab]"
        />
      </section>

      {/* AI Panel + Risk Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* AI Insights */}
        <div className="ai-glass flex flex-col gap-4 pulse-glow">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Insights &amp; Actions
          </h3>
          <p className="text-sm text-[#cbc3d9]">
            Select a project and let the AI engine run risk predictions, schedule optimization, or generate executive reports.
          </p>
          <div className="flex flex-col gap-3 mt-auto">
            <button
              id="run-report-btn"
              onClick={() => openAiModal('report')}
              disabled={projects.length === 0}
              className="btn-primary flex items-center justify-center gap-2 py-3.5 text-base"
            >
              <FileText className="w-5 h-5" /> Generate AI Executive Report
            </button>
            <button
              id="run-optimize-btn"
              onClick={() => openAiModal('optimize')}
              disabled={projects.length === 0}
              className="btn-secondary flex items-center justify-center gap-2 py-3.5 text-base"
            >
              <Zap className="w-5 h-5" /> Run AI Schedule Optimizer
            </button>
          </div>
          {projects.length === 0 && !loading && (
            <p className="text-xs text-[#cbc3d9] text-center mt-2">Create a project first to enable AI actions.</p>
          )}
        </div>

        {/* At-Risk Alerts */}
        <div className="surface-card ghost-border">
          <h3 className="text-xl font-semibold mb-5 flex items-center justify-between">
            At-Risk Alerts
            <span className="text-sm font-normal text-[#cbc3d9]">{highRisks.length} active</span>
          </h3>

          {loading ? (
            <p className="text-[#cbc3d9] text-sm animate-pulse">Loading risk data…</p>
          ) : highRisks.length > 0 ? (
            <ul className="space-y-3">
              {highRisks.slice(0, 5).map((r) => {
                const style = severityStyle[r.severity] ?? severityStyle.Medium;
                const project = projects.find((p) => p.id === r.projectId);
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-surfaceHighest/40 hover:bg-surfaceHigh transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                      <div>
                        <span className="block font-medium text-sm">{r.riskType}</span>
                        <span className="text-xs text-[#cbc3d9]">
                          {project?.name ?? 'Unknown project'} · {r.affectedArea}
                        </span>
                      </div>
                    </div>
                    <span className={`badge ${style.pill} ml-3 flex-shrink-0`}>{r.severity}</span>
                  </li>
                );
              })}
            </ul>
          ) : risks.length > 0 ? (
            <p className="text-[#10b981] text-sm">✓ No high-risk findings at this time.</p>
          ) : (
            <p className="text-[#cbc3d9] text-sm">
              No risk data yet. Run <strong className="text-primary">AI Risk Assessment</strong> on a project to populate this panel.
            </p>
          )}
        </div>
      </section>

      {/* ── AI Report Modal ── */}
  <Modal
    open={showReportModal}
    onClose={() => { setShowReportModal(false); setAiReportResult(null); setAiError(null); }}
    title="Generate AI Executive Report"
    maxWidth="max-w-4xl"
        footer={
          <>
            <button onClick={() => setShowReportModal(false)} className="btn-secondary px-5">Close</button>
            <button
              id="run-report-confirm"
              onClick={runReport}
              disabled={!selectedProjectId || aiRunning}
              className="btn-primary px-6 flex items-center gap-2"
            >
              {aiRunning ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</> : <><FileText className="w-4 h-4" /> Generate</>}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-field">
            <label htmlFor="report-project-select" className="form-label">Select Project</label>
            <select
              id="report-project-select"
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {aiError && (
            <div className="mt-4 p-4 bg-errorContainer text-error rounded-lg text-sm">
              {aiError}
            </div>
          )}
          {aiReportResult && (
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <ReportView content={aiReportResult.reportContent} />
            </div>
          )}
        </div>
      </Modal>

      {/* ── AI Optimizer Modal ── */}
  <Modal
    open={showOptimizeModal}
    onClose={() => { setShowOptimizeModal(false); setAiOptimizeResult(null); setAiError(null); }}
    title="Run AI Schedule Optimizer"
    maxWidth="max-w-4xl"
        footer={
          <>
            <button onClick={() => setShowOptimizeModal(false)} className="btn-secondary px-5">Close</button>
            <button
              id="run-optimize-confirm"
              onClick={runOptimize}
              disabled={!selectedProjectId || aiRunning}
              className="btn-primary px-6 flex items-center gap-2"
            >
              {aiRunning ? <><RefreshCw className="w-4 h-4 animate-spin" /> Optimizing…</> : <><Zap className="w-4 h-4" /> Optimize</>}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-field">
            <label htmlFor="optimize-project-select" className="form-label">Select Project</label>
            <select
              id="optimize-project-select"
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {aiError && (
            <div className="mt-4 p-4 bg-errorContainer text-error rounded-lg text-sm">
              {aiError}
            </div>
          )}
          {aiOptimizeResult && (
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              {aiOptimizeResult.conflicts.length > 0 && (
                <div className="mb-4 p-4 bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 rounded-xl">
                  <h4 className="text-[#ffb4ab] font-semibold text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Schedule Conflicts Detected
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-[#ffb4ab]/80 space-y-1">
                    {aiOptimizeResult.conflicts.map((c, i) => <li key={i}>{c}</li>)}
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
                    {aiOptimizeResult.schedule.map((entry, idx) => (
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
          )}
        </div>
      </Modal>
    </div>
  );
}
