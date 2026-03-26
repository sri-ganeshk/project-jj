import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { Sparkles, Calendar, DollarSign, Users } from 'lucide-react';
import type { Project, Task, Resource } from '../types';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.get(`/projects/${id}`).then(res => setProject(res.data)).catch(console.error);
  }, [id]);

  const handleRisk = async () => {
    if (!project) return;
    try {
      alert('Running AI Risk Assessment...');
      await api.get(`/risk/predict/${project.id}`);
      alert('Risk assessment completed!');
    } catch (err) {
      console.error(err);
      alert('Failed to run risk assessment.');
    }
  };

  const handleOptimize = async () => {
    if (!project) return;
    try {
      alert('Running AI Scheduler...');
      await api.post(`/scheduler/optimize/${project.id}`);
      alert('Schedule Optimized successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to optimize schedule.');
    }
  };

  if (!project) return <div className="text-[#cbc3d9] animate-pulse">Loading AI core systems...</div>;

  return (
    <div className="flex gap-8 h-full">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <header>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <span className="px-3 py-1 bg-surfaceHigh text-primary text-xs font-semibold uppercase tracking-wider rounded-lg">
              {project.status}
            </span>
          </div>
          <p className="text-[#cbc3d9] mt-2 flex gap-6">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
            <span className="flex items-center gap-2"><DollarSign className="w-4 h-4"/> ${project.budget?.toLocaleString() || 0}</span>
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-outlineVariant/20 pb-px">
          {['overview', 'tasks', 'resources'].map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-[#cbc3d9] hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {tab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Overview</h3>
              <p className="text-[#cbc3d9]">This project is currently tracking against its main KPIs. See the AI panel for risk assessments.</p>
            </div>
          )}
          {tab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Associated Tasks ({project.tasks?.length || 0})</h3>
              <ul className="divide-y divide-outlineVariant/10">
                {project.tasks?.length ? project.tasks.map((t: Task) => (
                  <li key={t.id} className="py-3 flex justify-between">
                    <span>{t.title || `Task #${t.id}`}</span>
                    <span className="text-[#cbc3d9] text-sm">{t.status || 'To Do'}</span>
                  </li>
                )) : <li className="py-3 text-[#cbc3d9]">No tasks allocated.</li>}
              </ul>
            </div>
          )}
          {tab === 'resources' && (
             <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5"/> Assigned Resources</h3>
              <ul className="flex flex-col gap-2">
                {project.resources?.length ? project.resources.map((r: Resource) => (
                  <li key={r.id} className="p-3 bg-surface rounded-lg ghost-border">
                    {r.name} - {r.role}
                  </li>
                )) : <li className="py-3 text-[#cbc3d9]">No resources assigned.</li>}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* AI Side Panel */}
      <aside className="w-80 flex-shrink-0 flex flex-col gap-6">
        <div className="ai-glass flex flex-col gap-4">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Strategic Automations
          </h3>
          <div className="flex gap-4 mt-auto">
            <button onClick={handleRisk} className="btn-primary flex flex-1 items-center justify-center gap-2 py-3">
               Run AI Risk Assessment
            </button>
            <button onClick={handleOptimize} className="btn-secondary flex flex-1 items-center justify-center gap-2 py-3">
               Optimize Schedule
            </button>
          </div>
        </div>

        <div className="surface-card ghost-border">
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-[#cbc3d9]">Current Predictions</h4>
          <div className="space-y-3">
             <div className="p-3 bg-[#93000a]/20 border border-[#93000a] rounded-lg">
               <p className="text-[#ffb4ab] text-sm font-semibold">Risk Score: HIGH</p>
               <p className="text-[#cbc3d9] text-xs mt-1">Budget burn rate exceeds projected timeline velocity.</p>
             </div>
             <div className="p-3 bg-primaryContainer/20 border border-primary/30 rounded-lg">
               <p className="text-primary text-sm font-semibold">2 Schedule Conflicts</p>
               <p className="text-[#cbc3d9] text-xs mt-1">Task dependencies are misaligned. Run optimizer to resolve.</p>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
