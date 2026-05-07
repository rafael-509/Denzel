import { useState, useEffect, type ChangeEvent } from 'react';
import { StickyNote, Save, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

export default function QuickNote() {
  const [note, setNote] = useState(() => {
    return localStorage.getItem('foco-note') || '';
  });
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('foco-note', note);
      setIsSaved(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [note]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    setIsSaved(false);
  };

  const clearNote = () => {
    if (confirm('Limpar todas as notas?')) {
      setNote('');
    }
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-[32px] p-8 relative group overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
             <StickyNote size={18} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Notas Rápidas</h2>
        </div>
        <div className="flex items-center gap-4">
           <span className={cn(
             "text-[10px] uppercase tracking-widest font-bold transition-opacity duration-500",
             isSaved ? "opacity-30 text-slate-500" : "opacity-100 text-cyan-400"
           )}>
             {isSaved ? 'Salvo' : 'Editando'}
           </span>
           <button 
             onClick={clearNote}
             className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-red-400 text-slate-500"
             title="Limpar tudo"
           >
             <RotateCcw size={16} />
           </button>
        </div>
      </div>

      <textarea
        value={note}
        onChange={handleChange}
        placeholder="Insights valiosos aqui..."
        className="flex-1 w-full bg-transparent text-sm text-slate-200 resize-none focus:outline-none placeholder:text-slate-700 leading-relaxed font-sans custom-scrollbar"
      />
      
      <div className="absolute -bottom-6 -right-6 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
        <StickyNote size={120} />
      </div>
    </div>
  );
}
