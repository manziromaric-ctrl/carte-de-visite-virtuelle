import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Activity, 
  Globe, 
  Zap, 
  Phone, 
  MessageSquare, 
  UserPlus, 
  Share2, 
  Film, 
  Image as ImageIcon, 
  MapPin, 
  Compass, 
  Clock, 
  Calendar, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Search, 
  Filter, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Layers
} from 'lucide-react';
import { 
  CardInteractionEvent, 
  InteractionActionType, 
  CountryStatistic 
} from '../types';
import { 
  subscribeToLiveInteractions, 
  computeAnalyticsSummary, 
  formatInteractionDate,
  trackInteraction 
} from '../services/analyticsService';
import { KongoLogo } from './KongoLogo';

interface AnalyticsDashboardProps {
  onBackToCard: () => void;
  cardCompanyName?: string;
  cardOwnerName?: string;
}

export function AnalyticsDashboard({ 
  onBackToCard, 
  cardCompanyName = 'Kongo Digital Wave',
  cardOwnerName = 'Manzi Romaric'
}: AnalyticsDashboardProps) {
  const [events, setEvents] = useState<CardInteractionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stream' | 'countries' | 'actions' | 'trends'>('stream');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('all');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Subscribe to live Firestore interactions
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToLiveInteractions((liveEvents) => {
      setEvents(liveEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute metrics in real-time
  const summary = useMemo(() => computeAnalyticsSummary(events), [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedCountryFilter !== 'all' && ev.country !== selectedCountryFilter) {
        return false;
      }
      if (selectedActionFilter !== 'all' && ev.actionType !== selectedActionFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesAction = ev.actionLabel?.toLowerCase().includes(query);
        const matchesCountry = ev.country?.toLowerCase().includes(query);
        const matchesCity = ev.city?.toLowerCase().includes(query);
        const matchesDetails = ev.details?.toLowerCase().includes(query);
        if (!matchesAction && !matchesCountry && !matchesCity && !matchesDetails) {
          return false;
        }
      }
      return true;
    });
  }, [events, selectedCountryFilter, selectedActionFilter, searchQuery]);

  // Action Icon & Styling helper
  const getActionBadge = (type: InteractionActionType) => {
    switch (type) {
      case 'whatsapp_click':
        return {
          icon: MessageSquare,
          bg: 'bg-green-500/15 text-green-400 border-green-500/30',
          label: 'WhatsApp',
          badgeText: 'Message Direct',
        };
      case 'phone_call':
        return {
          icon: Phone,
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          label: 'Appel',
          badgeText: 'Appel Téléphonique',
        };
      case 'save_contact':
        return {
          icon: UserPlus,
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          label: 'vCard',
          badgeText: 'Contact Enregistré',
        };
      case 'video_play':
        return {
          icon: Film,
          bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          label: 'Vidéo',
          badgeText: 'Spot Vidéo Visionné',
        };
      case 'realisation_view':
        return {
          icon: ImageIcon,
          bg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
          label: 'Réalisation',
          badgeText: 'Shooting & Réalisation HD',
        };
      case 'map_view':
        return {
          icon: MapPin,
          bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          label: 'GPS / Itinéraire',
          badgeText: 'Itinéraire Bureau',
        };
      case 'qr_view':
        return {
          icon: Radio,
          bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          label: 'Code QR',
          badgeText: 'Scan Code QR',
        };
      case 'share_card':
      case 'copy_link':
        return {
          icon: Share2,
          bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          label: 'Partage',
          badgeText: 'Carte Partagée',
        };
      case 'social_link':
        return {
          icon: ExternalLink,
          bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          label: 'Réseau Pro',
          badgeText: 'Lien Web / LinkedIn',
        };
      case 'page_view':
      default:
        return {
          icon: Activity,
          bg: 'bg-slate-700/30 text-slate-300 border-slate-700/50',
          label: 'Visite',
          badgeText: 'Consultation Carte',
        };
    }
  };

  // Device icon
  const getDeviceIcon = (device?: string) => {
    if (device === 'mobile') return <Smartphone className="w-3.5 h-3.5 text-slate-400" title="Smartphone" />;
    if (device === 'tablet') return <Tablet className="w-3.5 h-3.5 text-slate-400" title="Tablette" />;
    return <Monitor className="w-3.5 h-3.5 text-slate-400" title="Ordinateur" />;
  };

  // Quick live test simulator
  const handleTestInteraction = async (action: InteractionActionType, label: string) => {
    setIsSimulating(true);
    await trackInteraction(action, label, 'Simulation depuis le tableau de bord');
    setTimeout(() => setIsSimulating(false), 500);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (events.length === 0) return;
    const headers = ['Date', 'Heure', 'Action', 'Description', 'Pays', 'Code Pays', 'Ville', 'Appareil', 'Navigateur', 'ID Session'];
    const rows = events.map((ev) => {
      const d = formatInteractionDate(ev.timestamp);
      return [
        `"${d.date}"`,
        `"${d.time}"`,
        `"${ev.actionType}"`,
        `"${(ev.actionLabel || '').replace(/"/g, '""')}"`,
        `"${ev.country || ''}"`,
        `"${ev.countryCode || ''}"`,
        `"${ev.city || ''}"`,
        `"${ev.device || ''}"`,
        `"${ev.browser || ''}"`,
        `"${ev.sessionId || ''}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kongo_interactions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setExportNotice('Export CSV téléchargé avec succès !');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-emerald-500 selection:text-slate-950">
      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/3 w-[650px] h-[550px] bg-emerald-500/10 blur-[140px] rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-500/5 blur-[130px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-6">
        
        {/* Navigation & Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-850">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToCard}
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-md group flex items-center gap-1.5 text-xs font-semibold"
              title="Retourner à la carte de visite"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400 transition-transform group-hover:-translate-x-0.5" />
              <span>Voir la Carte</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>Tableau de Bord & Analytics</span>
                </h1>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Temps Réel
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mesure continue des visiteurs, pays d'origine et interactions de la carte de {cardOwnerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all"
              title="Exporter les interactions en CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Exporter</span> CSV
            </button>

            {/* Back to Card quick action */}
            <button
              type="button"
              onClick={onBackToCard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              <span>Carte Digitale</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Notice toast if export done */}
        {exportNotice && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {exportNotice}
            </span>
          </div>
        )}

        {/* 4 PRIMARY METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* 1. Utilisateurs Uniques */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Utilisateurs Uniques</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {summary.uniqueUsers.toLocaleString('fr-FR')}
            </div>
            <div className="mt-2 text-[11px] text-emerald-400/90 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Visiteurs distincts connectés</span>
            </div>
          </div>

          {/* 2. Total Interactions */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Total Interactions</span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {summary.totalInteractions.toLocaleString('fr-FR')}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-teal-400" />
              <span>{summary.todayInteractions} enregistrées aujourd'hui</span>
            </div>
          </div>

          {/* 3. Pays d'Origine */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Pays d'Origine</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{summary.countriesList.length}</span>
              <div className="flex -space-x-1 text-sm overflow-hidden">
                {summary.countriesList.slice(0, 3).map((c) => (
                  <span key={c.countryCode} title={c.country} className="text-base">
                    {c.flagEmoji}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 truncate">
              {summary.countriesList[0] ? `Top: ${summary.countriesList[0].country} (${summary.countriesList[0].percentage}%)` : 'Localisation mondiale'}
            </div>
          </div>

          {/* 4. Actifs Récemment / En Direct */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Actifs Récemment</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{Math.max(summary.activeNow, 1)}</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="mt-2 text-[11px] text-amber-400/90">
              Dans les 15 dernières minutes
            </div>
          </div>

        </div>

        {/* QUICK KEY ACTIONS BREAKDOWN ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Clics WhatsApp</div>
              <div className="text-base font-bold text-white">{summary.actionCounts.whatsapp_click}</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Appels Directs</div>
              <div className="text-base font-bold text-white">{summary.actionCounts.phone_call}</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Contacts Enregistrés</div>
              <div className="text-base font-bold text-white">{summary.actionCounts.save_contact}</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Vidéos & Réalisations</div>
              <div className="text-base font-bold text-white">
                {summary.actionCounts.video_play + summary.actionCounts.realisation_view}
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('stream')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'stream'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Flux en Temps Réel ({filteredEvents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('countries')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'countries'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Pays d'Origine ({summary.countriesList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'actions'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Types d'Interactions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'trends'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Évolution 7 Jours</span>
          </button>
        </div>

        {/* TAB 1: FLUX EN TEMPS RÉEL (LIVE STREAM) */}
        {activeTab === 'stream' && (
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par action, pays ou ville (ex: Kinshasa, WhatsApp, Paris)..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Country dropdown */}
              <select
                value={selectedCountryFilter}
                onChange={(e) => setSelectedCountryFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Tous les Pays ({summary.countriesList.length})</option>
                {summary.countriesList.map((c) => (
                  <option key={c.country} value={c.country}>
                    {c.flagEmoji} {c.country} ({c.count})
                  </option>
                ))}
              </select>

              {/* Action dropdown */}
              <select
                value={selectedActionFilter}
                onChange={(e) => setSelectedActionFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Toutes les Actions</option>
                <option value="whatsapp_click">💬 WhatsApp</option>
                <option value="phone_call">📞 Appels</option>
                <option value="save_contact">👤 Contact VCard</option>
                <option value="video_play">🎬 Vidéo Spot</option>
                <option value="realisation_view">🖼️ Réalisation HD</option>
                <option value="qr_view">📱 Code QR</option>
                <option value="share_card">🔗 Partage</option>
                <option value="map_view">🗺️ GPS / Carte</option>
                <option value="page_view">👁️ Consultation</option>
              </select>
            </div>

            {/* Test interaction buttons bar */}
            <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-850 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Tester la réception en temps réel :
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleTestInteraction('whatsapp_click', 'Clic WhatsApp (Test en direct)')}
                  className="px-2.5 py-1 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 text-[11px] font-medium transition-all"
                >
                  + WhatsApp
                </button>
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleTestInteraction('phone_call', 'Appel Téléphonique (Test en direct)')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition-all"
                >
                  + Appel
                </button>
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleTestInteraction('save_contact', 'Enregistrement vCard (Test en direct)')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[11px] font-medium transition-all"
                >
                  + vCard
                </button>
              </div>
            </div>

            {/* Interaction Feed List */}
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-2">
                <Activity className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-sm font-semibold text-slate-300">Aucune interaction ne correspond à ce filtre</div>
                <div className="text-xs">Réinitialisez les filtres pour afficher l'historique complet</div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredEvents.map((ev, idx) => {
                  const badge = getActionBadge(ev.actionType);
                  const Icon = badge.icon;
                  const dateInfo = formatInteractionDate(ev.timestamp);

                  return (
                    <div
                      key={ev.id || `${ev.sessionId}_${idx}`}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-start justify-between gap-3 shadow-sm group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Action Icon */}
                        <div className={`w-10 h-10 rounded-xl ${badge.bg} border flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Event Details */}
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition-colors">
                              {ev.actionLabel || badge.badgeText}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </div>

                          {/* Country, City & Device */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 font-medium text-slate-300">
                              <span className="text-sm leading-none">{ev.flagEmoji || '🌍'}</span>
                              <span>{ev.city ? `${ev.city}, ` : ''}{ev.country || 'International'}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {getDeviceIcon(ev.device)}
                              <span className="capitalize">{ev.device || 'mobile'}</span>
                            </span>
                            {ev.browser && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[120px]">{ev.browser}</span>
                              </>
                            )}
                          </div>

                          {ev.details && (
                            <div className="text-[11px] text-slate-500 italic">
                              "{ev.details}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamps (Right Column) */}
                      <div className="text-right shrink-0">
                        <div className="text-xs font-semibold text-emerald-400">
                          {dateInfo.relative}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{dateInfo.time}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {dateInfo.date}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: PAYS D'ORIGINE (COUNTRIES RANKING & DISTRIBUTION) */}
        {activeTab === 'countries' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h2 className="text-sm sm:text-base font-bold text-white mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Répartition Géographique des Utilisateurs</span>
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                Classement des pays par nombre de visites et interactions avec la carte Kongo Digital Wave.
              </p>

              <div className="space-y-4">
                {summary.countriesList.map((item, idx) => (
                  <div key={item.country} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{item.flagEmoji}</span>
                        <span className="font-bold text-white">{item.country}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({item.countryCode})</span>
                      </div>
                      <div className="flex items-center gap-3 font-medium">
                        <span className="text-slate-400">
                          {item.uniqueUsers} {item.uniqueUsers > 1 ? 'utilisateurs' : 'utilisateur'}
                        </span>
                        <span className="font-bold text-emerald-400">
                          {item.count} interactions ({item.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                            : idx === 1 
                            ? 'bg-emerald-500' 
                            : 'bg-emerald-600/70'
                        }`}
                        style={{ width: `${Math.max(item.percentage, 4)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Country Highlight Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-850">
                <div className="text-xs text-slate-400 mb-1">Marché Principal</div>
                <div className="text-base font-bold text-white flex items-center gap-1.5">
                  <span className="text-lg">{summary.countriesList[0]?.flagEmoji || '🇨🇩'}</span>
                  <span>{summary.countriesList[0]?.country || 'RD Congo'}</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">
                  {summary.countriesList[0]?.percentage || 0}% des interactions
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-850">
                <div className="text-xs text-slate-400 mb-1">Couverture Internationale</div>
                <div className="text-base font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>{summary.countriesList.length} Pays Actifs</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Afrique, Europe et Amérique
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-850">
                <div className="text-xs text-slate-400 mb-1">Moyenne par Utilisateur</div>
                <div className="text-base font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>
                    {summary.uniqueUsers > 0 
                      ? (summary.totalInteractions / summary.uniqueUsers).toFixed(1) 
                      : '1.0'}{' '}
                    actions
                  </span>
                </div>
                <div className="text-[11px] text-teal-400 mt-1">
                  Forte fidélité & engagement
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TYPES D'INTERACTIONS (ACTION BREAKDOWN) */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h2 className="text-sm sm:text-base font-bold text-white mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Détail par Type d'Interaction</span>
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                Toutes les actions déclenchées par les prospects et contacts sur votre carte.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    type: 'whatsapp_click' as InteractionActionType,
                    title: 'Discussions WhatsApp',
                    count: summary.actionCounts.whatsapp_click,
                    desc: 'Clic direct sur le bouton WhatsApp pour engager la conversation.',
                  },
                  {
                    type: 'phone_call' as InteractionActionType,
                    title: 'Appels Téléphoniques',
                    count: summary.actionCounts.phone_call,
                    desc: 'Appels directs passés vers votre numéro de téléphone.',
                  },
                  {
                    type: 'save_contact' as InteractionActionType,
                    title: 'Fiches Contacts Téléchargées',
                    count: summary.actionCounts.save_contact,
                    desc: 'Prospects ayant enregistré votre contact complet dans leur répertoire.',
                  },
                  {
                    type: 'video_play' as InteractionActionType,
                    title: 'Vidéos de Réalisation Visionnées',
                    count: summary.actionCounts.video_play,
                    desc: 'Lectures complètes du spot publicitaire ou démonstration vidéo.',
                  },
                  {
                    type: 'realisation_view' as InteractionActionType,
                    title: 'Photos HD de Réalisation Agrandies',
                    count: summary.actionCounts.realisation_view,
                    desc: 'Consultation plein écran de vos shootings & photos de tournage.',
                  },
                  {
                    type: 'qr_view' as InteractionActionType,
                    title: 'Scans & Affichages Code QR',
                    count: summary.actionCounts.qr_view,
                    desc: 'Ouverture du QR Code interactif pour partage physique.',
                  },
                  {
                    type: 'share_card' as InteractionActionType,
                    title: 'Partages de la Carte & Copie de Lien',
                    count: summary.actionCounts.share_card + summary.actionCounts.copy_link,
                    desc: 'Liens envoyés à des tiers ou copiés dans le presse-papier.',
                  },
                  {
                    type: 'map_view' as InteractionActionType,
                    title: 'Consultations Itinéraire GPS',
                    count: summary.actionCounts.map_view,
                    desc: 'Recherche de localisation de votre agence sur Google Maps / GPS.',
                  },
                ].map((item) => {
                  const badge = getActionBadge(item.type);
                  const Icon = badge.icon;
                  const pct = summary.totalInteractions > 0 
                    ? Math.round((item.count / summary.totalInteractions) * 100) 
                    : 0;

                  return (
                    <div
                      key={item.title}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3.5"
                    >
                      <div className={`w-10 h-10 rounded-xl ${badge.bg} border flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs sm:text-sm text-white">{item.title}</span>
                          <span className="font-black text-sm text-emerald-400">{item.count}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {item.desc}
                        </p>
                        <div className="mt-2 text-[10px] text-slate-500 font-medium">
                          Représente {pct}% de l'activité totale
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Device breakdown bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Appareils Utilisés par vos Visiteurs</span>
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <Smartphone className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-slate-400 text-[11px]">Mobile</div>
                  <div className="font-bold text-white mt-0.5">{summary.deviceCounts.mobile}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <Monitor className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                  <div className="text-slate-400 text-[11px]">Ordinateur</div>
                  <div className="font-bold text-white mt-0.5">{summary.deviceCounts.desktop}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <Tablet className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-slate-400 text-[11px]">Tablette</div>
                  <div className="font-bold text-white mt-0.5">{summary.deviceCounts.tablet}</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: ÉVOLUTION TEMPORELLE (7-DAY TRENDS) */}
        {activeTab === 'trends' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h2 className="text-sm sm:text-base font-bold text-white mb-1 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Activité Quotidienne (7 Derniers Jours)</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Évolution journalière du nombre d'interactions et de visiteurs uniques.
              </p>

              {/* Simple Responsive Bar Chart */}
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 sm:h-52 pt-4 px-2 border-b border-slate-800 pb-2">
                {(() => {
                  const maxCount = Math.max(...summary.dailyStats.map((d) => d.totalInteractions), 1);
                  return summary.dailyStats.map((d, index) => {
                    const heightPercent = Math.max(Math.round((d.totalInteractions / maxCount) * 100), 10);
                    const isToday = index === summary.dailyStats.length - 1;

                    return (
                      <div key={d.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">
                          {d.totalInteractions}
                        </span>
                        <div className="w-full max-w-[42px] bg-slate-800 rounded-t-xl overflow-hidden h-full flex items-end">
                          <div
                            className={`w-full rounded-t-xl transition-all duration-500 ${
                              isToday
                                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/25'
                                : 'bg-gradient-to-t from-slate-700 to-teal-500/70 group-hover:from-emerald-600 group-hover:to-teal-400'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>
                        <span className={`text-[10px] font-semibold truncate ${isToday ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {d.displayDate}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 px-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block"></span>
                  <span>Aujourd'hui ({summary.todayInteractions} interactions)</span>
                </span>
                <span>Mise à jour instantanée automatique</span>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM QUICK FOOTER */}
        <footer className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span>Connecté en direct à Firebase Firestore</span>
          </div>
          <button
            type="button"
            onClick={onBackToCard}
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1"
          >
            <span>Retourner à la carte de visite de {cardCompanyName}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </footer>

      </div>
    </div>
  );
}
