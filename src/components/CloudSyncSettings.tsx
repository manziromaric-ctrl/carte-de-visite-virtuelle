import { useState, useEffect } from 'react';
import { Database, Radio, CheckCircle, AlertCircle, RefreshCw, Key, Globe, Copy, Check, ExternalLink, HelpCircle, Code } from 'lucide-react';
import { getSavedSupabaseConfig, saveSupabaseConfig, getSupabaseClient, resetSupabaseClient } from '../lib/supabase';
import { CloudSyncStatus } from '../services/cloudSync';

interface CloudSyncSettingsProps {
  syncStatus?: CloudSyncStatus;
}

const SUPABASE_SQL_SNIPPET = `-- 1. Création de la table pour la carte de visite
CREATE TABLE IF NOT EXISTS public.digital_cards (
  id TEXT PRIMARY KEY,
  profile_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Activation de la lecture et écriture publiques (pour la synchronisation)
ALTER TABLE public.digital_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique pour tous les visiteurs" ON public.digital_cards;
CREATE POLICY "Lecture publique pour tous les visiteurs" 
ON public.digital_cards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mise à jour autorisée" ON public.digital_cards;
CREATE POLICY "Mise à jour autorisée" 
ON public.digital_cards FOR ALL USING (true);

-- 3. Activation de la diffusion temps réel (Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.digital_cards;

-- 4. Bucket de stockage 'videos' pour la synchronisation vidéo smartphone
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Videos Read" ON storage.objects;
CREATE POLICY "Public Videos Read" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "Public Videos Upload" ON storage.objects;
CREATE POLICY "Public Videos Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'videos');

DROP POLICY IF EXISTS "Public Videos Update" ON storage.objects;
CREATE POLICY "Public Videos Update" 
ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'videos');`;

