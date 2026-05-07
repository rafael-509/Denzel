import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, CheckCircle, Clock, DollarSign, Target, Star, ShieldAlert } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function DashboardStats({ user }: any) {
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiConfig, setAiConfig] = useState({ systemInstructions: '', modelName: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const isAdmin = user.email === 'rafaeldenzel12@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      // Fetch stats
      fetch('/api/admin/stats')
        .then(res => res.json())
        .then(data => {
          setAdminStats(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      // Fetch AI Config
      fetch('/api/ai/config')
        .then(res => res.json())
        .then(data => setAiConfig(data));
    }
  }, [isAdmin]);

  const handleUpdateAI = async () => {
    setSaveLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig)
      });
      const data = await res.json();
      setMessage(data.message);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Erro ao atualizar');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <ShieldAlert size={32} />
        </div>
        <h3 className="font-bold text-lg">Acesso Restrito</h3>
        <p className="text-sm text-slate-500 max-w-[200px]">Este painel é exclusivo para o administrador do Trampo Rápido.</p>
      </div>
    );
  }

  if (loading || !adminStats) {
    return <div className="py-20 text-center animate-pulse text-xs font-black uppercase tracking-widest text-slate-500">Carregando métricas globais...</div>;
  }

  const stats = [
    { label: 'Utilizadores', value: adminStats.totalUsers, icon: <Users className="text-blue-500" size={18} />, trend: 'Ativos' },
    { label: 'Total de Jobs', value: adminStats.totalJobs, icon: <Target className="text-orange-500" size={18} />, trend: `${adminStats.activeJobs} abertos` },
    { label: 'Valor em Escrow', value: `${adminStats.totalEscrow} Kz`, icon: <DollarSign className="text-emerald-500" size={18} />, trend: 'Seguro' },
    { label: 'Jobs Fechados', value: adminStats.completedJobs, icon: <CheckCircle className="text-purple-500" size={18} />, trend: '+100%' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#151921] border border-white/5 rounded-[24px] p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/20">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{stat.label}</p>
              <p className="text-lg font-black tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#151921] border border-white/5 rounded-[32px] p-6 h-64 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Tráfego do Sistema</h3>
          <TrendingUp size={14} className="text-orange-500" />
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={adminStats.dailyActivity}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              dy={10}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1c212b', border: '1px solid #ffffff10', borderRadius: '12px' }}
              itemStyle={{ color: '#fff', fontSize: '10px' }}
            />
            <Area 
              type="monotone" 
              dataKey="valor" 
              stroke="#f97316" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI Management Section */}
      <div className="bg-[#151921] border border-white/5 rounded-[32px] p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Users size={14} className="text-orange-500" /> Personalidade do Gemini
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">Personaliza o comportamento do IA em tempo real</p>
           </div>
           {message && (
             <motion.span 
               initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
               className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full"
             >
               {message}
             </motion.span>
           )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Modelo de IA</label>
            <select 
              value={aiConfig.modelName}
              onChange={e => setAiConfig(prev => ({ ...prev, modelName: e.target.value }))}
              className="w-full bg-[#0b0e14] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-orange-500 focus:outline-none"
            >
              <option value="gemini-3-flash-preview">Gemini 3 Flash (Rápido)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Inteligente)</option>
            </select>
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Instruções de Sistema</label>
             <textarea 
               value={aiConfig.systemInstructions}
               onChange={e => setAiConfig(prev => ({ ...prev, systemInstructions: e.target.value }))}
               className="w-full h-32 bg-[#0b0e14] border border-white/5 rounded-2xl p-4 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all leading-relaxed"
               placeholder="Ex: Você é um assistente engraçado..."
             />
          </div>

          <button 
            onClick={handleUpdateAI}
            disabled={saveLoading}
            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {saveLoading ? 'Atualizando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
