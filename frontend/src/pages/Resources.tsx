import { useEffect, useState } from 'react';
import api from '../api';
import { Edit2, Trash2 } from 'lucide-react';
import type { Resource } from '../types';
import Modal from '../components/Modal';

// ── Type for edit form ──────────────────────────────────
interface ResourceFormData {
  name: string;
  role: string;
  availabilityHours: number;
  skillSet: string;
}

// ── Empty form state ────────────────────────────────────
const emptyForm: ResourceFormData = {
  name: '',
  role: '',
  availabilityHours: 0,
  skillSet: '',
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResourceFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState('');
  const [deleting, setDeleting] = useState(false);

  // ── Load all resources ──────────────────────────────────
  const loadResources = () => {
    setLoading(true);
    api
      .get('/resources')
      .then((res) => {
        const mapId = (x: Resource) => ({ ...x, id: x.id || x._id! });
        setResources(res.data.map(mapId));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadResources(); }, []);

  // ── Field change handler ────────────────────────────────
  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  // ── Open edit panel ─────────────────────────────────────
  const openEdit = (resource: Resource) => {
    setEditingId(resource.id || resource._id!);
    setForm({
      name: resource.name,
      role: resource.role,
      availabilityHours: resource.availabilityHours ?? 0,
      skillSet: resource.skillSet ?? '',
    });
    setFormError('');
    setShowEdit(true);
  };

  // ── Update resource ────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) { setFormError('Resource name is required.'); return; }
    if (!form.role.trim()) { setFormError('Role is required.'); return; }
    if (form.availabilityHours < 0) { setFormError('Availability hours cannot be negative.'); return; }

    setSaving(true);
    try {
      await api.patch(`/resources/${editingId}`, form);
      setShowEdit(false);
      setEditingId(null);
      setForm(emptyForm);
      loadResources();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error?.response?.data?.message ?? 'Failed to update resource.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete resource ────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/resources/${deleteId}`);
      setDeleteId(null);
      setDeletingName('');
      loadResources();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      {/* ── Header ── */}
      <header>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-[#cbc3d9] mt-1">View and manage all project resources.</p>
        </div>
      </header>

      {/* ── Resources Table ── */}
      <div className="surface-card ghost-border p-0 overflow-hidden !hover:bg-surface">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#191b24] border-b border-outlineVariant/20 text-[#cbc3d9] text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Availability (hrs)</th>
              <th className="p-4 font-semibold">Skill Set</th>
              <th className="p-4 font-semibold">Project</th>
              <th className="p-4 font-semibold w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outlineVariant/10">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-[#cbc3d9] animate-pulse">
                  Loading resources…
                </td>
              </tr>
            ) : resources.length > 0 ? (
              resources.map((r) => (
                <tr
                  key={r.id || r._id}
                  className="hover:bg-surfaceHigh/60 transition-colors group"
                >
                  <td className="p-4 font-medium">{r.name}</td>
                  <td className="p-4 text-sm text-[#cbc3d9]">{r.role}</td>
                  <td className="p-4 text-sm font-mono">{r.availabilityHours}</td>
                  <td className="p-4 text-sm text-[#cbc3d9]">{r.skillSet || '—'}</td>
                  <td className="p-4 text-sm text-[#cbc3d9]">
                    {r.projectId?.name || 'N/A'  }
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`edit-resource-${r.id}`}
                      onClick={() => openEdit(r)}
                      className="p-1.5 text-[#cbc3d9] hover:text-primary transition-colors rounded"
                      aria-label={`Edit ${r.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      id={`delete-resource-${r.id}`}
                      onClick={() => { setDeleteId(r.id || r._id!); setDeletingName(r.name); }}
                      className="p-1.5 text-[#cbc3d9] hover:text-error transition-colors rounded"
                      aria-label={`Delete ${r.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-10 text-center text-[#cbc3d9]">
                  No resources yet. Create resources from project details.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Edit Resource Modal ── */}
      <Modal
        open={showEdit}
        onClose={() => {
          setShowEdit(false);
          setEditingId(null);
          setForm(emptyForm);
        }}
        title="Edit Resource"
        maxWidth="max-w-xl"
        footer={
          <>
            <button 
              onClick={() => {
                setShowEdit(false);
                setEditingId(null);
                setForm(emptyForm);
              }} 
              className="btn-secondary px-5"
            >
              Cancel
            </button>
            <button
              id="edit-resource-submit"
              form="edit-resource-form"
              type="submit"
              disabled={saving}
              className="btn-primary px-6"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form id="edit-resource-form" onSubmit={handleUpdate} className="space-y-4" autoComplete="off">
          {formError && (
            <div className="px-4 py-3 bg-errorContainer/30 border border-error/30 rounded-lg text-error text-sm">
              {formError}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="res-name" className="form-label">Resource Name *</label>
            <input
              id="res-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={handleField}
              autoFocus
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="res-role" className="form-label">Role *</label>
            <input
              id="res-role"
              name="role"
              type="text"
              className="form-input"
              placeholder="e.g. Backend Engineer"
              value={form.role}
              onChange={handleField}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="res-availability" className="form-label">Availability (hours)</label>
            <input
              id="res-availability"
              name="availabilityHours"
              type="number"
              min={0}
              step={1}
              className="form-input"
              placeholder="40"
              value={form.availabilityHours}
              onChange={handleField}
            />
          </div>

          <div className="form-field">
            <label htmlFor="res-skills" className="form-label">Skill Set</label>
            <input
              id="res-skills"
              name="skillSet"
              type="text"
              className="form-input"
              placeholder="e.g. TypeScript, React, Node.js"
              value={form.skillSet}
              onChange={handleField}
            />
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        open={!!deleteId}
        onClose={() => {
          setDeleteId(null);
          setDeletingName('');
        }}
        title="Delete Resource"
        maxWidth="max-w-sm"
        footer={
          <>
            <button 
              onClick={() => {
                setDeleteId(null);
                setDeletingName('');
              }} 
              className="btn-secondary px-5"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-resource"
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
          Are you sure you want to delete <strong>{deletingName}</strong>? This action <strong className="text-error">cannot be undone</strong>.
        </p>
      </Modal>
    </div>
  );
}
