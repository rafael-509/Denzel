import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, DollarSign, AlertTriangle, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { JOB_CATEGORIES } from '../constants';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateJobModal({ isOpen, onClose, onSuccess }: CreateJobModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(JOB_CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          price: Number(price),
          urgency,
          location: 'Viana, Luanda' // Mocked GPS for now
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setPrice('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="w-full max-w-lg bg-[#151921] border border-white/5 rounded-[32px] p-7 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Briefcase size={18} />
                 </div>
                 <h2 className="text-lg font-bold">Novo Pedido</h2>
              </div>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Título do Trabalho</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Pintar Muro Exterior"
                  className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 appearance-none transition-all font-medium"
                  >
                    {JOB_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Preço (Kz)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-bold mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Urgência</label>
                <div className="flex gap-2 p-1 bg-[#0d1117] rounded-2xl border border-white/5">
                   {(['low', 'medium', 'high'] as const).map((u) => (
                     <button
                       key={u}
                       type="button"
                       onClick={() => setUrgency(u)}
                       className={cn(
                         "flex-1 py-2.5 rounded-xl text-[9px] uppercase font-bold tracking-widest transition-all",
                         urgency === u ? "bg-orange-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                       )}
                     >
                       {u === 'low' ? 'Baixa' : u === 'medium' ? 'Normal' : 'Urgente'}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique o que precisa..."
                  rows={3}
                  className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 text-orange-400 text-[10px] font-medium leading-relaxed">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <p>O pagamento fica retido de forma segura até que confirme a conclusão do trabalho.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-xs shadow-xl shadow-orange-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Publicar Trabalho'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
