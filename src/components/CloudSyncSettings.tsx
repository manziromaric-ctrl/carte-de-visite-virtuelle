import { useState, useEffect } from 'react';
import { Database, Radio, CheckCircle, AlertCircle, RefreshCw, Key, Globe, Copy, Check, ExternalLink, HelpCircle, Code, Zap, ShieldCheck, CheckCircle2, Clock, Terminal, AlertTriangle, Play } from 'lucide-react';
import { getSavedSupabaseConfig, saveSupabaseConfig, getSupabaseClient, resetSupabaseClient, runSupabasePermissionsTest, SUPABASE_FIX_SQL, SupabaseTestReport, SupabaseTestStep } from '../lib/supabase';
import { CloudSyncStatus } from '../services/cloudSync';

interface CloudSyncSettingsProps {
  syncStatus?: CloudSyncStatus;
}

const SUPABASE_SQL_SNIPPET = SUPABASE_FIX_SQL;

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

  // Dedicated read/write permissions test state
  const [isTestingPermissions, setIsTestingPermissions] = useState(false);
  const [permissionsReport, setPermissionsReport] = useState<SupabaseTestReport | null>(null);
  const [liveTestSteps, setLiveTestSteps] = useState<SupabaseTestStep[]>([]);
  const [showPermissionsPanel, setShowPermissionsPanel] = useState(false);
  const [copiedFixSql, setCopiedFixSql] = useState(false);

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

      // Automatically run complete read & write test
      setIsTestingPermissions(true);
      setShowPermissionsPanel(true);
      setLiveTestSteps([]);

      const report = await runSupabasePermissionsTest(
        { url: cleanUrl, anonKey: cleanKey, tableName: tableName.trim() || 'digital_cards' },
        (steps) => setLiveTestSteps(steps)
      );

      setPermissionsReport(report);

      if (report.overallSuccess) {
        setTestResult({
          status: 'success',
          message: 'Permissions validées ! Lecture, écriture et diffusion en temps réel 100% opérationnelles.',
        });
      } else {
        setTestResult({
          status: 'error',
          message: report.error || 'Permissions insuffisantes. Consultez le rapport de diagnostic ci-dessous.',
        });
      }
    } catch (e: any) {
      setTestResult({
        status: 'error',
        message: `Erreur réseau ou identifiant invalide : ${e?.message || 'Vérifiez l\'URL et la clé anonyme.'}`,
      });
    } finally {
      setIsTestingPermissions(false);
    }
  };

  const handleRunDetailedPermissionsTest = async () => {
    setIsTestingPermissions(true);
    setShowPermissionsPanel(true);
    setPermissionsReport(null);
    setLiveTestSteps([]);

    const cleanUrl = supabaseUrl.trim().replace(/\/+$/, '');
    const cleanKey = supabaseKey.trim();
    const cleanTable = tableName.trim() || 'digital_cards';

    try {
      const report = await runSupabasePermissionsTest(
        { url: cleanUrl, anonKey: cleanKey, tableName: cleanTable },
        (steps) => setLiveTestSteps(steps)
      );
      setPermissionsReport(report);
      if (report.overallSuccess) {
        setTestResult({
          status: 'success',
          message: 'Permissions validées ! Lecture, écriture et diffusion en direct prêtes.',
        });
      } else {
        setTestResult({
          status: 'error',
          message: report.error || 'Permissions insuffisantes. Voir détails ci-dessous.',
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `Erreur inattendue : ${err?.message || 'Échec du test.'}`,
      });
    } finally {
      setIsTestingPermissions(false);
    }
  };

  const handleCopyFixSql = async () => {
    if (permissionsReport?.suggestedSql) {
      try {
        await navigator.clipboard.writeText(permissionsReport.suggestedSql);
        setCopiedFixSql(true);
        setTimeout(() => setCopiedFixSql(false), 2500);
      } catch {
        // ignore
      }
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

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500">
                Laisser vide pour continuer avec Firebase Firestore.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunDetailedPermissionsTest}
                  disabled={isTestingPermissions || !supabaseUrl.trim() || !supabaseKey.trim()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-medium text-[11px] flex items-center gap-1.5 transition-colors border border-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  title="Exécute un test complet : SELECT, INSERT, VERIFY, DELETE et Realtime"
                >
                  {isTestingPermissions ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-teal-400" />
                  )}
                  <span>Test Permissions R/W</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndTest}
                  disabled={isTestingPermissions}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isTestingPermissions ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Tester & Enregistrer</span>
                </button>
              </div>
            </div>

            {/* General status alert banner */}
            {testResult.status !== 'idle' && !showPermissionsPanel && (
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

            {/* Live Read/Write Permissions Test Report Panel */}
            {showPermissionsPanel && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-teal-500/30 space-y-3 animate-in fade-in">
                {/* Header & Quick Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span className="font-semibold text-white text-xs">Rapport Permissions & Temps Réel</span>
                  </div>
                  {permissionsReport && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Testé à {permissionsReport.testedAt}</span>
                    </span>
                  )}
                </div>

                {/* Status Badges Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Lecture (SELECT)</span>
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${
                      permissionsReport?.canRead ? 'text-emerald-400' : isTestingPermissions ? 'text-slate-400' : 'text-rose-400'
                    }`}>
                      {permissionsReport?.canRead ? '✓ Autorisée' : isTestingPermissions ? 'Vérification...' : '✗ Bloquée'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Écriture (UPSERT)</span>
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${
                      permissionsReport?.canWrite ? 'text-emerald-400' : isTestingPermissions ? 'text-slate-400' : 'text-rose-400'
                    }`}>
                      {permissionsReport?.canWrite ? '✓ Autorisée' : isTestingPermissions ? 'Vérification...' : '✗ Bloquée'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Nettoyage (DELETE)</span>
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${
                      permissionsReport?.canDelete ? 'text-emerald-400' : isTestingPermissions ? 'text-slate-400' : 'text-amber-400'
                    }`}>
                      {permissionsReport?.canDelete ? '✓ Propre' : isTestingPermissions ? 'En cours...' : 'Non testé'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Temps Réel (Channel)</span>
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${
                      permissionsReport?.realtimeReady ? 'text-emerald-400' : isTestingPermissions ? 'text-slate-400' : 'text-amber-400'
                    }`}>
                      {permissionsReport?.realtimeReady ? '✓ Connecté' : isTestingPermissions ? 'Connexion...' : 'En attente'}
                    </span>
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-1.5 pt-1">
                  {(liveTestSteps.length > 0 ? liveTestSteps : permissionsReport?.steps || []).map((step) => (
                    <div
                      key={step.id}
                      className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 text-[10px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {step.status === 'running' && <RefreshCw className="w-3.5 h-3.5 text-teal-400 animate-spin shrink-0" />}
                        {step.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {step.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        {step.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        {step.status === 'pending' && <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />}

                        <div className="truncate">
                          <span className="font-medium text-slate-200 block truncate">{step.name}</span>
                          {step.details && (
                            <span className="text-[9px] text-slate-400 truncate block">{step.details}</span>
                          )}
                        </div>
                      </div>

                      {step.durationMs !== undefined && (
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">
                          {step.durationMs} ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Error Diagnostic & One-Click Fix */}
                {permissionsReport && !permissionsReport.overallSuccess && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-rose-200 text-xs">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-semibold text-rose-300">Problème de configuration détecté</p>
                        <p className="text-[11px] text-rose-200/90 leading-relaxed">
                          {permissionsReport.error || 'Les requêtes de lecture ou d\'écriture ont été rejetées.'}
                        </p>
                        {permissionsReport.suggestedFix && (
                          <p className="text-[10px] text-amber-300 font-medium">
                            Solution : {permissionsReport.suggestedFix}
                          </p>
                        )}
                      </div>
                    </div>

                    {permissionsReport.suggestedSql && (
                      <div className="pt-2 border-t border-rose-500/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-300 font-semibold">Script SQL correctif (à exécuter dans Supabase) :</span>
                          <button
                            type="button"
                            onClick={handleCopyFixSql}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-[10px] font-medium transition-colors"
                          >
                            {copiedFixSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedFixSql ? 'SQL copié !' : 'Copier le SQL'}</span>
                          </button>
                        </div>
                        <pre className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[9px] text-slate-300 overflow-x-auto leading-relaxed max-h-36">
                          {permissionsReport.suggestedSql}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Success Banner */}
                {permissionsReport && permissionsReport.overallSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Toutes les permissions de lecture, écriture et diffusion en temps réel sont validées avec succès !</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
