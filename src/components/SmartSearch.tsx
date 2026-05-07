import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, DollarSign, Target, ChevronRight, Clock, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { JOB_CATEGORIES } from '../constants';

interface SmartSearchProps {
  onSearch: (results: any[]) => void;
  onAccept: (job: any) => void;
  onDetails: (job: any) => void;
}

export default function SmartSearch({ onSearch, onAccept, onDetails }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const placeholders = [
    "O que precisas hoje?",
    "Procura um trabalho...",
    "Ex: eletricista, limpeza, entregas",
    "Trabalhos rápidos perto de ti"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simple location simulation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.log('Location error', err)
    );
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = JOB_CATEGORIES.filter(c => 
        c.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    
    // Trigger real search
    const timer = setTimeout(() => {
       handleSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [query, activeFilter]);

  const handleSearch = async (specificQuery?: string) => {
    const q = specificQuery !== undefined ? specificQuery : query;
    let url = `/api/jobs/search?q=${q}`;
    
    if (activeFilter === 'urgent') url += '&urgency=high&sortBy=urgent';
    if (activeFilter === 'paid') url += '&sortBy=price';
    if (activeFilter === 'near') url += '&sortBy=recent'; // In a real app, distance logic would go here

    try {
      const resp = await fetch(url);
      const data = await resp.json();
      onSearch(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuggestionClick = (s: string) => {
    setQuery(s);
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <div className="space-y-4">
      {/* Fixed Header Content */}
      <div className="sticky top-0 z-40 bg-[#0f111a] -mx-6 px-6 pt-2 pb-4 space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500">
            <MapPin size={18} />
          </div>
          <input
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholders[placeholderIndex]}
            className="w-full bg-[#151921] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all shadow-xl"
          />
          
          <AnimatePresence>
            {isFocused && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#1c212b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl z-50"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full px-6 py-4 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center justify-between group transition-colors"
                  >
                    <span>{s}</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          <FilterChip 
            active={activeFilter === 'urgent'} 
            onClick={() => setActiveFilter(activeFilter === 'urgent' ? null : 'urgent')}
            icon={<Zap size={14} />} 
            label="Urgentes" 
          />
          <FilterChip 
            active={activeFilter === 'paid'} 
            onClick={() => setActiveFilter(activeFilter === 'paid' ? null : 'paid')}
            icon={<DollarSign size={14} />} 
            label="Mais Pagos" 
          />
          <FilterChip 
            active={activeFilter === 'near'} 
            onClick={() => setActiveFilter(activeFilter === 'near' ? null : 'near')}
            icon={<Target size={14} />} 
            label="Perto de mim" 
          />
        </div>
      </div>

      {/* IA Suggestions when search is empty */}
      {!query && !activeFilter && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <IASuggestionCard 
            title="Trabalhos perto de ti" 
            count="12 novos" 
            onClick={() => setActiveFilter('near')}
            color="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          />
          <IASuggestionCard 
            title="Urgentes agora" 
            count="5 hoje" 
            onClick={() => setActiveFilter('urgent')}
            color="bg-amber-500/10 text-amber-500 border-amber-500/20"
          />
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all active:scale-95",
        active ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20" : "bg-white/5 text-slate-500 border-white/5"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function IASuggestionCard({ title, count, onClick, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn("p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all active:scale-95", color)}
    >
      <div className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</div>
      <div className="text-[9px] font-bold opacity-60">{count}</div>
      <div className="mt-auto self-end">
        <ChevronRight size={14} />
      </div>
    </button>
  );
}
