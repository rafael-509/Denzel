import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Clock, MessageCircle, Phone, 
  ChevronLeft, Navigation, CheckCircle2, XCircle, 
  Star, Send, Image as ImageIcon, ShieldCheck, Sparkles,
  ChevronRight, Globe, CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ActiveJobDashboardProps {
  job: any;
  user: any;
  onClose: () => void;
  onRefresh: () => void;
}

export default function ActiveJobDashboard({ job, user, onClose, onRefresh }: ActiveJobDashboardProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info');
  const [status, setStatus] = useState(job.status);
  const [loading, setLoading] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const isProvider = user.id === job.providerId;

  const handleStatusUpdate = async (newStatus: string, note?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note })
      });
      if (response.ok) {
        setStatus(newStatus);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmFinish = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}/confirm-finish`, { method: 'POST' });
      if (response.ok) {
        setShowRating(true);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, string> = {
    accepted: 'Trabalho Aceite',
    in_progress: 'Em Execução',
    on_the_way: 'A Caminho',
    at_location: 'No Local',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    dispute: 'Em Disputa'
  };

  const currentStep = () => {
    const steps = ['accepted', 'on_the_way', 'at_location', 'in_progress', 'completed'];
    if (status === 'dispute') return 3; // Stay in progress feel but marked as dispute
    return steps.indexOf(status);
  };

  const handleOpenDispute = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dispute', note: 'Cliente abriu uma disputa sobre a conclusão' })
      });
      if (response.ok) {
        setStatus('dispute');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (showRating) {
    return <RatingView job={job} user={user} onDone={onClose} />;
  }

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-[#0f111a] z-[100] flex flex-col"
    >
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white uppercase tracking-tight">{job.title}</h1>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              status === 'dispute' ? "text-red-500" : "text-blue-400"
            )}>
              {statusLabels[status] || status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className={cn(
               "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
               status === 'dispute' ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"
            )}>
                {status === 'dispute' ? <XCircle size={16} /> : <ShieldCheck size={16} />}
            </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-[#151921]">
        <button 
          onClick={() => setActiveTab('info')}
          className={cn(
            "flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
            activeTab === 'info' ? "text-white" : "text-slate-500"
          )}
        >
          Painel
          {activeTab === 'info' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={cn(
            "flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
            activeTab === 'chat' ? "text-white" : "text-slate-500"
          )}
        >
          Chat
          {activeTab === 'chat' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'info' ? (
            <motion.div 
              key="info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-6"
            >
              {/* Status Stepper */}
              <div className="bg-[#151921] rounded-[24px] p-6 border border-white/[0.03]">
                <div className="flex justify-between items-center mb-6">
                  {['Aceite', 'A caminho', 'Chegou', 'Execução', 'Fim'].map((label, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        i <= currentStep() ? "bg-orange-500 border-orange-500 text-white" : "bg-transparent border-white/10 text-slate-700"
                      )}>
                        {i < currentStep() ? <CheckCircle2 size={12} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                      </div>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-tighter",
                        i <= currentStep() ? "text-white" : "text-slate-600"
                      )}>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="h-1 bg-white/5 rounded-full overflow-hidden relative">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(currentStep() / 4) * 100}%` }}
                     className="absolute inset-y-0 left-0 bg-orange-500" 
                   />
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="h-48 bg-[#0b0e14] rounded-[24px] border border-white/5 overflow-hidden relative group">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <MapPin size={32} className="text-orange-500 mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Localização em Tempo Real</p>
                  <p className="text-[10px] text-slate-600 mt-1">{job.location || 'Luanda, Angola'}</p>
                </div>
                <button className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all">
                  <Navigation size={14} /> Abrir GPS
                </button>
              </div>

              {/* Participants */}
              <div className="space-y-4">
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest ml-1">Envolvidos</p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-[#151921] rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white uppercase tracking-tighter">
                        {isProvider ? 'C' : 'P'}
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">{isProvider ? 'Cliente' : 'Prestador'}</p>
                        <p className="text-sm font-bold text-white tracking-tight">Rafael Denzel</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center active:scale-90 transition-all">
                        <Phone size={18} />
                      </button>
                      <button onClick={() => setActiveTab('chat')} className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center active:scale-90 transition-all">
                        <MessageCircle size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Box */}
              <div className="bg-blue-600/10 rounded-[24px] p-6 border border-blue-600/20 space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-1">Valor Seguro (Escrow)</p>
                        <h4 className="text-2xl font-black text-white">{job.price?.toLocaleString()} <span className="text-sm">Kz</span></h4>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                        PAGAMENTO GARANTIDO
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-400 leading-relaxed">
                   O valor está bloqueado no sistema e será libertado após a confirmação mútua da conclusão do serviço.
                 </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full"
            >
              <ChatView jobId={job.id} user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <footer className="p-6 bg-[#151921] border-t border-white/5 space-y-3">
        {status === 'dispute' && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4">
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">
              Este trabalho está em disputa. O sistema está a analisar o caso.
            </p>
          </div>
        )}

        {isProvider && status !== 'completed' && status !== 'dispute' && (
          <div className="flex flex-col gap-3">
            {status === 'accepted' && (
              <button 
                onClick={() => handleStatusUpdate('on_the_way')}
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Navigation size={16} />}
                Já estou a caminho
              </button>
            )}
            {status === 'on_the_way' && (
              <button 
                onClick={() => handleStatusUpdate('at_location')}
                disabled={loading}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MapPin size={16} />}
                Confirmo que cheguei
              </button>
            )}
            {status === 'at_location' && (
              <button 
                onClick={() => handleStatusUpdate('in_progress')}
                disabled={loading}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={16} />}
                Iniciar Execução
              </button>
            )}
            {status === 'in_progress' && (
              <button 
                onClick={() => handleStatusUpdate('completed')}
                disabled={loading}
                className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                Finalizar Trabalho
              </button>
            )}
          </div>
        )}

        {!isProvider && status === 'completed' && job.paymentStatus !== 'released' && (
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleConfirmFinish}
              disabled={loading}
              className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Confirmar Conclusão & Libertar Pagamento
            </button>
            <button 
              onClick={handleOpenDispute}
              disabled={loading}
              className="w-full py-3 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-500/20 active:scale-95 transition-all"
            >
              Não estou satisfeito / Abrir Disputa
            </button>
          </div>
        )}

        {status !== 'completed' && status !== 'dispute' && (
          <button 
            className="w-full py-3 bg-white/5 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/10 transition-all border border-red-500/10"
          >
            Reportar Problema / Cancelar
          </button>
        )}
      </footer>
    </motion.div>
  );
}

