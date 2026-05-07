/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, MapPin, Star, Clock, 
  MessageCircle, User, LayoutGrid, Luggage, Wallet,
  LogOut, Bell, Settings, Hammer, Sparkles, Filter, 
  Car, Trash, Zap, Smartphone, ChevronRight, Briefcase,
  TrendingUp, ShieldCheck, X, Share2, Copy, Bot, Send
} from 'lucide-react';
import Login from './components/Login';
import CreateJobModal from './components/CreateJobModal';
import SettingsView from './components/SettingsView';
import ActiveJobDashboard from './components/ActiveJobDashboard';
import SmartSearch from './components/SmartSearch';
import DashboardStats from './components/DashboardStats';
import { getGeminiResponse } from './services/aiAssistant';
import { cn } from './lib/utils';
import { JOB_CATEGORIES } from './constants';

type Tab = 'dashboard' | 'home' | 'jobs' | 'chat' | 'profile';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [jobs, setJobs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newNotification, setNewNotification] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSubView, setSettingsSubView] = useState<any>('main');
  const [selectedActiveJob, setSelectedActiveJob] = useState<any>(null);
  
  // AI Assistant State
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<any[]>([
    { role: 'assistant', content: 'Olá! Sou o Génio do Trampo. Como posso ajudar-te hoje, tropa?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const isAdmin = user?.email === 'rafaeldenzel12@gmail.com';

  const openSettings = (subView: any = 'main') => {
    setSettingsSubView(subView);
    setIsSettingsOpen(true);
  };

  // Check for newly accepted jobs to open dashboard automatically
  useEffect(() => {
    const activeJob = jobs.find(j => 
      (j.status !== 'open' && j.status !== 'completed' && j.status !== 'cancelled') && 
      (j.clientId === user?.id || j.providerId === user?.id)
    );
    if (activeJob && !selectedActiveJob) {
      setSelectedActiveJob(activeJob);
    }
  }, [jobs, user]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // Set default tab based on admin role
          if (data.user.email === 'rafaeldenzel12@gmail.com') {
            setActiveTab('dashboard');
          } else {
            setActiveTab('home');
          }
        }
      } catch (err) {
        console.error('Auth check failed', err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const eventSource = new EventSource('/api/notifications/stream');
      
      eventSource.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        setNotifications(prev => [notification, ...prev]);
        setNewNotification(notification);
        
        // Auto hide toast
        setTimeout(() => setNewNotification(null), 5000);
      };

      // Fetch existing notifications
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => setNotifications(data));

      return () => eventSource.close();
    }
  }, [user]);

  const markNotificationsRead = async () => {
    if (notifications.some(n => !n.read)) {
      try {
        await fetch('/api/notifications/read', { method: 'POST' });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      markNotificationsRead();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user, activeTab]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#0f111a] text-white flex flex-col selection:bg-orange-500/30 overflow-x-hidden font-sans">
      <AnimatePresence>
        {newNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 24, x: '-50%' }}
            exit={{ opacity: 0, y: -100, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[200] w-[90%] max-w-md bg-[#1c212b] border border-orange-500/30 rounded-2xl p-4 shadow-2xl flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
              <Bell size={20} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">{newNotification.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{newNotification.message}</p>
            </div>
            <button onClick={() => setNewNotification(null)} className="text-slate-600 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Area */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
          <MapPin size={12} className="text-orange-500" />
          Trampo Rápido
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Olá <span className="text-orange-500">{user.name?.split(' ')[0] || 'Utilizador'}</span>
          </h1>
          <button className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center relative">
            <Bell size={20} className="text-slate-300" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border border-[#0f111a]"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-28 px-6 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
               <h2 className="text-xl font-bold tracking-tight">Painel de Controlo</h2>
               <DashboardStats user={user} jobs={jobs} />
            </motion.div>
          )}

          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Active Jobs Widget */}
              {jobs.filter(j => 
                 (j.status !== 'open' && j.status !== 'completed' && j.status !== 'cancelled') && 
                 (j.clientId === user?.id || j.providerId === user?.id)
              ).map(activeJob => (
                <button 
                  key={activeJob.id}
                  onClick={() => setSelectedActiveJob(activeJob)}
                  className="w-full bg-orange-500 rounded-[24px] p-5 flex items-center justify-between shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                        <Zap size={20} />
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] text-white/70 uppercase font-black tracking-widest">Trabalho em Curso</p>
                        <h4 className="text-white font-bold text-sm tracking-tight">{activeJob.title}</h4>
                     </div>
                  </div>
                  <ChevronRight size={20} className="text-white/60" />
                </button>
              ))}

              {/* Wallet Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-[28px] p-8 shadow-xl shadow-blue-900/20">
                <div className="flex items-center justify-between gap-2 text-white/80 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-orange-400" />
                    A minha wallet
                  </div>
                  {user.pendingBalance > 0 && (
                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/5">
                      {user.pendingBalance.toLocaleString()} Kz em Escrow
                    </div>
                  )}
                </div>
                <div className="text-4xl font-bold mb-8 tracking-tighter">
                  {user.balance?.toLocaleString('pt-AO', { minimumFractionDigits: 2 }) || '0,00'} <span className="text-2xl text-orange-400">AOA</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => openSettings('deposit')}
                    className="bg-[#0b0e14]/90 text-white py-3 rounded-2xl font-bold text-xs transform active:scale-95 transition-all"
                  >
                    Carregar
                  </button>
                  <button 
                    onClick={() => openSettings('withdraw')}
                    className="bg-white/10 border border-white/20 text-white py-3 rounded-2xl font-bold text-xs transform active:scale-95 transition-all"
                  >
                    Sacar
                  </button>
                </div>
              </div>

              {user.role === 'client' ? (
                <ClientHome jobs={jobs} onPublishClick={() => setIsModalOpen(true)} />
              ) : (
                <ProviderHome jobs={jobs} onRefresh={fetchJobs} onSelect={setSelectedActiveJob} />
              )}
            </motion.div>
          )}

          {activeTab === 'jobs' && (
             <div className="space-y-6">
                <h2 className="text-xl font-bold">Histórico</h2>
                {jobs.map((job: any) => <JobCard key={job.id} job={job} userRole={user.role} onRefresh={fetchJobs} onSelect={setSelectedActiveJob} />)}
             </div>
          )}

          {activeTab === 'chat' && (
            <motion.div 
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-black tracking-tight">Alertas</h2>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="py-20 text-center text-slate-500 text-sm">Nenhuma notificação por enquanto.</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={cn(
                        "p-5 rounded-[24px] border border-white/5 flex gap-4 transition-all",
                        notif.read ? "bg-[#151921] opacity-60" : "bg-orange-500/5 border-orange-500/10"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        notif.type === 'new_job' ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500"
                      )}>
                        {notif.type === 'new_job' ? <Sparkles size={20} /> : <MessageCircle size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
             <ProfileView user={user} onLogout={handleLogout} onOpenSettings={openSettings} />
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f111a] border-t border-white/5 px-6 py-4 flex justify-between items-center z-50">
        {isAdmin && <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<TrendingUp size={24} />} label="Gestão" />}
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutGrid size={24} />} label="Início" />
        <NavButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} icon={<Luggage size={24} />} label="Histórico" />
        <NavButton 
          active={activeTab === 'chat'} 
          onClick={() => setActiveTab('chat')} 
          icon={
            <div className="relative">
              <Bell size={24} />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-[#0f111a]" />
              )}
            </div>
          } 
          label="Alertas" 
        />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={24} />} label="Perfil" />
      </nav>

      {isSettingsOpen && (
        <SettingsView 
          user={user} 
          onUpdate={setUser} 
          onLogout={handleLogout} 
          onClose={() => setIsSettingsOpen(false)} 
          initialSubView={settingsSubView}
        />
      )}

      <CreateJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchJobs} 
      />

      <AnimatePresence>
        {selectedActiveJob && (
          <ActiveJobDashboard 
            job={selectedActiveJob}
            user={user}
            onClose={() => setSelectedActiveJob(null)}
            onRefresh={fetchJobs}
          />
        )}
      </AnimatePresence>

      <ReviewModal />

      {/* Floating AI Assistant Button */}
      {!showAIChat && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 z-[100] active:scale-90 transition-all border border-white/20"
        >
          <Bot size={28} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f111a]" />
        </motion.button>
      )}

      {/* AI Assistant Chat Popover */}
      <AnimatePresence>
        {showAIChat && (
          <div className="fixed inset-0 z-[200] sm:inset-auto sm:bottom-24 sm:right-6 sm:w-80 sm:h-[450px] bg-[#151921] sm:rounded-[32px] border border-white/5 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-orange-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Génio do Trampo</h3>
                  <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Online
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowAIChat(false)}
                className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {aiMessages.map((msg, i) => (
                <div key={i} className={cn(
                  "max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-orange-500 text-white ml-auto rounded-tr-none" 
                    : "bg-white/5 text-slate-300 rounded-tl-none border border-white/5"
                )}>
                  {msg.content}
                </div>
              ))}
              {aiLoading && (
                <div className="bg-white/5 text-slate-500 p-4 rounded-2xl rounded-tl-none border border-white/5 w-fit">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-[#0d1117]">
              <div className="relative">
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !aiLoading && aiInput.trim()) {
                      handleAISend();
                    }
                  }}
                  placeholder="Escreve uma mensagem..."
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all font-medium"
                />
                <button 
                  onClick={handleAISend}
                  disabled={aiLoading || !aiInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  async function handleAISend() {
    const text = aiInput.trim();
    if (!text) return;
    
    setAiMessages(prev => [...prev, { role: 'user', content: text }]);
    setAiInput('');
    setAiLoading(true);
    
    const response = await getGeminiResponse(text);
    setAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setAiLoading(false);
  }
}

function ReviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (window as any).openReviewModal = (j: any) => {
      setJob(j);
      setIsOpen(true);
    };
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: job.providerId || job.clientId,
          jobId: job.id,
          rating,
          comment
        })
      });
      // Mock local update
      job.rated = true;
      setIsOpen(false);
      setRating(5);
      setComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-[#1c212b] rounded-[32px] p-8 border border-white/5 shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-2 tracking-tight">Avaliar Serviço</h3>
            <p className="text-slate-500 text-[10px] mb-8 uppercase tracking-[0.2em] font-black">{job?.title}</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={cn(
                    "p-1 transition-all",
                    s <= rating ? "text-orange-500 scale-110" : "text-white/10"
                  )}
                >
                  <Star size={32} fill={s <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Como foi o serviço? (opcional)"
              className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none mb-8 min-h-[100px] resize-none"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-1 py-4 text-slate-500 font-bold text-[10px] uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
              >
                {loading ? '...' : 'Enviar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-orange-500" : "text-slate-500 hover:text-slate-300"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold tracking-tight">{label}</span>
    </button>
  );
}

function ClientHome({ jobs, onPublishClick }: any) {
  const displayCategories = [
    { name: 'Limpeza de casas', icon: <Sparkles size={20} />, color: 'bg-emerald-500/10 text-emerald-400' },
    { name: 'Reparação de móveis', icon: <Hammer size={20} />, color: 'bg-amber-500/10 text-amber-400' },
    { name: 'Aulas de inglês', icon: <Smartphone size={20} />, color: 'bg-purple-500/10 text-purple-400' },
    { name: 'Design gráfico simples', icon: <LayoutGrid size={20} />, color: 'bg-blue-500/10 text-blue-400' },
    { name: 'Lavagem de carros', icon: <Car size={20} />, color: 'bg-orange-500/10 text-orange-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight">O que precisas hoje?</h2>
        <div className="relative mt-4">
           <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
           <input 
             type="text" 
             placeholder="Pesquise por serviço (ex: Limpa-chão)" 
             className="w-full bg-[#151921] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-orange-500/30 text-sm font-medium"
           />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 ml-1">
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600">Categorias populares</p>
          <button className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Ver Todas</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {displayCategories.map((cat, i) => (
            <button key={i} className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 shadow-sm", cat.color)}>
                {cat.icon}
              </div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest text-center w-20 truncate">{cat.name}</span>
            </button>
          ))}
          {JOB_CATEGORIES.slice(10, 15).map((catName, i) => (
            <button key={i} className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 bg-white/5 text-slate-500 border border-white/5">
                <Briefcase size={20} />
              </div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest text-center w-20 truncate">{catName}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#151921] rounded-[32px] p-8 border border-white/[0.03] shadow-sm">
        <h3 className="font-bold text-lg mb-2">Trampo Urgente?</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">Publique agora e receba propostas de prestadores qualificados em minutos.</p>
        <button 
          onClick={onPublishClick}
          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
        >
          + Publicar Pedido
        </button>
      </div>
    </div>
  );
}

function ProviderHome({ jobs, onRefresh, onSelect }: any) {
  const [online, setOnline] = useState(true);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);

  const displayJobs = searchResults || jobs;

  return (
    <div className="space-y-6">
      <SmartSearch 
        onSearch={setSearchResults} 
        onAccept={onRefresh} 
        onDetails={onSelect}
      />

      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {searchResults ? 'Resultados' : 'Disponíveis'}
          </h2>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
            {displayJobs.length} {displayJobs.length === 1 ? 'Job encontrado' : 'Jobs encontrados'}
          </p>
        </div>
        <button 
          onClick={() => setOnline(!online)}
          className={cn(
            "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all",
            online ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-slate-500"
          )}
        >
          {online ? 'Online' : 'Offline'}
        </button>
      </div>

      <div className="space-y-4">
        {displayJobs.length === 0 ? (
           <div className="py-20 text-center opacity-40 text-xs font-bold uppercase tracking-widest">Nenhum trabalho encontrado</div>
        ) : (
           displayJobs.map((job: any) => <JobCard key={job.id} job={job} userRole="provider" onRefresh={onRefresh} onSelect={onSelect} />)
        )}
      </div>
    </div>
  );
}

function JobCard({ job, userRole, onRefresh, onSelect }: any) {
  const urgencyColors = {
    high: 'text-red-400 bg-red-400/10',
    medium: 'text-amber-400 bg-amber-400/10',
    low: 'text-emerald-400 bg-emerald-400/10'
  };

  const handleAccept = async (e: any) => {
    e.stopPropagation();
    try {
      const resp = await fetch(`/api/jobs/${job.id}/accept`, { method: 'POST' });
      const acceptedJob = await resp.json();
      onRefresh?.();
      if (onSelect) onSelect(acceptedJob);
    } catch (err) {
      console.error(err);
    }
  };

  const statusLabels = {
    open: 'Aberto',
    accepted: 'Aceite',
    in_progress: 'Em Execução',
    on_the_way: 'A Caminho',
    at_location: 'No Local',
    completed: 'Concluído',
    cancelled: 'Cancelado'
  };

  const isActive = job.status !== 'open' && job.status !== 'completed' && job.status !== 'cancelled';
  const isCompleted = job.status === 'completed';

  return (
    <div 
      onClick={() => isActive && onSelect?.(job)}
      className={cn(
        "bg-[#151921] rounded-[24px] p-6 border border-white/[0.03] transition-all group relative overflow-hidden",
        isActive ? "border-orange-500/20 hover:border-orange-500/40 cursor-pointer" : "hover:border-orange-500/30"
      )}
    >
      {isActive && (
        <div className="absolute top-0 right-0 p-2 bg-orange-500/10 rounded-bl-xl text-[8px] font-black text-orange-500 uppercase tracking-widest">
           Em Curso
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className={cn("text-[7px] px-2 py-0.5 rounded-full uppercase font-black tracking-[0.2em]", (urgencyColors as any)[job.urgency || 'low'])}>
              {job.urgency}
            </span>
            <span className="text-[7px] px-2 py-0.5 rounded-full uppercase font-black tracking-[0.2em] bg-white/5 text-slate-500">
               {(statusLabels as any)[job.status] || job.status}
            </span>
          </div>
            <h4 className="text-base font-bold group-hover:text-orange-500 transition-colors uppercase tracking-tight flex items-center gap-1.5">
              {job.title}
              {job.clientVerified && <ShieldCheck size={14} className="text-blue-500 fill-blue-500/10" />}
            </h4>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 mb-1">
              <Star size={10} className="text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-black text-slate-400">4.9</span>
            </div>
            <p className="text-lg font-black text-orange-500 tracking-tighter">{job.price ? job.price.toLocaleString() : '0'} <span className="text-[10px]">Kz</span></p>
            <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Saldo Seguro</p>
          </div>
        </div>
      
      <p className="text-[11px] text-slate-400 line-clamp-2 mb-5 leading-relaxed font-medium">{job.description}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-3 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5"><MapPin size={10} className="text-orange-500" /> 2.4km</div>
          <div className="flex items-center gap-1.5"><Clock size={10} className="text-blue-500" /> {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div className="flex gap-2">
          {userRole === 'provider' && job.status === 'open' && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onSelect?.(job); }}
                className="px-3 py-2 bg-white/5 text-slate-400 rounded-xl font-bold text-[9px] uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all"
              >
                Detalhes
              </button>
              <button 
                onClick={handleAccept}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 transition-all transform active:scale-95 shadow-lg shadow-orange-500/20"
              >
                Aceitar Trabalho
              </button>
            </>
          )}
          {isActive && (
            <button 
              className="px-4 py-2 bg-white/5 text-white rounded-xl font-black text-[9px] uppercase tracking-widest border border-white/10"
            >
              Ver Painel
            </button>
          )}
          {isCompleted && !job.rated && (
            <button 
              onClick={(e) => { e.stopPropagation(); (window as any).openReviewModal?.(job); }}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              Avaliar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileView({ user, onLogout, onOpenSettings }: any) {
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://ais-pre-36tzwlbgntmhecyehmxmdw-790781577580.europe-west2.run.app";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Trampo Rápido',
          text: 'Encontra os melhores serviços em Luanda!',
          url: shareUrl,
        });
      } catch (err) {
        console.error('Erro ao partilhar:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-24 h-24 rounded-[32px] bg-blue-600 border-4 border-white/5 flex items-center justify-center text-4xl font-bold mb-4 shadow-2xl text-white">
          {user.name?.[0] || 'U'}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-slate-500 text-sm">{user.phone}</p>
          <button onClick={() => onOpenSettings('main')} className="p-1.5 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
            <Settings size={14} />
          </button>
        </div>
        <span className="mt-3 px-4 py-1.5 bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-orange-500/20">
          {user.role === 'client' ? 'Cliente Verificado' : 'Prestador Premium'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onOpenSettings('wallet')}
          className="bg-[#151921] rounded-[24px] p-6 text-center border border-white/5 active:scale-95 transition-all"
        >
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black mb-2">Carteira</p>
          <p className="text-xl font-black text-orange-500">{user.balance || 0} <span className="text-[10px]">Kz</span></p>
        </button>
        <button 
          onClick={() => onOpenSettings('kyc')}
          className="bg-[#151921] rounded-[24px] p-6 text-center border border-white/5 active:scale-95 transition-all"
        >
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black mb-2">Avaliação</p>
          <p className="text-xl font-black flex items-center justify-center gap-1">5.0 <Star size={16} fill="#f97316" className="text-orange-500" /></p>
        </button>
      </div>

      <div className="space-y-3">
        <button 
          onClick={handleShare}
          className="w-full flex items-center justify-between p-5 bg-orange-500/5 rounded-2xl border border-orange-500/10 hover:bg-orange-500/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Share2 size={18} className="text-orange-500" />
            <div className="text-left">
              <span className="text-sm font-bold block text-white">Convidar Amigos</span>
              <span className="text-[10px] text-orange-500/70 font-bold uppercase tracking-wider">Ganha bónus por recomendação</span>
            </div>
          </div>
          {copied ? (
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Copiado!</span>
          ) : (
            <ChevronRight size={18} className="text-orange-500/40" />
          )}
        </button>

        <button 
          onClick={() => onOpenSettings('security')}
          className="w-full flex items-center justify-between p-5 bg-[#151921] rounded-2xl border border-white/5"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-blue-500" />
            <span className="text-sm font-bold">Segurança da Conta</span>
          </div>
          <ChevronRight size={18} className="text-slate-700" />
        </button>

        <button 
          onClick={() => onOpenSettings('support')}
          className="w-full flex items-center justify-between p-5 bg-[#151921] rounded-2xl border border-white/5"
        >
          <div className="flex items-center gap-3">
            <MessageCircle size={18} className="text-orange-500" />
            <span className="text-sm font-bold">Ajuda & Suporte</span>
          </div>
          <ChevronRight size={18} className="text-slate-700" />
        </button>
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-4 space-x-3 text-red-500 font-bold text-xs uppercase tracking-[0.2em]"
      >
        Sair da conta
      </button>
    </div>
  );
}