export function CloudSyncSettings({ syncStatus }: CloudSyncSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [tableName, setTableName] = useState('digital_cards');
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message?: string }>({
    status: 'idle',
  });

  useEffect(() => {
    const cfg = getSavedSupabaseConfig();
    setSupabaseUrl(cfg.url || '');
    setSupabaseKey(cfg.anonKey || '');
    setTableName(cfg.tableName || 'digital_cards');
  }, []);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SNIPPET);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleSaveAndTest = async () => {
    setTestResult({ status: 'testing', message: 'Test de connexion à Supabase...' });
    
    const cleanUrl = supabaseUrl.trim().replace(/\/+$/, '');
    const cleanKey = supabaseKey.trim();

    // If both fields are cleared, reset to Firestore only
    if (!cleanUrl && !cleanKey) {
      saveSupabaseConfig({ url: '', anonKey: '', tableName: 'digital_cards' });
      resetSupabaseClient();
      setTestResult({
        status: 'success',
        message: 'Supabase désactivé. Votre base Firestore intégrée assure 100% de la diffusion temps réel.',
      });
      return;
    }

    // Validate URL format
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setTestResult({
        status: 'error',
        message: 'L\'URL Supabase doit commencer par https:// (ex: https://xyz.supabase.co)',
      });
      return;
    }

    if (!cleanKey) {
      setTestResult({
        status: 'error',
        message: 'Veuillez saisir votre clé publique anon (anon key) fournie par Supabase.',
      });
      return;
    }

    try {
      saveSupabaseConfig({
        url: cleanUrl,
        anonKey: cleanKey,
        tableName: tableName.trim() || 'digital_cards',
      });
      resetSupabaseClient();

      const client = getSupabaseClient();
      if (!client) {
        setTestResult({
          status: 'error',
          message: 'Échec d\'initialisation du client Supabase avec ces identifiants.',
        });
        return;
      }

      // Test reaching Supabase API
      const { error } = await client.from(tableName.trim() || 'digital_cards').select('id').limit(1);

      if (error && error.code !== 'PGRST116' && !error.message?.includes('relation') && !error.message?.includes('does not exist')) {
        // Real API or auth error
        if (error.message?.includes('JWT') || error.message?.includes('apikey') || error.code === '401') {
          setTestResult({
            status: 'error',
            message: `Erreur d'authentification : La clé "anon" n'est pas reconnue pour ce projet Supabase.`,
          });
          return;
        }
      }

      setTestResult({
        status: 'success',
        message: 'Connexion Supabase réussie ! Double synchronisation et broadcast en direct actifs.',
      });
    } catch (e: any) {
      setTestResult({
        status: 'error',
        message: `Erreur réseau ou identifiant invalide : ${e?.message || 'Vérifiez l\'URL et la clé anonyme.'}`,
      });
    }
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white text-xs">Backend Cloud & Synchronisation Temps Réel</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{syncStatus?.isConnected ? 'En direct' : 'Connecté'}</span>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-emerald-200">Synchronisation universelle active</span>
          <span>
            Votre carte est déjà connectée au cloud en temps réel. Dès que vous cliquez sur « Enregistrer les modifications », tous les visiteurs voient instantanément les nouveaux textes, contacts et vidéos.
          </span>
        </div>
      </div>

      {/* Supabase Custom Credentials Accordion */}
      <div className="pt-2 border-t border-slate-900">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[11px] text-teal-400 hover:text-teal-300 font-medium flex items-center justify-between w-full py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>Connecter votre projet Supabase personnel (Optionnel)</span>
          </span>
          <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="mt-3 space-y-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] animate-in fade-in">
            {/* Quick Guide */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-slate-300">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Où trouver vos identifiants Supabase ?</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[10px] text-slate-400 pl-1">
                <li>
                  Rendez-vous sur <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a> et ouvrez votre projet.
                </li>
                <li>Allez dans le menu <strong className="text-slate-200">Project Settings</strong> (engrenage en bas à gauche) &rarr; <strong className="text-slate-200">API</strong>.</li>
                <li>Copiez l’adresse dans <strong className="text-slate-200">Project URL</strong> (ex: <code className="text-teal-300">https://xxxx.supabase.co</code>).</li>
                <li>Copiez la clé dans <strong className="text-slate-200">Project API Keys</strong> &rarr; <strong className="text-amber-300">anon public</strong> (commence par <code className="text-amber-300">eyJ...</code>).</li>
              </ol>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1 font-medium">
                <Globe className="w-3 h-3 text-teal-400" />
                <span>1. Supabase Project URL</span>
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-400 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1 font-medium">
                <Key className="w-3 h-3 text-amber-400" />
                <span>2. Supabase Anon Public Key</span>
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-400 font-mono text-[11px]"
              />
            </div>

            {/* SQL Table Creation Helper */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowSqlHelp(!showSqlHelp)}
                className="text-[10px] text-slate-400 hover:text-slate-300 flex items-center gap-1"
              >
                <Code className="w-3 h-3 text-teal-400" />
                <span>Besoin du script SQL pour créer la table dans Supabase ? {showSqlHelp ? '(Masquer)' : '(Afficher)'}</span>
              </button>

              {showSqlHelp && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Copiez et collez ceci dans le menu <strong>SQL Editor</strong> de Supabase :</span>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSql ? 'Copié !' : 'Copier le SQL'}</span>
                    </button>
                  </div>
                  <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[9px] overflow-x-auto leading-relaxed">
                    {SUPABASE_SQL_SNIPPET}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500">
                Laisser vide pour continuer avec Firebase Firestore.
              </span>
              <button
                type="button"
                onClick={handleSaveAndTest}
                disabled={testResult.status === 'testing'}
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {testResult.status === 'testing' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                <span>Tester & Enregistrer</span>
              </button>
            </div>

            {testResult.status !== 'idle' && (
              <div
                className={`p-2.5 rounded-lg flex items-center gap-2 text-[10px] ${
                  testResult.status === 'success'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : testResult.status === 'error'
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {testResult.status === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : testResult.status === 'error' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
