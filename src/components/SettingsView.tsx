import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Shield, Wallet, Bell, MapPin, 
  Settings, MessageSquare, Sparkles, HelpCircle, 
  FileText, LogOut, ChevronRight, Sun, Moon, 
  Monitor, CheckCircle2, Languages, CreditCard,
  Key, Smartphone, History, Fingerprint, Eye, EyeOff,
  AlertCircle, ShieldCheck, Smartphone as DeviceIcon,
  ChevronLeft, Check, Lock, RefreshCw, TrendingUp,
  Banknote, Building, Globe, Clock, ArrowUpRight,
  ArrowDownRight, Percent, ShieldAlert, Plus, Minus, Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

interface SettingsViewProps {
  user: any;
  onUpdate: (data: any) => void;
  onLogout: () => void;
  onClose: () => void;
  initialSubView?: SubView;
}

type SubView = 'main' | 'password' | 'pin' | '2fa' | 'sessions' | 'wallet' | 'withdraw' | 'currency' | 'autopay' | 'autobill' | 'terms' | 'privacy' | 'disputes' | 'kyc' | 'deposit' | 'help' | 'support' | 'licenses';

export default function SettingsView({ user, onUpdate, onLogout, onClose, initialSubView = 'main' }: SettingsViewProps) {
  const [loading, setLoading] = useState(false);
  const [activeSubView, setActiveSubView] = useState<SubView>(initialSubView);

  useEffect(() => {
    (window as any).setSettingsSubView = (sub: SubView) => setActiveSubView(sub);
    return () => { delete (window as any).setSettingsSubView; };
  }, []);

  const goToDeposit = () => setActiveSubView('deposit');
  const goToWithdraw = () => setActiveSubView('withdraw');

  const updateSetting = async (key: string, value: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <header className="px-6 py-4 flex items-center justify-between border-b border-white/[0.03] bg-[#0b0e14]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {activeSubView !== 'main' && (
          <button 
            onClick={() => setActiveSubView('main')}
            className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-xl font-bold text-white">
          {activeSubView === 'main' ? 'Configurações' : 
           activeSubView === 'password' ? 'Palavra-passe' :
           activeSubView === 'pin' ? 'PIN de Pagamento' :
           activeSubView === '2fa' ? 'Autenticação 2FA' :
           activeSubView === 'sessions' ? 'Sessões Ativas' :
           activeSubView === 'wallet' ? 'Wallet & Saldo' :
           activeSubView === 'withdraw' ? 'Saques & Contas' :
           activeSubView === 'deposit' ? 'Carregar Carteira' :
           activeSubView === 'currency' ? 'Moeda Automática' :
           activeSubView === 'autopay' ? 'Pagamento Automático' : 
           activeSubView === 'autobill' ? 'Cobrança Automática' :
           activeSubView === 'terms' ? 'Termos de Serviço' : 
           activeSubView === 'disputes' ? 'Centro de Disputas' : 
           activeSubView === 'help' ? 'Central de Ajuda' :
           activeSubView === 'support' ? 'Suporte Técnico' :
           activeSubView === 'licenses' ? 'Licenças Open Source' :
           activeSubView === 'kyc' ? 'Verificação de Identidade' : 'Privacidade & Segurança'}
        </h1>
      </div>
      <button onClick={onClose} className="p-2 text-slate-500">
        <X size={24} />
      </button>
    </header>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0e14] flex flex-col font-sans">
      {renderHeader()}

      <div className="flex-1 overflow-y-auto px-4 pb-20 custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {activeSubView === 'main' && (
            <motion.div 
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-4 space-y-4"
            >
              {/* User Card */}
              <div className="bg-[#151921] rounded-[24px] p-6 flex items-center gap-4 border border-white/[0.03]">
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg shadow-orange-500/10">
                  {user.name?.[0] || 'D'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <h2 className="font-bold text-lg text-white truncate">{user.name || 'Denzel Rafael'}</h2>
                      {user.verified && <ShieldCheck size={16} className="text-blue-500 shrink-0" />}
                    </div>
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-[10px] font-bold rounded-xl uppercase tracking-wider">
                      {user.role === 'client' ? 'Cliente' : 'Prestador'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-slate-500 text-xs truncate">{user.email || 'denzelmanacas@gmail.com'}</p>
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                      <Star size={10} className="text-orange-500 fill-orange-500" />
                      <span className="text-[10px] font-bold text-slate-400">{user.rating || '5.0'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Conta */}
              <div className="bg-[#151921] rounded-[24px] p-6 space-y-5 border border-white/[0.03]">
                <div className="flex items-center gap-3 text-orange-500 mb-2">
                  <User size={18} />
                  <h3 className="font-bold text-white">Conta</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium ml-1">Nome</label>
                    <input 
                      type="text" 
                      defaultValue={user.name || "Denzel Rafael"}
                      className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium ml-1">Telefone</label>
                    <input 
                      type="text" 
                      defaultValue={user.phone || "951634822"}
                      className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium ml-1">Bio</label>
                    <input 
                      type="text" 
                      defaultValue={user.bio || "Mecânica da treta"}
                      className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm font-bold text-white">Tipo de conta</p>
                      <p className="text-[10px] text-slate-500">Alterna entre Cliente e Prestador</p>
                    </div>
                    <select className="bg-[#0b0e14] border border-white/5 text-white text-sm rounded-xl p-2 focus:outline-none cursor-pointer">
                      <option value="client">Cliente</option>
                      <option value="provider">Prestador</option>
                    </select>
                  </div>

                  <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 active:scale-95 transition-all mt-2">
                    Guardar perfil
                  </button>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <MenuItem label="Verificação de Identidade (KYC)" onClick={() => setActiveSubView('kyc')} icon={<CheckCircle2 size={16} />} />
                </div>
              </div>

              {/* Section: Segurança */}
              <div className="bg-[#151921] rounded-[24px] p-6 space-y-2 border border-white/[0.03]">
                <div className="flex items-center gap-3 text-orange-500 mb-4">
                  <Shield size={18} />
                  <h3 className="font-bold text-white">Segurança</h3>
                </div>
                <MenuItem label="Mudar palavra-passe" onClick={() => setActiveSubView('password')} icon={<Key size={16} />} />
                <MenuItem label="PIN de pagamento" onClick={() => setActiveSubView('pin')} icon={<Lock size={16} />} />
                <MenuItem label="Autenticação 2FA" onClick={() => setActiveSubView('2fa')} icon={<ShieldCheck size={16} />} />
                <MenuItem label="Sessões ativas" onClick={() => setActiveSubView('sessions')} icon={<Smartphone size={16} />} />
              </div>

              {/* Section: Pagamentos */}
              <div className="bg-[#151921] rounded-[24px] p-6 space-y-2 border border-white/[0.03]">
                <div className="flex items-center gap-3 text-orange-500 mb-4">
                  <CreditCard size={18} />
                  <h3 className="font-bold text-white">Pagamentos</h3>
                </div>
                <MenuItem label="Wallet & saldo" onClick={() => setActiveSubView('wallet')} icon={<Wallet size={16} />} />
                <MenuItem label="Carregar carteira" onClick={() => setActiveSubView('deposit')} icon={<Plus size={16} />} />
                <MenuItem label="Saques e contas bancárias" onClick={() => setActiveSubView('withdraw')} icon={<Building size={16} />} />
                <div className="pt-2 flex flex-col gap-1">
                   <button 
                    onClick={() => setActiveSubView('currency')}
                    className="w-full flex items-center justify-between py-4 group transition-colors px-1 hover:bg-white/[0.02] rounded-xl"
                   >
                     <div className="text-left">
                        <p className="text-sm font-bold text-white">Moeda automática</p>
                        <p className="text-[10px] text-slate-500">Detetar pelo idioma/região</p>
                     </div>
                     <ChevronRight size={16} className="text-slate-700" />
                   </button>
                   <button 
                    onClick={() => setActiveSubView('autopay')}
                    className="w-full flex items-center justify-between py-4 group transition-colors px-1 hover:bg-white/[0.02] rounded-xl"
                   >
                     <div className="text-left">
                        <p className="text-sm font-bold text-white">Pagamento automático</p>
                        <p className="text-[10px] text-slate-500">Configurar regras de auto-pagamento</p>
                     </div>
                     <ChevronRight size={16} className="text-slate-700" />
                   </button>
                   <button 
                    onClick={() => setActiveSubView('autobill')}
                    className="w-full flex items-center justify-between py-4 group transition-colors px-1 hover:bg-white/[0.02] rounded-xl"
                   >
                     <div className="text-left">
                        <p className="text-sm font-bold text-white">Cobrança Automática</p>
                        <p className="text-[10px] text-slate-500">Sistema de débito direto inteligente</p>
                     </div>
                     <ChevronRight size={16} className="text-slate-700" />
                   </button>
                </div>
              </div>

              {/* Section: Suporte */}
              <div className="bg-[#151921] rounded-[24px] p-6 space-y-2 border border-white/[0.03]">
                <div className="flex items-center gap-3 text-orange-500 mb-4">
                  <HelpCircle size={18} />
                  <h3 className="font-bold text-white">Suporte & Ajuda</h3>
                </div>
                <MenuItem label="Centro de disputas" onClick={() => setActiveSubView('disputes')} icon={<ShieldAlert size={16} />} />
                <MenuItem label="Central de ajuda" onClick={() => setActiveSubView('help')} icon={<HelpCircle size={16} />} />
                <MenuItem label="Contactar suporte" onClick={() => setActiveSubView('support')} icon={<MessageSquare size={16} />} />
              </div>

              {/* Section: Legal */}
              <div className="bg-[#151921] rounded-[24px] p-6 space-y-2 border border-white/[0.03]">
                <div className="flex items-center gap-3 text-orange-500 mb-4">
                  <FileText size={18} />
                  <h3 className="font-bold text-white">Legal</h3>
                </div>
                <MenuItem label="Termos de serviço" onClick={() => setActiveSubView('terms')} icon={<FileText size={16} />} />
                <MenuItem label="Política de privacidade e segurança" onClick={() => setActiveSubView('privacy')} icon={<ShieldCheck size={16} />} />
                <MenuItem label="Licenças open source" onClick={() => setActiveSubView('licenses')} icon={<Globe size={16} />} />
              </div>

              {/* Logout */}
              <button 
                onClick={onLogout}
                className="w-full py-4 border border-red-500/20 text-red-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 active:scale-95 transition-all mt-4"
              >
                <LogOut size={18} />
                Sair
              </button>
            </motion.div>
          )}

          {activeSubView === 'password' && <PasswordSubView key="password" />}
          {activeSubView === 'pin' && <PinSubView key="pin" />}
          {activeSubView === '2fa' && <TwoFactorSubView key="2fa" />}
          {activeSubView === 'sessions' && <SessionsSubView key="sessions" />}
          {activeSubView === 'wallet' && <WalletSubView onDeposit={() => setActiveSubView('deposit')} onWithdraw={() => setActiveSubView('withdraw')} />}
          {activeSubView === 'withdraw' && <WithdrawSubView key="withdraw" />}
          {activeSubView === 'deposit' && <DepositSubView key="deposit" />}
          {activeSubView === 'currency' && <CurrencySubView key="currency" />}
          {activeSubView === 'autopay' && <AutoPaySubView key="autopay" />}
          {activeSubView === 'autobill' && <AutoBillSubView key="autobill" />}
          {activeSubView === 'terms' && <TermsSubView key="terms" />}
          {activeSubView === 'privacy' && <PrivacySubView key="privacy" />}
          {activeSubView === 'disputes' && <DisputesSubView key="disputes" />}
          {activeSubView === 'kyc' && <KYCSubView key="kyc" />}
          {activeSubView === 'help' && <HelpCenterSubView key="help" />}
          {activeSubView === 'support' && <SupportSubView key="support" />}
          {activeSubView === 'licenses' && <LicensesSubView key="licenses" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- SUB-VIEWS COMPONENTS ---

function PasswordSubView() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  const getStrength = (pass: string) => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };

  const strength = getStrength(newPassword);
  const strengthText = strength === 0 ? '' : strength < 2 ? 'Fraca' : strength < 4 ? 'Média' : 'Forte';
  const strengthColor = strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-orange-500' : 'bg-emerald-500';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 space-y-5 border border-white/[0.03]">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium ml-1">Palavra-passe atual</label>
            <div className="relative">
              <input 
                type={showCurrent ? "text" : "password"}
                className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-4 text-white text-sm pr-12 focus:outline-none"
                placeholder="••••••••"
              />
              <button 
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium ml-1">Nova palavra-passe</label>
            <div className="relative">
              <input 
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-4 text-white text-sm pr-12 focus:outline-none"
                placeholder="••••••••"
              />
              <button 
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {newPassword && (
              <div className="px-1 pt-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Força: {strengthText}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(strength / 4) * 100}%` }}
                    className={cn("h-full transition-all", strengthColor)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium ml-1">Confirmar nova palavra-passe</label>
            <input 
              type="password"
              className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Regras de Segurança</p>
          <ul className="space-y-1.5">
            <SecurityRule met={newPassword.length >= 8} text="Mínimo de 8 caracteres" />
            <SecurityRule met={/[0-9]/.test(newPassword)} text="Pelo menos um número" />
            <SecurityRule met={/[^A-Za-z0-9]/.test(newPassword)} text="Pelo menos um símbolo" />
          </ul>
        </div>

        <div className="space-y-4 pt-2">
          <ToggleItem label="Terminar outras sessões" desc="Desconectar após a mudança" active={false} />
          <ToggleItem label="Notificar por E-mail" desc="Confirmação de segurança" active={true} />
        </div>

        <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
          Atualizar palavra-passe
        </button>

        <button className="w-full py-3 text-blue-400 text-xs font-bold hover:underline">
          Esqueceu a palavra-passe? Recuperar via SMS
        </button>
      </div>

      <div className="bg-[#151921] rounded-[24px] p-6 border border-white/[0.03]">
        <div className="flex items-center gap-3 text-slate-400 mb-4">
          <History size={18} />
          <h3 className="font-bold text-white text-sm">Histórico de Alterações</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Última mudança</span>
            <span className="text-white font-medium">Hoje, 17:15</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Localização</span>
            <span className="text-white font-medium">Luanda, AO</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PinSubView() {
  const [pinType, setPinType] = useState<4 | 6>(4);
  const [limit, setLimit] = useState(10000);
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 space-y-6 border border-white/[0.03]">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto text-blue-400">
            <Lock size={32} />
          </div>
          <h3 className="font-bold text-lg">Definir PIN de Pagamento</h3>
          <p className="text-xs text-slate-500 px-4">Proteja suas transações financeiras com um PIN numérico.</p>
        </div>

        <div className="flex justify-center gap-4">
          <button 
            onClick={() => setPinType(4)}
            className={cn("px-6 py-2 rounded-xl text-xs font-bold border transition-all", pinType === 4 ? "bg-orange-500 border-orange-500 text-white" : "border-white/10 text-slate-500")}
          >
            4 Dígitos
          </button>
          <button 
            onClick={() => setPinType(6)}
            className={cn("px-6 py-2 rounded-xl text-xs font-bold border transition-all", pinType === 6 ? "bg-orange-500 border-orange-500 text-white" : "border-white/10 text-slate-500")}
          >
            6 Dígitos
          </button>
        </div>

        <div className="flex justify-center gap-3 py-4">
          {Array.from({ length: pinType }).map((_, i) => (
            <div key={i} className="w-12 h-14 bg-[#0b0e14] border border-white/5 rounded-2xl flex items-center justify-center focus-within:ring-1 focus-within:ring-orange-500/50">
               <input 
                 type="password" 
                 maxLength={1}
                 className="w-full h-full bg-transparent text-center text-white font-bold text-lg focus:outline-none"
               />
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <ToggleItem label="Ativar Biometria" desc="Usar FaceID ou Impressão Digital" active={true} icon={<Fingerprint size={16} />} />
          <ToggleItem label="Bloqueio de Tentativas" desc="Bloquear após 5 erros" active={true} />
        </div>

        <div className="space-y-4">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-center">Exigir PIN quando:</p>
          <div className="grid grid-cols-2 gap-3">
             <button className={cn("p-4 rounded-2xl border text-center transition-all", limit === 0 ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5 border-white/5")} onClick={() => setLimit(0)}>
                <p className="text-xs font-bold">Sempre</p>
                <p className="text-[9px] text-slate-500">Cada movimento</p>
             </button>
             <button className={cn("p-4 rounded-2xl border text-center transition-all", limit > 0 ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5 border-white/5")} onClick={() => setLimit(10000)}>
                <p className="text-xs font-bold text-orange-400">+ 10.000 Kz</p>
                <p className="text-[9px] text-orange-500/70">Apenas valores altos</p>
             </button>
          </div>
        </div>

        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
          Guardar PIN
        </button>
      </div>
    </motion.div>
  );
}

function TwoFactorSubView() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 space-y-6 border border-white/[0.03]">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                 <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold">2FA Ativado</h3>
           </div>
           <button className="text-[10px] font-black text-red-400 uppercase tracking-widest transition-colors hover:text-red-500">Desativar</button>
        </div>

        <div className="space-y-4">
           <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Métodos Ativos</p>
           <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#0b0e14] border border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="text-blue-400"><Smartphone size={18} /></div>
                    <div>
                       <p className="text-sm font-bold">SMS (Principal)</p>
                       <p className="text-[10px] text-slate-500">+244 951 ••• •22</p>
                    </div>
                 </div>
                 <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                 </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#0b0e14] border border-white/5 flex items-center justify-between opacity-60">
                 <div className="flex items-center gap-3">
                    <div className="text-slate-400"><FileText size={18} /></div>
                    <p className="text-sm font-bold">E-mail</p>
                 </div>
                 <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300">Ativar</button>
              </div>
           </div>
        </div>

        <div className="p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl text-center space-y-4">
           <p className="text-xs text-slate-400">Gere códigos de backup para acessar sua conta caso perca seu telefone.</p>
           <button className="w-full py-3 bg-white/5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-white/10">
              <RefreshCw size={14} /> Gerar Códigos
           </button>
        </div>
      </div>

      <div className="bg-[#151921] rounded-[24px] p-6 border border-white/[0.03] space-y-4">
         <h3 className="font-bold text-white text-sm">Regras de Pedido</h3>
         <ToggleItem label="Sempre pedir 2FA" active={false} />
         <ToggleItem label="Apenas novos dispositivos" active={true} />
         <ToggleItem label="Apenas login suspeito" active={true} />
      </div>
    </motion.div>
  );
}

function SessionsSubView() {
  const sessions = [
    { name: 'iPhone 15 Pro', loc: 'Luanda, AO', os: 'iOS 17.4', time: 'Atual', current: true },
    { name: 'MacBook Pro M3', loc: 'Talatona, AO', os: 'macOS Sonoma', time: 'Há 2 horas', current: false },
    { name: 'Windows 11 PC', loc: 'Benguela, AO', os: 'Chrome v122', time: 'Ontem às 22:15', current: false },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 border border-white/[0.03] space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="font-bold text-white text-sm">Sessões Ativas</h3>
           <button className="text-[10px] font-black text-red-500 uppercase tracking-widest active:scale-95 transition-colors hover:text-red-400">Sair de tudo</button>
        </div>

        <div className="space-y-6">
           {sessions.map((s, i) => (
             <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", s.current ? "bg-orange-500/10 text-orange-500" : "bg-white/5 text-slate-500")}>
                      <DeviceIcon size={24} />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        {s.name}
                        {s.current && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      </h4>
                      <p className="text-[10px] text-slate-500">{s.os} • {s.loc}</p>
                      <p className={cn("text-[9px] mt-0.5", s.current ? "text-emerald-400 font-bold" : "text-slate-600")}>{s.time}</p>
                   </div>
                </div>
                {!s.current && (
                  <button className="p-2 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <X size={18} />
                  </button>
                )}
             </div>
           ))}
        </div>
      </div>

      <div className="p-6 bg-orange-500/5 rounded-[24px] border border-orange-500/20 flex gap-4">
         <AlertCircle className="text-orange-500 shrink-0" size={24} />
         <div>
            <p className="text-sm font-bold text-orange-400">Segurança de Login</p>
            <p className="text-xs text-orange-500/70 mt-1 leading-relaxed">Alertas para novos dispositivos e bloqueio automático de IPs suspeitos estão ativos.</p>
         </div>
      </div>
    </motion.div>
  );
}

function WalletSubView({ onDeposit, onWithdraw }: { onDeposit: () => void, onWithdraw: () => void }) {
  const [activeTab, setActiveTab] = useState<'balance' | 'stats'>('balance');
  
  const historyData = [
    { name: 'Seg', income: 45000, expense: 12000 },
    { name: 'Ter', income: 32000, expense: 8000 },
    { name: 'Qua', income: 58000, expense: 15000 },
    { name: 'Qui', income: 21000, expense: 5000 },
    { name: 'Sex', income: 64000, expense: 22000 },
    { name: 'Sáb', income: 89000, expense: 30000 },
    { name: 'Dom', income: 52000, expense: 12000 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="flex gap-2 p-1 bg-[#151921] rounded-2xl border border-white/5">
        <button 
          onClick={() => setActiveTab('balance')}
          className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all", activeTab === 'balance' ? "bg-white/5 text-orange-500 shadow-sm" : "text-slate-500")}
        >
          Carteira
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all", activeTab === 'stats' ? "bg-white/5 text-orange-500 shadow-sm" : "text-slate-500")}
        >
          Estatísticas
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'balance' ? (
          <motion.div 
            key="balance"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-[32px] p-8 shadow-xl shadow-blue-500/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
               <div className="relative z-10 space-y-1">
                  <p className="text-[10px] text-white/70 uppercase font-black tracking-widest">Saldo Disponível</p>
                  <h3 className="text-4xl font-bold text-white tracking-tighter">125.450 <span className="text-lg">Kz</span></h3>
               </div>
               <div className="mt-8 flex justify-between items-center relative z-10">
                  <div className="flex gap-4">
                    <button 
                      onClick={onDeposit}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all"
                    >
                      <Plus size={14} /> Carregar
                    </button>
                    <button 
                      onClick={onWithdraw}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl font-bold text-xs backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all"
                    >
                      Levantar
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/50 uppercase font-bold">Em Espera</p>
                    <p className="text-sm font-bold text-white/80">14.200 Kz</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Movimentações</h4>
                  <div className="flex gap-2">
                     <button className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white transition-colors">Tudo</button>
                     <button className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors">Entradas</button>
                  </div>
               </div>
               
               <div className="space-y-3">
                  <TransactionItem label="Limpeza Pós-Obra" date="Hoje, 14:20" value="15.000" type="in" />
                  <TransactionItem label="Levantamento Bancário" date="Hoje, 09:10" value="50.000" type="out" />
                  <TransactionItem label="Reparação AC" date="Ontem, 18:45" value="32.000" type="in" />
                  <TransactionItem label="Taxa de Serviço" date="Ontem, 10:30" value="1.200" type="out" />
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="stats"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="bg-[#151921] rounded-[24px] p-6 border border-white/[0.03]">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Desempenho Semanal</h4>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0b0e14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '10px' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <StatCard label="Mais Ganhos" value="Limpeza" icon={<TrendingUp size={16} className="text-emerald-500" />} />
               <StatCard label="Mês Atual" value="+ 450k" icon={<Banknote size={16} className="text-blue-400" />} />
            </div>
            
            <div className="bg-[#151921] rounded-[24px] p-6 border border-white/[0.03]">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Top Categorias Pagas</h4>
               <div className="space-y-4">
                  <CategoryProgress label="Mecânica" percent={75} value="92k" color="bg-orange-500" />
                  <CategoryProgress label="Pintura" percent={45} value="54k" color="bg-blue-500" />
                  <CategoryProgress label="Limpeza" percent={30} value="36k" color="bg-emerald-500" />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WithdrawSubView() {
  const [step, setStep] = useState<'methods' | 'details' | 'pin' | 'status'>('methods');
  const [method, setMethod] = useState<'unitel' | 'bank' | 'express' | 'paypay'>('bank');
  const [amount, setAmount] = useState('2000');
  const [details, setDetails] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  const handleNext = () => {
    if (step === 'methods') setStep('details');
    else if (step === 'details') {
      if (Number(amount) < 2000) return;
      setStep('pin');
    }
    else if (step === 'pin') {
      setStep('status');
      // Simulate processing
      setTimeout(() => {
        setStatus('success');
      }, 2000);
    }
  };

  const getMethodIcon = (m: string) => {
    switch (m) {
      case 'unitel': return <Smartphone size={20} />;
      case 'bank': return <Building size={20} />;
      case 'express': return <Smartphone size={20} />;
      case 'paypay': return <Globe size={20} />;
      default: return <CreditCard size={20} />;
    }
  };

  const getMethodLabel = (m: string) => {
    switch (m) {
      case 'unitel': return 'Unitel Money';
      case 'bank': return 'Transferência Bancária';
      case 'express': return 'MCX Express';
      case 'paypay': return 'PayPay';
      default: return m;
    }
  };

  const fee = Number(amount) * 0.05;
  const total = Number(amount) - fee;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[32px] p-8 space-y-6 border border-white/[0.03]">
        {step === 'methods' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Escolher Método</p>
              <h3 className="text-xl font-bold text-white">Como deseja receber?</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {(['unitel', 'bank', 'express', 'paypay'] as const).map((m) => (
                <button 
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    "p-5 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98]",
                    method === m ? "bg-orange-500/10 border-orange-500/30 ring-1 ring-orange-500/20" : "bg-[#0b0e14] border-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      method === m ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white/5 text-slate-500"
                    )}>
                      {getMethodIcon(m)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">{getMethodLabel(m)}</p>
                      <p className="text-[10px] text-slate-500">
                        {m === 'unitel' ? 'Instantâneo' : m === 'bank' ? 'Até 24h' : 'Instantâneo'}
                      </p>
                    </div>
                  </div>
                  {method === m && <CheckCircle2 size={20} className="text-orange-500" />}
                </button>
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              Próximo Passo
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-6">
            <button 
              onClick={() => setStep('methods')}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold"
            >
              <ChevronLeft size={16} /> Alterar método
            </button>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-medium ml-1">Valor do Saque</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-6 text-3xl font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Kz</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] text-slate-600 font-medium">Mínimo: 2.000 Kz</p>
                  <p className="text-[10px] text-blue-400 font-bold">Disponível: 125.450 Kz</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-medium ml-1">
                  {method === 'bank' ? 'IBAN Beneficiário' : 'Número de Telefone'}
                </label>
                <input 
                  type="text" 
                  placeholder={method === 'bank' ? "AO06 0000 ..." : "9XXXXXXXX"}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/[0.03]">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Taxa de saque (5%)</span>
                <span className="text-red-400 font-bold">-{fee.toLocaleString()} Kz</span>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between items-center text-sm">
                <span className="text-slate-300 font-medium">Você recebe</span>
                <span className="text-emerald-400 font-bold text-lg">{total.toLocaleString()} Kz</span>
              </div>
            </div>

            <button 
              disabled={Number(amount) < 2000 || !details}
              onClick={handleNext}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95",
                Number(amount) >= 2000 && details 
                  ? "bg-orange-500 text-white shadow-orange-500/20" 
                  : "bg-white/5 text-slate-500 cursor-not-allowed"
              )}
            >
              Continuar para PIN
            </button>
          </div>
        )}

        {step === 'pin' && (
          <div className="space-y-8 text-center py-4">
            <div className="space-y-2">
              <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto text-blue-400">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-bold text-lg">Segurança</h3>
              <p className="text-xs text-slate-500">Insira seu PIN de pagamento para confirmar.</p>
            </div>

            <div className="flex justify-center gap-4">
              {pin.map((digit, i) => (
                <div key={i} className="w-12 h-14 bg-[#0b0e14] border border-white/5 rounded-2xl flex items-center justify-center">
                  <input 
                    type="password"
                    maxLength={1}
                    className="w-full h-full bg-transparent text-center text-white font-bold text-xl focus:outline-none"
                    autoFocus={i === 0}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <button 
                onClick={handleNext}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
              >
                CONFIRMAR SAQUE
              </button>
              <button 
                onClick={() => setStep('details')}
                className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
              >
                Cancelar e voltar
              </button>
            </div>
          </div>
        )}

        {step === 'status' && (
          <div className="text-center py-10 space-y-6">
            {status === 'processing' ? (
              <>
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                    <Clock size={32} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">Processando</h3>
                  <p className="text-slate-500 text-sm">Verificando transação e fundos...</p>
                </div>
              </>
            ) : status === 'success' ? (
              <>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">Saque Concluído!</h3>
                  <p className="text-slate-500 text-sm">O valor estará disponível em breve no seu {getMethodLabel(method)}.</p>
                </div>
                <button 
                   onClick={() => setStep('methods')}
                   className="mt-6 px-8 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-white hover:bg-white/10 transition-all"
                >
                  Novo Saque
                </button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <X size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">Erro no Saque</h3>
                  <p className="text-slate-500 text-sm">Não foi possível completar a operação. Tente novamente.</p>
                </div>
                <button 
                   onClick={() => setStep('details')}
                   className="mt-6 px-8 py-3 bg-red-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  Tentar Novamente
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-6 bg-orange-500/5 rounded-[24px] border border-orange-500/20 flex gap-4">
         <ShieldCheck className="text-orange-500 shrink-0" size={24} />
         <p className="text-[10px] text-slate-400 leading-relaxed uppercase font-black tracking-widest bg-orange-500/10 px-3 py-1 rounded-full">
           Proteção de Saldo Activa
         </p>
      </div>
    </motion.div>
  );
}

function CurrencySubView() {
  const [selectedCurrency, setSelectedCurrency] = useState('AOA');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 space-y-6 border border-white/[0.03]">
        <div className="space-y-4">
           <ToggleItem label="Deteção Automática" desc="Baseado na localização e região" active={true} icon={<Globe size={18} />} />
           <ToggleItem label="Conversão em Tempo Real" desc="Taxas atualizadas diariamente" active={true} icon={<RefreshCw size={18} />} />
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
           <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Moeda Principal</p>
           <div className="space-y-2">
              <CurrencyOption code="AOA" name="Kwanza Angolano" symbol="Kz" selected={selectedCurrency === 'AOA'} onClick={() => setSelectedCurrency('AOA')} />
              <CurrencyOption code="USD" name="Dólar Americano" symbol="$" selected={selectedCurrency === 'USD'} onClick={() => setSelectedCurrency('USD')} />
              <CurrencyOption code="EUR" name="Euro" symbol="€" selected={selectedCurrency === 'EUR'} onClick={() => setSelectedCurrency('EUR')} />
           </div>
        </div>

        <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex gap-3 items-center">
           <ShieldAlert className="text-orange-500 shrink-0" size={18} />
           <p className="text-[10px] text-orange-200">Travar uma moeda fixa pode impedir a atualização automática de taxas de conversão no checkout.</p>
        </div>
      </div>
    </motion.div>
  );
}

function AutoPaySubView() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 space-y-6 border border-white/[0.03]">
        <div className="space-y-4">
           <ToggleItem label="Auto-Pay Geral" desc="Ativar para serviços e assinaturas" active={true} />
           <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-1">
              <p className="text-xs font-bold text-blue-400">Pagamento em 24h</p>
              <p className="text-[10px] text-slate-400 leading-tight">Pagar automaticamente 24h após a conclusão se não houver reclamação.</p>
           </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
           <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Regras de Segurança</p>
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-xs text-slate-400 font-medium ml-1">Limite por Transação</label>
                 <div className="relative">
                    <input type="text" defaultValue="15.000" className="w-full bg-[#0b0e14] border border-white/5 rounded-xl p-4 text-sm font-bold text-white pr-12 focus:outline-none" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">Kz</span>
                 </div>
              </div>
              <ToggleItem label="Confirmar no App" desc="Pedir ok antes de debitar" active={true} icon={<Smartphone size={16} />} />
              <ToggleItem label="Bloqueio de Risco" desc="Suspender se detectar fraude" active={true} icon={<ShieldAlert size={16} />} />
           </div>
        </div>
      </div>

      <div className="bg-[#151921] rounded-[24px] p-6 border border-white/[0.03] space-y-4">
         <h3 className="font-bold text-white text-sm">Próximos Pagamentos</h3>
         <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 opacity-60">
            <div>
               <p className="text-xs font-bold">Assinatura Premium</p>
               <p className="text-[10px] text-slate-500">12 Mai • Mensal</p>
            </div>
            <p className="text-sm font-bold text-white">4.500 Kz</p>
         </div>
      </div>
    </motion.div>
  );
}

function AutoBillSubView() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 space-y-6 border border-white/[0.03]">
        <div className="text-center space-y-2 mb-4">
           <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-500">
              <Clock size={32} />
           </div>
           <h3 className="font-bold text-lg">Cobrança Inteligente</h3>
           <p className="text-xs text-slate-500 px-4">O sistema debita automaticamente ao finalizar entregas validadas.</p>
        </div>

        <div className="space-y-4">
           <ToggleItem label="Débito no Fim" desc="Ao concluir trabalho validado" active={true} />
           <ToggleItem label="Prazo Expirado" desc="Cobrar se o prazo de feedback acabar" active={true} />
        </div>

        <div className="p-4 bg-[#0b0e14] rounded-2xl border border-white/5 space-y-4 mt-6">
           <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Proteção do Utilizador</p>
           <div className="space-y-3">
              <div className="flex gap-3">
                 <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
                 <p className="text-[10px] text-slate-400">Reembolso automático em caso de disputa aberta no prazo legal.</p>
              </div>
              <div className="flex gap-3">
                 <ShieldAlert className="text-blue-400 shrink-0" size={18} />
                 <p className="text-[10px] text-slate-400">Verificação de identidade dupla para cobranças acima de 25.000 Kz.</p>
              </div>
           </div>
        </div>

        <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
          Guardar Configurações
        </button>
      </div>
    </motion.div>
  );
}

function TermsSubView() {
  const sections = [
    { title: '1.1 ACEITAÇÃO', content: ['O uso do app significa aceitação total dos termos', 'Utilizador deve concordar antes de usar qualquer funcionalidade'] },
    { title: '1.2 USO DA PLATAFORMA', content: ['Apenas uso legal e responsável', 'Proibido fraude, spam, engenharia reversa ouabuse do sistema', 'Proibido criar múltiplas contas falsas'] },
    { title: '1.3 CONTAS', content: ['Conta individual e intransferível', 'Utilizador responsável por todas as ações na conta', 'Suspensão automática em atividade suspeita'] },
    { title: '1.4 TRABALHOS', content: ['Plataforma conecta utilizadores (não é empregador direto)', 'Não garante resultado final dos serviços', 'Cada utilizador assume responsabilidade pelo trabalho que oferece ou contrata'] },
    { title: '1.5 PAGAMENTOS E WALLET', content: ['Carteira digital integrada', 'Pagamentos podem ser automáticos com autorização', 'Saldo pode ser retido em disputa', 'Saques podem exigir verificação de identidade (KYC)', 'Histórico completo obrigatório e transparente'] },
    { title: '1.6 SISTEMA DE AVALIAÇÃO E REPUTAÇÃO', content: ['Cada utilizador tem uma pontuação de confiança (Trust Score)', 'Avaliações falsas são removidas automaticamente', 'Reputação afeta visibilidade e acesso a jobs'] },
    { title: '1.7 DISPUTAS', content: ['Qualquer conflito pode abrir “caso de disputa”', 'Sistema analisa evidências de ambas as partes', 'Pode haver reembolso parcial ou total', 'Decisão pode ser automática ou manual'] },
    { title: '1.8 ALTERAÇÕES', content: ['Plataforma pode atualizar regras e funcionalidades a qualquer momento', 'Uso contínuo significa aceitação automática'] },
    { title: '1.9 SUSPENSÃO E BANIMENTO', content: ['Fraude, abuso ou comportamento suspeito leva a bloqueio', 'Contas podem ser permanentemente removidas'] },
    { title: '1.10 RESPONSABILIDADE', content: ['Plataforma não é responsável por danos entre utilizadores', 'Atua apenas como intermediária de conexão e pagamento'] },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 lg:p-10 space-y-8 border border-white/[0.03]">
        <div className="space-y-2">
           <h2 className="text-2xl font-bold text-white tracking-tight">Termos de Serviço</h2>
           <p className="text-slate-500 text-sm">Última atualização: 6 de Maio de 2026</p>
        </div>

        <div className="space-y-10">
           {sections.map((s) => (
             <div key={s.title} className="space-y-4">
                <h3 className="text-orange-500 font-black text-[11px] uppercase tracking-[0.2em]">{s.title}</h3>
                <div className="space-y-3">
                   {s.content.map((item, i) => (
                     <div key={i} className="flex gap-4 items-start group">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500/40 mt-1.5 shrink-0 group-hover:bg-orange-500 transition-colors" />
                        <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>

        <div className="pt-10 border-t border-white/5 text-center space-y-6">
           <p className="text-slate-500 text-[10px] leading-relaxed italic">
             Ao utilizar a plataforma, você concorda em cumprir estes termos e todas as leis e regulamentos aplicáveis.
           </p>
           <button 
             onClick={() => (window as any).setSettingsSubView?.('privacy')}
             className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-slate-300 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
           >
             <ShieldCheck size={16} className="text-emerald-500" />
             Ver Política de Privacidade e Segurança
           </button>
        </div>
      </div>
    </motion.div>
  );
}

function PrivacySubView() {
  const sections = [
    { title: '2.1 PROTEÇÃO DE CONTAS', content: ['Palavra-passe encriptada obrigatória', 'PIN de pagamento', 'Autenticação 2FA obrigatória para ações sensíveis', 'Verificação de dispositivo novo', 'Bloqueio automático após comportamento suspeito'] },
    { title: '2.2 SESSÕES E DISPOSITIVOS', content: ['Lista de sessões ativas visível', 'Encerrar sessões remotamente', 'Alertas de login em novos dispositivos', 'Monitorização de localização e IP suspeito'] },
    { title: '2.3 SEGURANÇA DE PAGAMENTOS (WALLET)', content: ['Carteira digital segura e encriptada', 'Pagamentos protegidos por PIN', 'Sistema de escrow (dinheiro fica retido até conclusão do trabalho)', 'Saques com verificação adicional', 'Congelamento automático em caso de fraude ou disputa'] },
    { title: '2.4 SISTEMA ANTI-FRAUDE', content: ['IA deteta padrões suspeitos', 'Bloqueio automático de contas falsas', 'Análise de comportamento em tempo real', 'Deteção de spam, bots e abuso de sistema'] },
    { title: '2.5 KYC (VERIFICAÇÃO DE IDENTIDADE)', content: ['Pode ser exigido documento de identidade', 'Necessário para saques grandes ou contas suspeitas', 'Protege contra fraudes financeiras'] },
    { title: '2.6 TRUST SCORE (PONTUAÇÃO DE CONFIANÇA)', content: ['Cada utilizador tem score dinâmico baseado em avaliações, histórico de trabalho, pagamentos e comportamento', 'Score baixo limita acesso a jobs e pagamentos'] },
    { title: '2.7 PROTEÇÃO DE DADOS', content: ['Dados encriptados ponta a ponta', 'Sem venda de dados pessoais', 'Acesso interno restrito e auditado', 'Logs de segurança armazenados com proteção'] },
    { title: '2.8 PRIVACIDADE DE LOCALIZAÇÃO', content: ['Usada apenas para matching de trabalhos próximos', 'Pode ser desligada pelo utilizador', 'Nunca partilhada publicamente sem consentimento'] },
    { title: '2.9 RECUPERAÇÃO DE CONTA', content: ['Via email ou telefone', 'Pode exigir verificação KYC', 'Proteção reforçada para contas comprometidas'] },
    { title: '2.10 ALERTAS DE SEGURANÇA', content: ['Notificações de login suspeito', 'Alertas de transações fora do padrão', 'Avisos de comportamento de risco', 'Sistema de resposta automática'] },
    { title: '2.11 AUDITORIA E LOGS', content: ['Todas ações importantes são registadas', 'Logs protegidos e inacessíveis ao público', 'Usados para investigação de fraude e disputas'] },
    { title: '2.12 ATUALIZAÇÕES DE SEGURANÇA', content: ['Sistema evolui automaticamente', 'Pode exigir reautenticação em atualizações críticas', 'Melhorias contínuas de proteção'] },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 lg:p-10 space-y-8 border border-white/[0.03]">
        <div className="flex items-center gap-4 mb-2">
           <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
              <ShieldCheck size={24} />
           </div>
           <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">Política de Segurança</h2>
              <p className="text-slate-500 text-sm">Privacidade & Proteção de Dados</p>
           </div>
        </div>

        <div className="bg-blue-600/5 border border-blue-600/10 p-6 rounded-2xl space-y-2">
           <p className="text-blue-400 font-bold text-sm">Nosso compromisso</p>
           <p className="text-slate-400 text-xs leading-relaxed">
             Criar uma plataforma segura nível banco digital (fintech), justa, transparente e simples de usar, mas altamente protegida.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
           {sections.map((s) => (
             <div key={s.title} className="space-y-4">
                <h3 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                   {s.title}
                </h3>
                <ul className="space-y-3">
                   {s.content.map((item, i) => (
                     <li key={i} className="text-slate-300 text-sm leading-relaxed flex gap-3">
                        <Check size={14} className="text-emerald-500/50 mt-1 shrink-0" />
                        {item}
                     </li>
                   ))}
                </ul>
             </div>
           ))}
        </div>

        <div className="pt-10 border-t border-white/5 space-y-4">
           <div className="bg-[#0b0e14] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
              <Sparkles size={20} className="text-orange-500 shrink-0" />
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">IA Anti-Fraude Ativa 24/7</p>
           </div>
           <button 
             onClick={() => (window as any).setSettingsSubView?.('terms')}
             className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-slate-300 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
           >
             <FileText size={16} className="text-orange-500" />
             Ver Termos de Serviço
           </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- SHARED COMPONENTS ---

function HelpCenterSubView() {
  const faqs = [
    { q: 'Como sou pago?', a: 'Os pagamentos são processados via Unitel Money, MCX Express ou Transferência Bancária em até 24h após a conclusão do serviço.' },
    { q: 'O que é o Saldo Seguro?', a: 'É o nosso sistema de Escrow que retém o valor do serviço até que o cliente confirme a conclusão, garantindo segurança para ambos.' },
    { q: 'Como cancelar um job?', a: 'Você pode cancelar um job antes de ser aceite sem custos. Se já estiver em andamento, pode haver uma taxa de cancelamento.' },
    { q: 'Como ser um prestador verificado?', a: 'Envie seus documentos na seção "Verificação de Identidade" para receber o selo de confiança e prioridade em jobs.' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 space-y-6 border border-white/[0.03]">
        <div className="space-y-4">
           {faqs.map((faq, i) => (
             <div key={i} className="p-4 rounded-2xl bg-[#0b0e14] border border-white/5 space-y-2">
                <p className="text-sm font-bold text-white">{faq.q}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
             </div>
           ))}
        </div>
        
        <button 
          onClick={() => (window as any).setSettingsSubView?.('support')}
          className="w-full py-4 bg-blue-600/10 text-blue-400 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"
        >
          Ainda com dúvidas? Fale conosco
        </button>
      </div>
    </motion.div>
  );
}

function SupportSubView() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-8 text-center space-y-6 border border-white/[0.03]">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-500">
          <MessageSquare size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">Suporte ao Cliente</h3>
          <p className="text-slate-500 text-sm">Estamos aqui para ajudar você 24/7.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3 pt-4">
           <button className="flex items-center justify-between p-5 rounded-2xl bg-[#0b0e14] border border-white/5 hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                    <MessageSquare size={20} />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-bold">Chat ao Vivo</p>
                    <p className="text-[10px] text-slate-500">Tempo médio: 2 min</p>
                 </div>
              </div>
              <ChevronRight size={18} className="text-slate-700" />
           </button>
           
           <button className="flex items-center justify-between p-5 rounded-2xl bg-[#0b0e14] border border-white/5 hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                    <Globe size={20} />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-bold">E-mail</p>
                    <p className="text-[10px] text-slate-500">suporte@tramporapido.ao</p>
                 </div>
              </div>
              <ChevronRight size={18} className="text-slate-700" />
           </button>
        </div>
      </div>
    </motion.div>
  );
}

function LicensesSubView() {
  const libs = [
    { name: 'React', desc: 'Interface de utilizador por Componentes' },
    { name: 'Lucide React', desc: 'Conjunto de ícones vetoriais modernos' },
    { name: 'Framer Motion', desc: 'Biblioteca de animações fluidas' },
    { name: 'Tailwind CSS', desc: 'Framework de estilização utilitária' },
    { name: 'Recharts', desc: 'Gráficos de dados em tempo real' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 space-y-6 border border-white/[0.03]">
        <div className="space-y-4">
           {libs.map((lib, i) => (
             <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                <div>
                   <h4 className="text-sm font-bold text-white">{lib.name}</h4>
                   <p className="text-[10px] text-slate-500">{lib.desc}</p>
                </div>
                <div className="px-2 py-1 bg-white/5 rounded text-[8px] font-black uppercase text-slate-400">MIT</div>
             </div>
           ))}
        </div>
        <p className="text-[10px] text-slate-600 italic text-center pt-4">
          Trampo Rápido é construído sobre software de código aberto. Agradecemos a todos os contribuidores.
        </p>
      </div>
    </motion.div>
  );
}

function TransactionItem({ label, date, value, type }: { label: string, date: string, value: string, type: 'in' | 'out' }) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#0b0e14] rounded-2xl border border-white/[0.02] group hover:bg-white/[0.03] transition-all">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", type === 'in' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
           {type === 'in' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
        </div>
        <div>
           <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{label}</p>
           <p className="text-[10px] text-slate-500">{date}</p>
        </div>
      </div>
      <p className={cn("text-sm font-bold", type === 'in' ? "text-emerald-400" : "text-white")}>
         {type === 'in' ? '+' : '-'} {value} Kz
      </p>
    </div>
  );
}

function ArrowDownLeft(props: any) {
  return <ArrowDownRight {...props} className={cn(props.className, "-rotate-90")} />;
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: ReactNode }) {
  return (
    <div className="bg-[#151921] rounded-[24px] p-5 border border-white/[0.03] space-y-3 shadow-lg shadow-black/5">
       <div className="flex items-center gap-2">
          {icon}
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
       </div>
       <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function CategoryProgress({ label, percent, value, color }: { label: string, percent: number, value: string, color: string }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-300">{label}</span>
          <span className="text-xs font-bold text-white">{value}</span>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            className={cn("h-full transition-all rounded-full", color)}
          />
       </div>
    </div>
  );
}

function WithdrawMethod({ label, type, active }: { label: string, type: string, active: boolean }) {
  return (
    <button className={cn("w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]", active ? "bg-blue-600/10 border-blue-600/30 ring-1 ring-blue-600/20" : "bg-[#0b0e14] border-white/5 hover:bg-white/5")}>
       <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", active ? "bg-blue-600 text-white" : "bg-white/5 text-slate-500")}>
             <Building size={18} />
          </div>
          <div className="text-left">
             <p className="text-sm font-bold text-white">{label}</p>
             <p className="text-[10px] text-slate-500 uppercase font-black">{type}</p>
          </div>
       </div>
       {active ? <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white transition-all"><Check size={12} /></div> : <div className="w-5 h-5 rounded-full border border-white/10" />}
    </button>
  );
}

function CurrencyOption({ code, name, symbol, selected, onClick }: { code: string, name: string, symbol: string, selected: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]", selected ? "bg-orange-600/10 border-orange-600/30 shadow-lg shadow-orange-500/5" : "bg-[#0b0e14] border-white/5 hover:bg-white/5")}>
       <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all", selected ? "bg-orange-500 text-white" : "bg-white/5 text-slate-500")}>
             {symbol}
          </div>
          <div className="text-left">
             <p className="text-sm font-bold text-white">{code}</p>
             <p className="text-[10px] text-slate-500 font-medium">{name}</p>
          </div>
       </div>
       {selected ? <CheckCircle2 className="text-orange-500 scale-110" size={20} /> : <div className="w-5 h-5 rounded-full border border-white/10" />}
    </button>
  );
}

function SecurityRule({ met, text }: { met: boolean, text: string }) {
  return (
    <li className="flex items-center gap-2 text-[11px]">
      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center transition-all", met ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-600")}>
        <Check size={10} />
      </div>
      <span className={cn("transition-colors duration-300", met ? "text-slate-300" : "text-slate-600")}>{text}</span>
    </li>
  );
}

function MenuItem({ label, icon, onClick }: { label: string, icon?: ReactNode, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between py-4 group transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-slate-500 group-hover:text-orange-500 shrink-0 transition-colors">{icon}</span>}
        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <ChevronRight size={16} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
    </button>
  );
}

function DisputesSubView() {
  const disputes = [
    { id: 'DSP-9921', title: 'Reparação de AC não concluída', status: 'Em análise', date: '6 Mai 2026', type: 'Refund' },
    { id: 'DSP-8842', title: 'Pagamento duplicado', status: 'Resolvido', date: '2 Mai 2026', type: 'Billing' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 space-y-6 border border-white/[0.03]">
        <div className="flex items-center justify-between">
           <h3 className="font-bold text-white text-sm">Meus Casos</h3>
           <button className="px-4 py-2 bg-blue-600/10 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-all">Abrir Nova Disputa</button>
        </div>

        {disputes.length > 0 ? (
          <div className="space-y-4">
            {disputes.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl bg-[#0b0e14] border border-white/5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold mb-1">{d.id} • {d.type}</p>
                    <h4 className="text-sm font-bold text-white">{d.title}</h4>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
                    d.status === 'Resolvido' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                  )}>
                    {d.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-[10px] text-slate-600">{d.date}</span>
                  <button className="text-[10px] font-bold text-blue-400 hover:underline">Ver Detalhes</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center space-y-3">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                <ShieldAlert size={32} />
             </div>
             <p className="text-slate-500 text-sm">Sem disputas ativas no momento.</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-blue-500/5 rounded-[24px] border border-blue-500/20">
         <h4 className="text-sm font-bold text-blue-400 mb-2">Como funcionam as disputas?</h4>
         <p className="text-xs text-slate-400 leading-relaxed">
           Nosso sistema de escrow retém o pagamento até que ambas as partes concordem com a conclusão. Em caso de conflito, nossa equipe de mediação analisa as evidências para uma decisão justa.
         </p>
      </div>
    </motion.div>
  );
}

function DepositSubView() {
  const [amount, setAmount] = useState('10000');
  const [method, setMethod] = useState<'express' | 'bank' | 'mobile'>('express');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 space-y-6 border border-white/[0.03]">
        <div className="space-y-2">
           <label className="text-xs text-slate-500 font-medium ml-1">Quanto deseja carregar?</label>
           <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-6 text-2xl font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Kz</span>
           </div>
        </div>

        <div className="space-y-4">
           <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Forma de Pagamento</p>
           <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setMethod('express')}
                className={cn("p-4 rounded-2xl border flex items-center gap-4 transition-all", method === 'express' ? "bg-orange-500/10 border-orange-500/30" : "bg-[#0b0e14] border-white/5")}
              >
                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", method === 'express' ? "bg-orange-500 text-white" : "bg-white/5 text-slate-500")}>
                    <Smartphone size={20} />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-bold text-white">MCX Express</p>
                    <p className="text-[10px] text-slate-500">Pagamento instantâneo via telefone</p>
                 </div>
              </button>
              
              <button 
                onClick={() => setMethod('bank')}
                className={cn("p-4 rounded-2xl border flex items-center gap-4 transition-all", method === 'bank' ? "bg-blue-500/10 border-blue-500/30" : "bg-[#0b0e14] border-white/5")}
              >
                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", method === 'bank' ? "bg-blue-500 text-white" : "bg-white/5 text-slate-500")}>
                    <Building size={20} />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-bold text-white">Transferência Bancária</p>
                    <p className="text-[10px] text-slate-500">Libertação após envio do comprovativo</p>
                 </div>
              </button>

              <button 
                onClick={() => setMethod('mobile')}
                className={cn("p-4 rounded-2xl border flex items-center gap-4 transition-all", method === 'mobile' ? "bg-emerald-500/10 border-emerald-500/30" : "bg-[#0b0e14] border-white/5")}
              >
                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", method === 'mobile' ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-500")}>
                    <RefreshCw size={20} />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-bold text-white">Unitel Money / Africash</p>
                    <p className="text-[10px] text-slate-500">Carteiras móveis nacionais</p>
                 </div>
              </button>
           </div>
        </div>

        <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
          Continuar para Pagamento
        </button>
      </div>

      <div className="p-6 bg-blue-500/5 rounded-[24px] border border-blue-500/20 flex gap-4">
         <ShieldCheck className="text-blue-400 shrink-0" size={24} />
         <p className="text-xs text-slate-400 leading-relaxed">
           Seus dados de pagamento são encriptados e nunca armazenamos seu código PIN do multicaixa.
         </p>
      </div>
    </motion.div>
  );
}

function KYCSubView() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="py-4 space-y-6"
    >
      <div className="bg-[#151921] rounded-[24px] p-6 space-y-8 border border-white/[0.03]">
        <div className="text-center space-y-3">
           <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-500">
              <ShieldCheck size={40} />
           </div>
           <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Verificação de Identidade</h3>
              <p className="text-slate-500 text-xs">Necessário para saques acima de 100.000 Kz</p>
           </div>
        </div>

        <div className="space-y-4">
           <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                 <Check size={16} />
              </div>
              <div>
                 <p className="text-sm font-bold text-emerald-400">E-mail verificado</p>
                 <p className="text-[10px] text-emerald-500/60">Sua conta está segura</p>
              </div>
           </div>

           <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 opacity-50">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                 <FileText size={16} />
              </div>
              <div className="flex-1">
                 <p className="text-sm font-bold text-white">Documento de Identificação</p>
                 <p className="text-[10px] text-slate-500">BI ou Passaporte</p>
              </div>
              <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Enviar</button>
           </div>

           <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 opacity-50">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                 <Smartphone size={16} />
              </div>
              <div className="flex-1">
                 <p className="text-sm font-bold text-white">Reconhecimento Facial</p>
                 <p className="text-[10px] text-slate-500">Selfie de segurança</p>
              </div>
              <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Iniciar</button>
           </div>
        </div>

        <div className="bg-blue-600/5 p-5 rounded-2xl border border-blue-600/10">
           <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-2">Porquê verificar?</p>
           <p className="text-xs text-slate-400 leading-relaxed">
             A verificação KYC aumenta seu Trust Score, permitindo saques maiores e prioridade em trabalhos de alta confiança.
           </p>
        </div>
      </div>
    </motion.div>
  );
}

function ToggleItem({ label, desc, active, icon }: { label: string, desc?: string, active: boolean, icon?: ReactNode }) {
  const [isActive, setIsActive] = useState(active);
  return (
    <div className="flex items-center justify-between ">
      <div className="flex-1 pr-4 flex items-start gap-3">
        {icon && <span className="text-blue-400 mt-1 shrink-0">{icon}</span>}
        <div>
          <p className="text-sm font-bold text-white">{label}</p>
          {desc && <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{desc}</p>}
        </div>
      </div>
      <button 
        onClick={() => setIsActive(!isActive)}
        className={cn(
          "w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0",
          isActive ? "bg-blue-600 shadow-inner ring-4 ring-blue-600/10" : "bg-[#0b0e14] border border-white/10"
        )}
      >
        <motion.div 
          animate={{ x: isActive ? 24 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
        />
      </button>
    </div>
  );
}
