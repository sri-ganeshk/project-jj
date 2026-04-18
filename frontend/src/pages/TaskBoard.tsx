import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { Plus } from 'lucide-react';
import type { Task, Project, Resource, CreateTaskPayload } from '../types';
import Modal from '../components/Modal';

const COLUMNS = ['To Do', 'In Progress', 'In Review', 'Done'] as const;
type Column = (typeof COLUMNS)[number];

// ── Priority badge ─────────────────────────────
function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    Critical: 'badge badge-critical',
    High: 'badge badge-high',
    Medium: 'badge badge-medium',
    Low: 'badge badge-low',
  };
  return <span className={map[priority] ?? 'badge badge-low'}>{priority}</span>;
}

// ── Initials avatar ────────────────────────────
function Avatar({ name }: { name?: string }) {
  if (!name) return (
    <div className="w-6 h-6 rounded-full bg-surfaceHighest flex items-center justify-center text-[#cbc3d9] text-xs">?</div>
  );
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-6 h-6 rounded-full bg-primaryContainer flex items-center justify-center text-white text-[10px] font-bold">
      {initials}
    </div>
  );
}

// ── Empty form state ───────────────────────────
const emptyForm: CreateTaskPayload = {
  projectId: '',
  title: '',
  priority: 'Medium',
  status: 'To Do',
  estimatedHours: 4,
  dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString().split('T')[0],
  assignedTo: '',
  complexityScore: 1,
};

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateTaskPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Drag state
  const [dragging, setDragging] = useState<string | null>(null);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/tasks'),
      api.get('/projects'),
      api.get('/resources').catch(() => ({ data: [] })),
    ])
      .then(([t, p, r]) => {
        setTasks(t.data);
        setProjects(p.data);
        setResources(r.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Field change ───────────────────────────────
  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  // ── Create task ────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.projectId) { setFormError('Please select a project.'); return; }
    if (!form.title.trim()) { setFormError('Task title is required.'); return; }
    setSaving(true);
    try {
      await api.post('/tasks', {
        ...form,
        dueDate: new Date(form.dueDate).toISOString(),
        assignedTo: form.assignedTo || undefined,
      });
      setShowCreate(false);
      setForm(emptyForm);
      loadAll();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  // ── Drag & Drop ────────────────────────────────
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
    e.dataTransfer.effectAllowed = 'move';
    setDragging(id);
  };

  const onDragEnd = () => setDragging(null);

  const onDrop = async (e: React.DragEvent, status: Column) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('taskId');
    if (!id) return;
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await api.patch(`/tasks/${id}`, { status });
    } catch {
      // Revert on error
      loadAll();
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  // ── Task counts per column ─────────────────────
  const tasksIn = (col: Column) =>
    tasks.filter((t) => t.status === col || (col === 'To Do' && !t.status));

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Tasks</h1>
          <p className="text-[#cbc3d9] mt-1">Drag cards between columns to update status.</p>
        </div>
        <button
          id="add-task-btn"
          onClick={() => { setForm(emptyForm); setFormError(''); setShowCreate(true); }}
          className="btn-primary flex items-center gap-2 px-6 py-2.5"
        >
          <Plus className="w-5 h-5" /> Add Task
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[#cbc3d9] animate-pulse">
          Loading tasks…
        </div>
      ) : (
        /* ── Kanban Columns ── */
        <div className="flex gap-5 overflow-x-auto pb-4 flex-1 items-start">
          {COLUMNS.map((col) => {
            const colTasks = tasksIn(col);
            return (
              <div
                key={col}
                className="w-72 flex-shrink-0 flex flex-col rounded-xl ghost-border overflow-hidden"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, col)}
              >
                {/* Column header */}
                <div className="px-4 py-3 bg-surfaceHigh flex items-center justify-between">
                  <h3 className="font-semibold text-[#cbc3d9] text-sm uppercase tracking-wider">{col}</h3>
                  <span className="text-xs bg-background text-[#cbc3d9] font-semibold px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3 p-3 bg-surface/50 min-h-[200px]">
                  {colTasks.length > 0 ? (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        id={`task-card-${t.id}`}
                        draggable
                        onDragStart={(e) => onDragStart(e, t.id)}
                        onDragEnd={onDragEnd}
                        className={`surface-card p-4 ghost-border cursor-grab active:cursor-grabbing
                                    hover:-translate-y-0.5 transition-transform relative select-none
                                    ${dragging === t.id ? 'opacity-50 scale-95' : ''}`}
                      >
                        {/* Priority badge */}
                        <div className="flex items-center justify-between mb-2">
                          <PriorityBadge priority={t.priority} />
                          {t.complexityScore && t.complexityScore > 3 && (
                            <span className="text-[10px] text-primary bg-primaryContainer/20 px-1.5 py-0.5 rounded font-semibold">
                              Complex
                            </span>
                          )}
                        </div>

                        <h4 className="font-semibold text-white text-sm mb-1 leading-snug">{t.title}</h4>

                        {/* Project name */}
                        {t.projectId && (
                          <p className="text-[10px] text-[#cbc3d9] mb-2">
                            {projects.find((p) => p.id === t.projectId)?.name ?? 'Unknown Project'}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between text-xs text-[#cbc3d9]">
                          <span>Due {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'TBD'}</span>
                          <Avatar name={t.resource?.name} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 border-2 border-dashed border-outlineVariant/20 rounded-lg 
                                    flex items-center justify-center text-[#cbc3d9] text-xs py-8">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Task Modal ── */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Task"
        maxWidth="max-w-xl"
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="btn-secondary px-5">
              Cancel
            </button>
            <button
              id="create-task-submit"
              form="create-task-form"
              type="submit"
              disabled={saving}
              className="btn-primary px-6"
            >
              {saving ? 'Creating…' : 'Create Task'}
            </button>
          </>
        }
      >
        <form id="create-task-form" onSubmit={handleCreate} className="space-y-4" autoComplete="off">
          {formError && (
            <div className="px-4 py-3 bg-errorContainer/30 border border-error/30 rounded-lg text-error text-sm">
              {formError}
            </div>
          )}

          {/* Project */}
          <div className="form-field">
            <label htmlFor="task-project" className="form-label">Project *</label>
            <select
              id="task-project"
              name="projectId"
              className="form-select"
              value={form.projectId}
              onChange={handleField}
              required
            >
              <option value="">— Select a project —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="form-field">
            <label htmlFor="task-title" className="form-label">Title *</label>
            <input
              id="task-title"
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g. Implement authentication module"
              value={form.title}
              onChange={handleField}
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="form-field">
              <label htmlFor="task-priority" className="form-label">Priority</label>
              <select id="task-priority" name="priority" className="form-select" value={form.priority} onChange={handleField}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-field">
              <label htmlFor="task-status" className="form-label">Status</label>
              <select id="task-status" name="status" className="form-select" value={form.status} onChange={handleField}>
                {COLUMNS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Estimated Hours */}
            <div className="form-field">
              <label htmlFor="task-hours" className="form-label">Estimated Hours</label>
              <input
                id="task-hours"
                name="estimatedHours"
                type="number"
                min={1}
                max={999}
                className="form-input"
                value={form.estimatedHours}
                onChange={handleField}
              />
            </div>

            {/* Complexity */}
            <div className="form-field">
              <label htmlFor="task-complexity" className="form-label">Complexity (1–5)</label>
              <input
                id="task-complexity"
                name="complexityScore"
                type="number"
                min={1}
                max={5}
                className="form-input"
                value={form.complexityScore}
                onChange={handleField}
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="form-field">
            <label htmlFor="task-due" className="form-label">Due Date</label>
            <input
              id="task-due"
              name="dueDate"
              type="date"
              className="form-date"
              value={form.dueDate}
              onChange={handleField}
            />
          </div>

          {/* Assigned To */}
          {resources.length > 0 && (
            <div className="form-field">
              <label htmlFor="task-assigned" className="form-label">Assign To (optional)</label>
              <select id="task-assigned" name="assignedTo" className="form-select" value={form.assignedTo} onChange={handleField}>
                <option value="">— Unassigned —</option>
                {resources.map((r) => (
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
