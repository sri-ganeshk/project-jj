import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import type { Project, CreateProjectPayload } from '../types';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

// ── Status badge helper ──────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'badge badge-active',
    Planning: 'badge badge-planning',
    'On Hold': 'badge badge-hold',
    Completed: 'badge badge-done',
  };
  return <span className={map[status] ?? 'badge badge-done'}>{status}</span>;
}

// ── Empty form state ─────────────────────────────────────
const emptyForm: CreateProjectPayload = {
  name: '',
  status: 'Active',
  budget: 10000,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0],
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateProjectPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const loadProjects = () => {
    setLoading(true);
    api
      .get('/projects')
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProjects(); }, []);

  // ── Field change handler ────────────────────────────────
  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  // ── Create project ──────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Project name is required.'); return; }
    if (!form.startDate || !form.endDate) { setFormError('Start and end dates are required.'); return; }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setFormError('End date must be after start date.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/projects', {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      setShowCreate(false);
      setForm(emptyForm);
      loadProjects();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete project ──────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${deleteId}`);
      setDeleteId(null);
      loadProjects();
    } catch (err: any) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      {/* ── Header ── */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects Directory</h1>
          <p className="text-[#cbc3d9] mt-1">Manage all ongoing and planned workstreams.</p>
        </div>
        <button
          id="new-project-btn"
          onClick={() => { setForm(emptyForm); setFormError(''); setShowCreate(true); }}
          className="btn-primary flex items-center gap-2 px-6 py-2.5"
        >
          <Plus className="w-5 h-5" /> New Project
        </button>
      </header>

      {/* ── Projects Table ── */}
      <div className="surface-card ghost-border p-0 overflow-hidden !hover:bg-surface">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#191b24] border-b border-outlineVariant/20 text-[#cbc3d9] text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Project Name</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Budget</th>
              <th className="p-4 font-semibold">Timeline</th>
              <th className="p-4 font-semibold w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outlineVariant/10">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-[#cbc3d9] animate-pulse">
                  Loading projects…
                </td>
              </tr>
            ) : projects.length > 0 ? (
              projects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="hover:bg-surfaceHigh/60 transition-colors group cursor-pointer"
                >
                  <td className="p-4 font-medium flex items-center gap-2">
                    {p.name}
                    <ExternalLink className="w-3.5 h-3.5 text-[#cbc3d9] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="p-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="p-4 font-mono text-sm">${p.budget?.toLocaleString() ?? '0'}</td>
                  <td className="p-4 text-sm text-[#cbc3d9]">
                    {p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    {' — '}
                    {p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      id={`delete-project-${p.id}`}
                      onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                      className="p-1.5 text-[#cbc3d9] hover:text-error opacity-0 group-hover:opacity-100 transition-all rounded"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-10 text-center text-[#cbc3d9]">
                  No projects yet. Click <strong className="text-primary">New Project</strong> to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create Project Modal ── */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Project"
        maxWidth="max-w-xl"
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="btn-secondary px-5">
              Cancel
            </button>
            <button
              id="create-project-submit"
              form="create-project-form"
              type="submit"
              disabled={saving}
              className="btn-primary px-6"
            >
              {saving ? 'Creating…' : 'Create Project'}
            </button>
          </>
        }
      >
        <form id="create-project-form" onSubmit={handleCreate} className="space-y-4" autoComplete="off">
          {formError && (
            <div className="px-4 py-3 bg-errorContainer/30 border border-error/30 rounded-lg text-error text-sm">
              {formError}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="proj-name" className="form-label">Project Name *</label>
            <input
              id="proj-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g. Alpha Upgrade"
              value={form.name}
              onChange={handleField}
              autoFocus
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="proj-status" className="form-label">Status</label>
            <select id="proj-status" name="status" className="form-select" value={form.status} onChange={handleField}>
              <option value="Active">Active</option>
              <option value="Planning">Planning</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="proj-budget" className="form-label">Budget (USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cbc3d9] text-sm">$</span>
              <input
                id="proj-budget"
                name="budget"
                type="number"
                min={0}
                step={100}
                className="form-input pl-7"
                placeholder="10000"
                value={form.budget}
                onChange={handleField}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <label htmlFor="proj-start" className="form-label">Start Date *</label>
              <input
                id="proj-start"
                name="startDate"
                type="date"
                className="form-date"
                value={form.startDate}
                onChange={handleField}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="proj-end" className="form-label">End Date *</label>
              <input
                id="proj-end"
                name="endDate"
                type="date"
                className="form-date"
                value={form.endDate}
                onChange={handleField}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Project"
        maxWidth="max-w-sm"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="btn-secondary px-5">
              Cancel
            </button>
            <button
              id="confirm-delete-project"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger px-5"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-[#cbc3d9]">
          This will permanently delete the project and all associated tasks, resources, and risk predictions.
          This action <strong className="text-error">cannot be undone</strong>.
        </p>
      </Modal>
    </div>
  );
}
