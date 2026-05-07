import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Plus, X, Check, Square, CheckSquare, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('foco-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('foco-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      text: input.trim(),
      completed: false,
      createdAt: Date.now()
    };
    
    setTasks([newTask, ...tasks]);
    setInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-[32px] p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Tarefas Eficientes</h2>
        <span className="text-[10px] mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/10">
          {tasks.filter(t => !t.completed).length} Pendentes
        </span>
      </div>

      <form onSubmit={addTask} className="relative mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Algo a realizar..."
          className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              className={cn(
                "group flex items-center gap-4 p-4 rounded-2xl border transition-all",
                task.completed 
                  ? "bg-white/5 border-transparent opacity-60" 
                  : "bg-white/5 border-white/5 hover:border-white/20"
              )}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "flex-shrink-0 transition-all duration-300 transform active:scale-90",
                  task.completed ? "text-indigo-500" : "text-slate-600 group-hover:text-slate-400"
                )}
              >
                {task.completed ? <CheckSquare size={22} /> : <Square size={22} />}
              </button>
              
              <span 
                className={cn(
                  "flex-1 text-sm font-medium transition-all break-words",
                  task.completed ? "text-slate-500 line-through" : "text-slate-200"
                )}
              >
                {task.text}
              </span>

              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-white/5">
              <Check size={32} className="text-slate-500" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Foco no presente</p>
          </div>
        )}
      </div>

      {tasks.some(t => t.completed) && (
        <button
          onClick={clearCompleted}
          className="mt-6 text-[10px] text-center uppercase tracking-[0.2em] font-bold text-slate-500 hover:text-indigo-400 transition-colors"
        >
          Limpar Concluídas
        </button>
      )}
    </div>
  );
}
