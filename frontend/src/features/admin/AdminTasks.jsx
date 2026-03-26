import { useEffect, useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  ListChecks,
  AlertCircle,
} from 'lucide-react';

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = {
  low: 'bg-sky-500/15 text-sky-400',
  medium: 'bg-amber-500/15 text-amber-400',
  high: 'bg-red-500/15 text-red-400',
};

const AdminTasks = () => {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem('eventro_admin_tasks');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    localStorage.setItem('eventro_admin_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setInputError('Please enter a task title.');
      return;
    }

    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        title: cleanTitle,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    setInputError('');
    setTitle('');
  };

  const toggleTask = (id) =>
    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  const deleteTask = (id) => setTasks((current) => current.filter((t) => t.id !== id));

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-slate-400 text-sm mt-1">Track and manage your event tasks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: tasks.length, color: 'text-white' },
          { label: 'Active', value: tasks.length - completedCount, color: 'text-amber-400' },
          { label: 'Completed', value: completedCount, color: 'text-emerald-400' },
          { label: 'Progress', value: `${progress}%`, color: 'text-indigo-400' },
        ].map((s, i) => (
          <div key={i} className="bg-[#141B2D] rounded-xl p-4 border border-slate-700/40">
            <p className="text-slate-400 text-xs font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add Task */}
      <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (inputError) setInputError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTask();
              }
            }}
            placeholder="Add a new task..."
            className="flex-1 min-w-[200px] bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="button"
            onClick={addTask}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700/60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"
            disabled={!title.trim()}
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
        {inputError && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-400">
            <AlertCircle size={12} /> {inputError}
          </p>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === f
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 divide-y divide-slate-700/30">
        {filtered.length > 0 ? (
          filtered.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition group"
            >
              <button onClick={() => toggleTask(task.id)} className="shrink-0">
                {task.completed ? (
                  <CheckCircle2 size={22} className="text-emerald-400" />
                ) : (
                  <Circle size={22} className="text-slate-500 group-hover:text-slate-300" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    task.completed ? 'line-through text-slate-500' : 'text-white'
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Clock size={11} />{' '}
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_COLORS[task.priority]}`}
              >
                {task.priority}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-700/40 flex items-center justify-center mb-3">
              <ListChecks size={24} className="text-slate-500" />
            </div>
            <p className="text-slate-500 text-sm">
              {tasks.length === 0
                ? 'No tasks yet. Add your first task above!'
                : 'No tasks match this filter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTasks;
