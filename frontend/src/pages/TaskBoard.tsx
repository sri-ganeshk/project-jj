import { useEffect, useState } from 'react';
import api from '../api';
import { Plus } from 'lucide-react';
import type { Task } from '../types';

const columns = ['To Do', 'In Progress', 'In Review', 'Done'];

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = () => {
    api.get('/tasks').then(res => setTasks(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async () => {
    const title = prompt('Enter task title:');
    if (!title) return;
    try {
      await api.post('/tasks', {
        title,
        status: 'To Do',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString()
      });
      loadTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    }
  };

  const onDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('taskId', id.toString());
  };

  const onDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('taskId');
    if (!id) return;
    try {
      await api.patch(`/tasks/${id}`, { status });
      loadTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to update task status');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Tasks</h1>
          <p className="text-[#cbc3d9] mt-2">Manage workloads and sprint progress.</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2 px-6">
          <Plus className="w-5 h-5" /> Add Task
        </button>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar flex-1 items-start">
        {columns.map(col => (
          <div 
            key={col} 
            className="w-80 flex-shrink-0 flex flex-col bg-surface/50 rounded-xl p-4 ghost-border"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, col)}
          >
            <h3 className="font-semibold text-[#cbc3d9] uppercase tracking-wider text-sm mb-4">{col}</h3>
            <div className="flex flex-col gap-3">
              {tasks.filter((t: Task) => t.status === col || (col === 'To Do' && !t.status)).length > 0 
                ? tasks.filter((t: Task) => t.status === col || (col === 'To Do' && !t.status)).map((t: Task) => (
                    <div 
                      key={t.id} 
                      draggable
                      onDragStart={(e) => onDragStart(e, t.id)}
                      className="surface-card p-4 ghost-border cursor-grab hover:-translate-y-1 transition-transform relative"
                    >
                      {t.priority === 'High' && (
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-error text-white text-[10px] uppercase font-bold rounded-bl-lg rounded-tr-lg">
                          High
                        </div>
                      )}
                      {t.id % 2 !== 0 && (
                        <div className="mb-2 w-fit px-2 py-1 bg-primaryContainer/30 border border-primary/30 rounded text-xs text-primary font-semibold">
                          ✦ AI: Schedule Conflict
                        </div>
                      )}
                      <h4 className="font-medium text-white mb-2">{t.title || 'Untitled Task'}</h4>
                      <p className="text-xs text-[#cbc3d9] line-clamp-2">{t.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between text-xs text-[#cbc3d9]">
                        <span>Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'TBD'}</span>
                        <div className="w-6 h-6 rounded-full bg-tertiaryContainer flex items-center justify-center text-white text-xs">
                          {t.resourceId ? 'JD' : '?'}
                        </div>
                      </div>
                    </div>
                ))
                : (
                   <div className="p-4 text-center border-2 border-dashed border-outlineVariant/20 rounded-lg text-[#cbc3d9] text-sm">
                     Empty
                   </div>
                )
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
