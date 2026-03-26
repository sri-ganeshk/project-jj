import { useEffect, useState } from 'react';
import api from '../api';
import { Activity, Layout, AlertTriangle, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, tasks: 0 });

  useEffect(() => {
    // Attempting to fetch from backend
    api.get('/projects').then(res => setStats(s => ({ ...s, projects: res.data.length }))).catch(console.error);
    api.get('/tasks').then(res => setStats(s => ({ ...s, tasks: res.data.length }))).catch(console.error);
  }, []);

  const handleRunReport = async () => {
    const pId = prompt('Enter Project ID to generate AI Report for: (e.g., 1)');
    if (!pId) return;
    try {
      alert('Generating Executive Report...');
      await api.get(`/report/generate/${pId}`);
      alert('Report generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate report.');
    }
  };

  const handleOptimize = async () => {
    const pId = prompt('Enter Project ID to run AI Optimizer on: (e.g., 1)');
    if (!pId) return;
    try {
      alert('Running AI Scheduler...');
      await api.post(`/scheduler/optimize/${pId}`);
      alert('Schedule Optimized successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to optimize schedule.');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[#cbc3d9] mt-2">Welcome to your intelligence command center.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="surface-card flex items-center justify-between border-t-2 border-primaryContainer">
          <div>
            <p className="text-[#cbc3d9] text-sm uppercase tracking-wider font-semibold">Total Projects</p>
            <h2 className="text-4xl font-bold mt-2">{stats.projects || 12}</h2>
          </div>
          <div className="p-3 bg-surfaceHighest rounded-2xl text-primary">
            <Layout className="w-8 h-8" />
          </div>
        </div>
        <div className="surface-card flex items-center justify-between border-t-2 border-[#10b981]">
          <div>
            <p className="text-[#cbc3d9] text-sm uppercase tracking-wider font-semibold">Active Tasks</p>
            <h2 className="text-4xl font-bold mt-2">{stats.tasks || 45}</h2>
          </div>
          <div className="p-3 bg-surfaceHighest rounded-2xl text-[#10b981]">
            <Activity className="w-8 h-8" />
          </div>
        </div>
        <div className="surface-card flex items-center justify-between border-t-2 border-[#ffb4ab]">
          <div>
            <p className="text-[#cbc3d9] text-sm uppercase tracking-wider font-semibold">Avg Risk Score</p>
            <h2 className="text-4xl font-bold mt-2">2.4 <span className="text-lg text-[#cbc3d9]">/ 5</span></h2>
          </div>
          <div className="p-3 bg-surfaceHighest rounded-2xl text-[#ffb4ab]">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="ai-glass flex flex-col">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Insights & Actions
          </h3>
          <div className="flex flex-col gap-4 mt-auto">
            <button onClick={handleRunReport} className="btn-primary flex items-center justify-center gap-2 py-4 text-lg">
               Generate AI Executive Report
            </button>
            <button onClick={handleOptimize} className="btn-secondary flex items-center justify-center gap-2 py-4 text-lg">
               Run AI Schedule Optimizer
            </button>
          </div>
        </div>
        
        <div className="surface-card ghost-border">
          <h3 className="text-xl font-semibold mb-6">At-Risk Alerts</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center p-4 rounded-lg bg-[#32343e]/50 hover:bg-[#32343e] cursor-pointer transition-colors">
              <div>
                <span className="block font-medium">Supply Chain Delay</span>
                <span className="text-xs text-[#cbc3d9]">Project: Alpha Upgrade</span>
              </div>
              <span className="px-3 py-1 bg-[#93000a] text-[#ffdad6] text-xs font-semibold rounded-full">High Risk</span>
            </li>
            <li className="flex justify-between items-center p-4 rounded-lg bg-[#32343e]/50 hover:bg-[#32343e] cursor-pointer transition-colors">
              <div>
                <span className="block font-medium">Resource Bottleneck</span>
                <span className="text-xs text-[#cbc3d9]">Project: Beta Launch</span>
              </div>
              <span className="px-3 py-1 bg-[#4635a7] text-[#c7bfff] text-xs font-semibold rounded-full">Medium</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
