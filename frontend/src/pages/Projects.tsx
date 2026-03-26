import { useEffect, useState } from 'react';
import api from '../api';
import { Plus } from 'lucide-react';
import type { Project } from '../types';

import { useNavigate } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const loadProjects = () => {
    api.get('/projects').then(res => setProjects(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async () => {
    const title = prompt('Enter new project name:');
    if (!title) return;
    try {
      await api.post('/projects', {
        name: title,
        status: 'Active',
        budget: 10000,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString()
      });
      loadProjects();
    } catch (err) {
      console.error(err);
      alert('Error creating project');
    }
  };

  const handleDelete = async (e: any, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch (err) {
      console.error(err);
      alert('Error deleting project');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects Directory</h1>
          <p className="text-[#cbc3d9] mt-2">Manage all ongoing and planned workstreams.</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2 px-6">
          <Plus className="w-5 h-5" /> New Project
        </button>
      </header>

      <div className="surface-card ghost-border p-0 overflow-hidden mt-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#191b24] border-b border-outlineVariant/20 text-[#cbc3d9] text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Project Name</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Budget</th>
              <th className="p-4 font-semibold">Timeline</th>
              <th className="p-4 font-semibold">AI Risk</th>
              <th className="p-4 font-semibold w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outlineVariant/10">
            {projects.length > 0 ? projects.map((p: Project) => (
              <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="hover:bg-[#32343e] transition-colors group cursor-pointer">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-[#4635a7]/30 text-primary text-xs rounded uppercase font-semibold">{p.status}</span>
                </td>
                <td className="p-4">${p.budget?.toLocaleString() || '0'}</td>
                <td className="p-4 text-sm text-[#cbc3d9]">
                  {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'} - {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="p-4 text-sm font-semibold text-[#10b981]">Low</td>
                <td className="p-4 text-right">
                  <button onClick={(e) => handleDelete(e, p.id)} className="text-[#ffb4ab] hover:text-[#93000a] opacity-0 group-hover:opacity-100 transition-opacity">
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#cbc3d9]">No projects found. Create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