function ChatView({ jobId, user }: { jobId: string, user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const resp = await fetch(`/api/jobs/${jobId}/messages`);
      if (resp.ok) {
        const data = await resp.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e?: any) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const content = input;
    setInput('');

    try {
      const resp = await fetch(`/api/jobs/${jobId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (resp.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const quickReplies = ["Já estou a caminho", "Chego em 5 minutos", "Pode confirmar o local?", "Trabalho concluído!"];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0e14]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-slate-700 text-[10px] font-bold uppercase tracking-widest">Inicie a conversa com o cliente</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex", m.senderId === user.id ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                m.senderId === user.id ? "bg-orange-500 text-white rounded-tr-none" : "bg-[#151921] text-slate-300 rounded-tl-none border border-white/5"
              )}>
                {m.content}
                <p className="text-[8px] opacity-40 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-[#151921] border-t border-white/5 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 custom-scrollbar">
          {quickReplies.map(reply => (
            <button 
              key={reply}
              onClick={() => { setInput(reply); }}
              className="flex-shrink-0 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-[9px] font-bold text-slate-400 hover:bg-white/10 transition-all uppercase tracking-tight"
            >
              {reply}
            </button>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-3">
          <button type="button" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
            <ImageIcon size={20} />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva uma mensagem..."
              className="w-full h-full bg-[#0b0e14] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/30"
            />
          </div>
          <button 
            type="submit"
            className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 active:scale-90 transition-all"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

function RatingView({ job, user, onDone }: { job: any, user: any, onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const isProvider = user.id === job.providerId;
  const targetId = isProvider ? job.clientId : job.providerId;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch(`/api/jobs/${job.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, targetId })
      });
      onDone();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f111a] flex items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="w-20 h-20 bg-orange-500 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-orange-500/20">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Trabalho Concluído!</h2>
          <p className="text-slate-500 text-sm">Como foi a sua experiência com {isProvider ? 'o cliente' : 'o prestador'}?</p>
        </div>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star}
              onClick={() => setRating(star)}
              className="p-2 transition-transform active:scale-90"
            >
              <Star 
                size={32} 
                className={cn(star <= rating ? "text-orange-500 fill-orange-500" : "text-slate-700")} 
              />
            </button>
          ))}
        </div>

        <textarea 
          placeholder="Deixe um comentário opcional..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full bg-[#151921] border border-white/5 rounded-2xl p-4 text-sm text-white h-32 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
        />

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
        >
          {loading ? "A enviar..." : "Enviar Avaliação"}
        </button>
      </motion.div>
    </div>
  );
}
