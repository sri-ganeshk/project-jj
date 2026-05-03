import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Columns, Users } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import TaskBoard from './pages/TaskBoard';
import Resources from './pages/Resources';

import type { ElementType } from 'react';

function NavItem({ to, icon: Icon, label }: { to: string, icon: ElementType, label: string }) {
  const loc = useLocation();
  const isActive = loc.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-surfaceHigh text-white' : 'text-[#cbc3d9] hover:bg-surface hover:text-white'}`}>
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function App() {
  return (
    <Router>
      <div className="flex bg-background min-h-screen text-[#e1e1ef]">
        
        <aside className="w-64 border-r border-outlineVariant/20 flex flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primaryContainer">
              Agile AI Manager
            </h1>
            <p className="text-xs text-[#cbc3d9] mt-1 tracking-wider uppercase">Luminescent Strategist</p>
          </div>
          
          <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/projects" icon={FolderKanban} label="Projects" />
            <NavItem to="/tasks" icon={Columns} label="Tasks Board" />
            <NavItem to="/resources" icon={Users} label="Resources" />
          </nav>
        </aside>
        
        <main className="flex-1 h-screen overflow-y-auto bg-background selection:bg-primaryContainer selection:text-white">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/tasks" element={<TaskBoard />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;
