import { useState, useEffect, useRef, FormEvent } from 'react';
import { Lock, Unlock, Eye, EyeOff, X, KeyRound, AlertCircle, CheckCircle2, ShieldCheck, Delete } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CORRECT_PASSWORD = '021185';

export function PasswordModal({ isOpen, onClose, onSuccess }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(null);
      setIsSuccess(false);
      setShowPassword(false);
      // Autofocus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    verifyPassword(password);
  };

  const verifyPassword = (valueToVerify: string) => {
    if (valueToVerify.trim() === CORRECT_PASSWORD) {
      setError(null);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 400);
    } else {
      setError('Mot de passe incorrect. Seul le titulaire est autorisé à modifier cette carte.');
      setIsSuccess(false);
    }
  };

  const handleKeypadPress = (digit: string) => {
    setError(null);
    if (password.length < 12) {
      const next = password + digit;
      setPassword(next);
      if (next.length === CORRECT_PASSWORD.length) {
        verifyPassword(next);
      }
    }
  };

  const handleKeypadBackspace = () => {
    setError(null);
    setPassword((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setError(null);
    setPassword('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute -top-14 -right-14 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-14 -left-14 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Lock Icon */}
        <div className="text-center space-y-3 pt-2 pb-1">
          <div className="relative inline-flex items-center justify-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isSuccess 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 scale-105' 
                : error 
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                : 'bg-slate-800/80 text-emerald-400 border border-slate-700'
            }`}>
              {isSuccess ? (
                <Unlock className="w-7 h-7 animate-bounce" />
              ) : (
                <Lock className="w-7 h-7" />
              )}
            </div>
            <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold tracking-wider uppercase flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>Protégé</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Accès Administrateur
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Veuillez saisir le code d'accès pour modifier les informations de la carte de visite.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="relative">
            <div className="relative flex items-center">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                inputMode="numeric"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Entrez le mot de passe..."
                className={`w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-950/80 border text-center text-base tracking-widest text-white placeholder-slate-600 focus:outline-none transition-all ${
                  error
                    ? 'border-rose-500/70 focus:border-rose-400 bg-rose-500/5'
                    : isSuccess
                    ? 'border-emerald-500/80 focus:border-emerald-400 bg-emerald-500/5'
                    : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-300 p-1 transition-colors"
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error or Success notification */}
            {error && (
              <div className="mt-2.5 flex items-start gap-1.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {isSuccess && (
              <div className="mt-2.5 flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Code vérifié avec succès ! Ouverture...</span>
              </div>
            )}
          </div>

          {/* Touchscreen Keypad (ideal for mobile NFC / rapid entry) */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 active:bg-emerald-500/20 border border-slate-800 text-slate-200 hover:text-white font-semibold text-sm transition-colors"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleKeypadClear}
              className="py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              title="Effacer tout"
            >
              Effacer
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 active:bg-emerald-500/20 border border-slate-800 text-slate-200 hover:text-white font-semibold text-sm transition-colors"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleKeypadBackspace}
              className="py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
              title="Effacer le dernier caractère"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Déverrouiller</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
