import { useState, type FormEvent, useEffect, useRef, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, Lock, Mail, ChevronRight, User, 
  ShieldCheck, AlertCircle, Briefcase, 
  ArrowLeft, CheckCircle2, Info, RefreshCw,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LoginProps {
  onLogin: (user: any) => void;
}

type ViewState = 'landing' | 'login' | 'register_info' | 'register_type' | 'recovery';
type RecoveryStep = 'identify' | 'otp' | 'reset';

export default function Login({ onLogin }: LoginProps) {
  const [view, setView] = useState<ViewState>('landing');
  const [recoveryStage, setRecoveryStage] = useState<RecoveryStep>('identify');
  const [loginId, setLoginId] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  
  // Forms
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+244');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'provider' | null>(null);
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Recovery States
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) return setError('Preencha todos os campos');
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginId, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIdentify = async () => {
    if (!recoveryIdentifier) return setError('Insira o seu contacto');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/recovery/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: recoveryIdentifier })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRecoveryStage('otp');
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpValue.join('');
    if (fullOtp.length < 6) return setError('Insira o código completo');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/recovery/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: recoveryIdentifier, otp: fullOtp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRecoveryStage('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 6) return setError('Mínimo 6 caracteres');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/recovery/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: recoveryIdentifier, 
          otp: otpValue.join(''),
          newPassword: password 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setView('login');
      setError('Sucesso! Pode fazer login.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpValue];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValue(newOtp);
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !regPassword || !role) return setError('Preencha todos os campos');
    if (regPassword.length < 6) return setError('Palavra-passe deve ter 6 ou mais caracteres');
    if (regPassword !== confirmPassword) return setError('As palavras-passe não coincidem');
    if (!agreed) return setError('É necessário aceitar os termos');

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password: regPassword, role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b0e14]">
      <AnimatePresence mode="wait">
        {/* LANDING VIEW */}
        {view === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md text-center"
          >
            <div className="mb-12">
              <div className="w-20 h-20 bg-orange-500 rounded-[28px] mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-orange-500/20">
                <Briefcase size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tighter">Trampo Rápido</h1>
              <p className="text-slate-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                Encontre e ofereça trabalhos de forma rápida e segura
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setView('login')}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
              >
                Entrar
              </button>
              <button 
                onClick={() => setView('register_info')}
                className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
              >
                Criar Conta
              </button>
            </div>

            <p className="mt-12 text-[10px] text-slate-500 font-medium leading-relaxed max-w-[240px] mx-auto">
              Ao continuar, aceitas os <span className="text-orange-500/80 underline">Termos de Serviço</span> e a <span className="text-orange-500/80 underline">Política de Privacidade</span>
            </p>
          </motion.div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md bg-[#151921] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl"
          >
            <button onClick={() => setView('landing')} className="mb-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <ArrowLeft size={16} /> Voltar
            </button>
            
            <div className="mb-10">
              <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Bem-vindo de volta!</h2>
              <p className="text-slate-400 text-xs">Insere os teus dados para entrar no app</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email ou Telefone</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="ex: +244923..."
                    className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Palavra-passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium tracking-widest"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="keep" className="w-4 h-4 rounded border-white/5 bg-[#0d1117] text-orange-500 outline-none" />
                  <label htmlFor="keep" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer">Manter sessão</label>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setView('recovery'); setRecoveryStage('identify'); setError(''); }}
                  className="text-[10px] font-bold text-slate-500 hover:text-orange-500 uppercase tracking-widest transition-colors"
                >
                  Esqueci a palavra-passe
                </button>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all mt-6"
              >
                {loading ? "A processar..." : "Entrar"}
              </button>
            </form>
          </motion.div>
        )}

        {/* RECOVERY VIEW */}
        {view === 'recovery' && (
          <motion.div 
            key="recovery"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md bg-[#151921] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl"
          >
             <AnimatePresence mode="wait">
                  {recoveryStage === 'identify' && (
                    <motion.div 
                      key="id" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      <button onClick={() => setView('login')} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Voltar
                      </button>

                      <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">Recuperar Conta</h2>
                        <p className="text-slate-400 text-xs">Insere o teu número de telefone ou email para receber o código.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contacto</label>
                          <div className="relative">
                             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                             <input 
                               type="text" value={recoveryIdentifier} onChange={e => setRecoveryIdentifier(e.target.value)}
                               className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium" 
                               placeholder="Ex: +244923..." 
                             />
                          </div>
                        </div>
                        
                        {error && <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}

                        <button 
                          onClick={handleIdentify}
                          disabled={loading}
                          className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                        >
                          {loading ? 'A processar...' : 'Enviar Código'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {recoveryStage === 'otp' && (
                    <motion.div 
                      key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">Verifica o código</h2>
                        <p className="text-slate-400 text-xs text-balance">Código enviado para o teu contacto.</p>
                      </div>

                      <div className="space-y-8">
                        <div className="grid grid-cols-6 gap-2 px-1">
                          {otpValue.map((digit, i) => (
                            <input
                              key={i}
                              ref={el => otpRefs.current[i] = el}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={e => handleOtpChange(i, e.target.value)}
                              onKeyDown={e => handleOtpKeyDown(i, e)}
                              className="w-full aspect-square bg-[#0d1117] border border-white/5 rounded-2xl text-center text-xl font-black text-white focus:border-orange-500/50 focus:outline-none transition-all shadow-inner"
                            />
                          ))}
                        </div>

                        {error && <div className="text-red-500 text-center text-[10px] font-bold uppercase tracking-widest">{error}</div>}

                        <div className="space-y-6">
                            <button 
                              onClick={handleVerifyOtp}
                              disabled={loading}
                              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                            >
                              {loading ? <RefreshCw className="animate-spin inline mr-2" size={16} /> : 'Confirmar Código'}
                            </button>
                            
                            <div className="text-center">
                               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Não recebeste o código?</p>
                               <button 
                                 disabled={resendTimer > 0}
                                 onClick={handleIdentify}
                                 className="text-orange-500 text-xs font-black uppercase tracking-widest disabled:opacity-30 transition-opacity"
                               >
                                 {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : 'Reenviar Agora'}
                               </button>
                            </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {recoveryStage === 'reset' && (
                    <motion.div 
                      key="reset" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      <div className="space-y-2">
                         <h2 className="text-2xl font-extrabold text-white tracking-tight">Nova Palavra-passe</h2>
                         <p className="text-slate-400 text-xs text-balance">Identidade confirmada! Escolha uma senha nova e segura.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nova Senha</label>
                          <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                             <input 
                               type="password" value={password} onChange={e => setPassword(e.target.value)}
                               className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium tracking-widest" 
                               placeholder="Mínimo 6 caracteres" 
                             />
                          </div>
                        </div>

                        {error && <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</div>}

                        <button 
                          onClick={handleResetPassword}
                          disabled={loading}
                          className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                        >
                          {loading ? 'A processar...' : 'Redefinir Palavra-passe'}
                        </button>
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>
          </motion.div>
        )}

        {/* REGISTER INFO VIEW */}
        {view === 'register_info' && (
          <motion.div 
            key="register_info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md bg-[#151921] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl"
          >
            <button onClick={() => setView('landing')} className="mb-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <ArrowLeft size={16} /> Voltar
            </button>
            
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Criar uma conta</h2>
              <p className="text-slate-400 text-xs">Junta-te ao maior marketplace de serviços</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome e Apelido"
                  className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+244"
                    className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email <span className="opacity-50">(opcial)</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teu@email.com"
                    className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Palavra-passe</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium  tracking-widest"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirmar</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-[#0d1117] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium  tracking-widest"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="agreed"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/5 bg-[#0d1117] text-orange-500" 
                />
                <label htmlFor="agreed" className="text-[11px] text-slate-400 leading-tight">
                  Aceito os <span className="text-orange-500/80 font-bold underline">Termos de Serviço</span> e a <span className="text-orange-500/80 font-bold underline">Política de Privacidade</span>
                </label>
              </div>

              <button 
                onClick={() => setView('register_type')}
                disabled={!name || regPassword.length < 6 || regPassword !== confirmPassword || !agreed}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all mt-6 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                Próximo Passo <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* REGISTER TYPE VIEW */}
        {view === 'register_type' && (
          <motion.div 
            key="register_type"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md bg-[#151921] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl"
          >
            <button onClick={() => setView('register_info')} className="mb-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <ArrowLeft size={16} /> Voltar
            </button>
            
            <div className="mb-10">
              <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Escolha o tipo de conta</h2>
              <p className="text-slate-400 text-xs">Podes alterar isto mais tarde nas definições</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setRole('client')}
                className={cn(
                  "w-full p-6 rounded-[24px] border-2 text-left transition-all group overflow-hidden relative",
                  role === 'client' ? "border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/10" : "border-white/5 bg-white/5 hover:border-white/10"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-colors",
                  role === 'client' ? "bg-orange-500 text-white" : "bg-white/10 text-slate-500"
                )}>
                  <User size={24} />
                </div>
                <h3 className="text-white font-black text-base mb-1 tracking-tight">Cliente</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">Quero contratar serviços e encontrar profissionais</p>
                
                {role === 'client' && (
                  <div className="absolute top-4 right-4 text-orange-500">
                    <CheckCircle2 size={24} />
                  </div>
                )}
              </button>

              <button 
                onClick={() => setRole('provider')}
                className={cn(
                  "w-full p-6 rounded-[24px] border-2 text-left transition-all group overflow-hidden relative",
                  role === 'provider' ? "border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/10" : "border-white/5 bg-white/5 hover:border-white/10"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-colors",
                  role === 'provider' ? "bg-orange-500 text-white" : "bg-white/10 text-slate-500"
                )}>
                  <Briefcase size={24} />
                </div>
                <h3 className="text-white font-black text-base mb-1 tracking-tight">Prestador</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">Quero oferecer os meus serviços e ganhar dinheiro</p>

                {role === 'provider' && (
                  <div className="absolute top-4 right-4 text-orange-500">
                    <CheckCircle2 size={24} />
                  </div>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold mt-4">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button 
                onClick={handleRegister}
                disabled={!role || loading}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all mt-6 disabled:opacity-50"
              >
                {loading ? "A criar conta..." : "Finalizar Registo"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
