import { useState, useRef, FormEvent, DragEvent, ChangeEvent } from 'react';
import { X, Save, RotateCcw, MapPin, Phone, Mail, Globe, Linkedin, User, Upload, Image as ImageIcon, Trash2, AlertCircle, Lock, ShieldCheck, Film, Play, CheckCircle2, Video, Loader2, Cloud, Copy, Check, ExternalLink, HelpCircle, Code } from 'lucide-react';
import { BusinessCardProfile, ShowcaseVideo } from '../types';
import { KongoLogo } from './KongoLogo';
import { CloudSyncSettings } from './CloudSyncSettings';
import { CloudSyncStatus } from '../services/cloudSync';
import { saveVideoFile } from '../utils/videoStorage';
import { extractVideoMetadata } from '../utils/videoThumbnail';
import { uploadVideoToSupabase, uploadPosterToSupabase, SUPABASE_STORAGE_SQL } from '../utils/supabaseStorage';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessCardProfile;
  onSave: (updated: BusinessCardProfile) => void;
  onReset: () => void;
  onLock?: () => void;
  syncStatus?: CloudSyncStatus | null;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
  onReset,
  onLock,
  syncStatus,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<BusinessCardProfile>({ ...profile });
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [uploadingVideoId, setUploadingVideoId] = useState<string | null>(null);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [videoStorageError, setVideoStorageError] = useState<string | null>(null);
  const [showStorageSql, setShowStorageSql] = useState(false);
  const [copiedStorageSql, setCopiedStorageSql] = useState(false);

  const video1InputRef = useRef<HTMLInputElement>(null);
  const video2InputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const processLogoFile = (file: File) => {
    setLogoError(null);
    if (!file.type.startsWith('image/')) {
      setLogoError('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, logoUrl: dataUrl, emblemUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setImageError(null);
    if (!file.type.startsWith('image/')) {
      setImageError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    if (confirm('Voulez-vous réinitialiser les informations par défaut ?')) {
      onReset();
      onClose();
    }
  };

  const handleCopyStorageSql = () => {
    navigator.clipboard.writeText(SUPABASE_STORAGE_SQL);
    setCopiedStorageSql(true);
    setTimeout(() => setCopiedStorageSql(false), 2500);
  };

  const handleVideoFileSelect = async (videoId: 'video-1' | 'video-2', file: File) => {
    setVideoUploadError(null);
    setVideoStorageError(null);

    if (!file.type.startsWith('video/')) {
      setVideoUploadError('Veuillez sélectionner un fichier vidéo valide (MP4, WebM, MOV).');
      return;
    }

    setUploadingVideoId(videoId);
    setUploadStatusMessage('Analyse des métadonnées vidéo...');

    try {
      // 1. Extract metadata (duration and representative poster frame)
      const { posterUrl, duration } = await extractVideoMetadata(file);

      // 2. Save to local IndexedDB as instant fallback
      const localUrl = await saveVideoFile(videoId, file);

      // 3. Attempt upload to Supabase Storage for universal mobile streaming
      setUploadStatusMessage('Téléversement vers Supabase Cloud (pour visionnage sur smartphone)...');
      const uploadRes = await uploadVideoToSupabase(videoId, file, (p) => {
        if (p.message) setUploadStatusMessage(p.message);
      });

      let finalVideoUrl = localUrl;
      let finalPosterUrl = posterUrl || '';
      let isCloudUploaded = false;

      if (uploadRes.success && uploadRes.url) {
        finalVideoUrl = uploadRes.url;
        isCloudUploaded = true;
        setUploadStatusMessage('Vidéo téléversée avec succès sur le Cloud Supabase !');

        // Also upload poster to cloud if available
        if (posterUrl) {
          const cloudPoster = await uploadPosterToSupabase(videoId, posterUrl);
          if (cloudPoster) finalPosterUrl = cloudPoster;
        }
      } else {
        // Storage upload had an issue (e.g. bucket 'videos' needs creation in dashboard)
        setVideoStorageError(
          uploadRes.error ||
            'La vidéo a été stockée localement. Pour qu\'elle soit visible sur votre smartphone et vos visiteurs, créez le bucket "videos" dans Supabase Storage.'
        );
      }

      setFormData((prev) => {
        const currentVideos = [...(prev.showcaseVideos || [])];
        const existingIndex = currentVideos.findIndex((v) => v.id === videoId);

        const defaultTitle =
          videoId === 'video-1'
            ? 'Terre d\'Avenir : Projet Manzi Camp MAB'
            : file.name.replace(/\.[^/.]+$/, '');

        const updatedVideo: ShowcaseVideo = {
          id: videoId,
          title: existingIndex >= 0 ? currentVideos[existingIndex].title : defaultTitle,
          subtitle: existingIndex >= 0 ? currentVideos[existingIndex].subtitle : 'Production Kongo Digital Wave',
          description:
            existingIndex >= 0
              ? currentVideos[existingIndex].description
              : 'Réalisation audiovisuelle de premier plan par Kongo Digital Wave.',
          client: existingIndex >= 0 ? currentVideos[existingIndex].client : 'Kongo Digital Wave',
          category: existingIndex >= 0 ? currentVideos[existingIndex].category : 'Production Vidéo',
          duration:
            duration && duration !== '00:00'
              ? duration
              : existingIndex >= 0
              ? currentVideos[existingIndex].duration
              : '02:30',
          videoUrl: finalVideoUrl,
          posterUrl: finalPosterUrl || (existingIndex >= 0 ? currentVideos[existingIndex].posterUrl : ''),
        };

        if (existingIndex >= 0) {
          currentVideos[existingIndex] = updatedVideo;
        } else {
          currentVideos.push(updatedVideo);
        }

        return { ...prev, showcaseVideos: currentVideos };
      });
    } catch (err: any) {
      setVideoUploadError(`Erreur lors de l'enregistrement de la vidéo: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setUploadingVideoId(null);
      setTimeout(() => setUploadStatusMessage(null), 3500);
    }
  };

  const handleUpdateVideoField = (
    videoId: 'video-1' | 'video-2',
    field: keyof ShowcaseVideo,
    value: string
  ) => {
    setFormData((prev) => {
      const currentVideos = [...(prev.showcaseVideos || [])];
      const index = currentVideos.findIndex((v) => v.id === videoId);
      if (index >= 0) {
        currentVideos[index] = { ...currentVideos[index], [field]: value };
      } else {
        const newVideo: ShowcaseVideo = {
          id: videoId,
          title: field === 'title' ? value : (videoId === 'video-1' ? 'Terre d\'Avenir : Projet Manzi' : 'Deuxième Réalisation'),
          subtitle: field === 'subtitle' ? value : '',
          description: field === 'description' ? value : '',
          category: field === 'category' ? value : 'Production Vidéo',
          videoUrl: field === 'videoUrl' ? value : '',
          [field]: value,
        };
        currentVideos.push(newVideo);
      }
      return { ...prev, showcaseVideos: currentVideos };
    });
  };

  const handleDeleteVideo = (videoId: 'video-1' | 'video-2') => {
    setFormData((prev) => {
      const currentVideos = (prev.showcaseVideos || []).map((v) => {
        if (v.id === videoId) {
          return {
            ...v,
            videoUrl: '',
            posterUrl: '',
            duration: 'En attente',
          };
        }
        return v;
      });
      return { ...prev, showcaseVideos: currentVideos };
    });
  };

  const video1 = (formData.showcaseVideos || []).find((v) => v.id === 'video-1');
  const video2 = (formData.showcaseVideos || []).find((v) => v.id === 'video-2');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur z-10 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">Personnaliser ma carte</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">Modifier vos coordonnées, portrait et repères GPS</p>
          </div>
          <div className="flex items-center gap-2">
            {onLock && (
              <button
                type="button"
                onClick={onLock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
                title="Verrouiller la session d'administration"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Verrouiller</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Avatar / Portrait Section */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-slate-200 font-semibold flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Photo de profil / Portrait professionnel</span>
              </label>
              {formData.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Supprimer la photo</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-400/80 bg-slate-900 shadow-md flex items-center justify-center">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Aperçu portrait"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-9 h-9 text-slate-600" />
                  )}
                </div>
              </div>

              {/* Upload Dropzone & URL Input */}
              <div className="flex-1 w-full space-y-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    URL directe de l'image (LinkedIn, Cloudinary, site web...)
                  </label>
                  <input
                    type="url"
                    placeholder="https://exemple.com/mon-portrait.jpg"
                    value={formData.avatarUrl || ''}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-2.5 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-slate-300">
                    Glisser une photo ici ou <span className="text-emerald-400 underline font-medium">parcourir</span>
                  </span>
                </div>

                {imageError && (
                  <div className="flex items-center gap-1.5 text-rose-400 text-[11px] bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Logo Officiel Kongo Digital Wave Section */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-slate-200 font-semibold flex items-center gap-1.5">
                <KongoLogo variant="emblem" size="xs" />
                <span>Logo officiel de l'entreprise</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    logoUrl: '/kongo_digital_logo.png',
                    emblemUrl: '/kongo_emblem.png',
                  })
                }
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] transition-colors"
                title="Rétablir le logo officiel original Kongo Digital Wave"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rétablir le logo officiel</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Logo Preview */}
              <div className="relative shrink-0">
                <div className="h-20 w-32 rounded-2xl overflow-hidden border-2 border-emerald-400/80 bg-white shadow-md flex items-center justify-center p-2">
                  <img
                    src={formData.logoUrl || '/kongo_digital_logo.png'}
                    alt="Aperçu logo"
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Upload Dropzone & URL Input for Logo */}
              <div className="flex-1 w-full space-y-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    URL directe du logo (PNG avec fond transparent recommandé)
                  </label>
                  <input
                    type="text"
                    placeholder="/kongo_digital_logo.png ou https://..."
                    value={formData.logoUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        logoUrl: e.target.value,
                        emblemUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsLogoDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsLogoDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsLogoDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      processLogoFile(file);
                    }
                  }}
                  onClick={() => logoInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-2.5 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                    isLogoDragging
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900'
                  }`}
                >
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                  <Upload className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-slate-300">
                    Glisser le logo PNG ici ou <span className="text-emerald-400 underline font-medium">parcourir</span>
                  </span>
                </div>

                {logoError && (
                  <div className="flex items-center gap-1.5 text-rose-400 text-[11px] bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{logoError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Nom complet</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Entreprise / Projet</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Titre / Poste</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Slogan / Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Bio professionnelle</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs resize-none"
            />
          </div>

          {/* Contact details */}
          <div className="border-t border-slate-800/80 pt-3">
            <h4 className="font-semibold text-slate-200 text-xs mb-2.5">Coordonnées de Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">WhatsApp (avec indicatif)</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Online Links */}
          <div className="border-t border-slate-800/80 pt-3">
            <h4 className="font-semibold text-slate-200 text-xs mb-2.5">Liens & Sites</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-slate-400 mb-1">URL Profil LinkedIn</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Site Web Kongo Digital Wave</label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Lien de partage Google Maps</label>
                <input
                  type="url"
                  value={formData.googleMapsShareUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsShareUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* GPS & Location */}
          <div className="border-t border-slate-800/80 pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-200 text-xs">Emplacement & Coordonnées GPS</h4>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          latitude: pos.coords.latitude,
                          longitude: pos.coords.longitude,
                        },
                      });
                    });
                  }
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
              >
                📍 Détecter ma position actuelle
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nom du repère / Bâtiment</label>
                <input
                  type="text"
                  value={formData.location.landmark}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, landmark: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ville</label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, city: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Pays</label>
                <input
                  type="text"
                  value={formData.location.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, country: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Latitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.latitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, latitude: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Longitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.longitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, longitude: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* ================= RÉALISATIONS VIDÉO (2 VIDÉOS) ================= */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-emerald-400" />
                <span>Réalisations Vidéo & Démonstrations (2 Emplacements)</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                Preuves de Production
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Présentez 2 vidéos phares directement sur la carte virtuelle. Vous pouvez importer des fichiers vidéo (MP4, WebM, MOV) depuis votre appareil ou insérer des liens vidéo directs.
            </p>

            {videoUploadError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{videoUploadError}</span>
              </div>
            )}

            {/* Live Upload Progress */}
            {uploadStatusMessage && (
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center gap-2.5 text-xs text-teal-300 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-teal-400 shrink-0" />
                <span className="font-medium">{uploadStatusMessage}</span>
              </div>
            )}

            {/* Storage Advice / Error Banner */}
            {videoStorageError && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-amber-300">Synchronisation Smartphone des Vidéos</p>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      {videoStorageError}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
                  <button
                    type="button"
                    onClick={() => setShowStorageSql(!showStorageSql)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold transition-colors"
                  >
                    <Code className="w-3 h-3" />
                    <span>{showStorageSql ? 'Masquer le script SQL' : 'Activer Supabase Storage (Script SQL)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyStorageSql}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                  >
                    {copiedStorageSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{copiedStorageSql ? 'Script copié !' : 'Copier SQL'}</span>
                  </button>
                </div>

                {showStorageSql && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-1.5 text-[10px] font-mono text-slate-300">
                    <p className="text-slate-400 font-sans">
                      Dans votre console <strong>Supabase &rarr; SQL Editor</strong>, collez ce script pour autoriser l'envoi public :
                    </p>
                    <pre className="overflow-x-auto p-2 bg-black/60 rounded text-emerald-300 select-all">
                      {SUPABASE_STORAGE_SQL}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Video 1 Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-bold text-white">Vidéo #1 (Terre d'Avenir : Projet Manzi)</span>
                </div>
                {video1?.videoUrl ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{video1.videoUrl.startsWith('blob:') ? 'Stockage local (PC)' : 'Synchronisé Smartphone 📱'}</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    Vidéo inactive
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Titre de la vidéo</label>
                  <input
                    type="text"
                    value={video1?.title || ''}
                    onChange={(e) => handleUpdateVideoField('video-1', 'title', e.target.value)}
                    placeholder="Titre de la vidéo"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sous-titre / Thématique</label>
                  <input
                    type="text"
                    value={video1?.subtitle || ''}
                    onChange={(e) => handleUpdateVideoField('video-1', 'subtitle', e.target.value)}
                    placeholder="Sous-titre"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Client / Partenaire</label>
                  <input
                    type="text"
                    value={video1?.client || ''}
                    onChange={(e) => handleUpdateVideoField('video-1', 'client', e.target.value)}
                    placeholder="Ex: MTMA Group x Famille Nama Kiganga"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Catégorie / Format</label>
                  <input
                    type="text"
                    value={video1?.category || ''}
                    onChange={(e) => handleUpdateVideoField('video-1', 'category', e.target.value)}
                    placeholder="Ex: Production Documentaire & Drone 4K"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-xs">Description détaillée</label>
                <textarea
                  rows={2}
                  value={video1?.description || ''}
                  onChange={(e) => handleUpdateVideoField('video-1', 'description', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs resize-none"
                />
              </div>

              {/* Video 1 Source / Upload */}
              <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="file"
                  ref={video1InputRef}
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoFileSelect('video-1', file);
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingVideoId === 'video-1'}
                  onClick={() => video1InputRef.current?.click()}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {uploadingVideoId === 'video-1' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span>Téléversement Cloud en cours...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Téléverser vers Supabase Cloud (MP4, WebM)</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Ou URL directe de la vidéo (MP4, YouTube, Vimeo, Google Drive)</label>
                <input
                  type="text"
                  value={video1?.videoUrl || ''}
                  onChange={(e) => handleUpdateVideoField('video-1', 'videoUrl', e.target.value)}
                  placeholder="/videos/manzi_camp_mab.mp4 ou https://..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500 text-[11px] font-mono"
                />
              </div>
            </div>

            {/* Video 2 Card (User Upload) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-bold text-white">Vidéo #2 (À téléverser par vos soins)</span>
                </div>
                {video2?.videoUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{video2.videoUrl.startsWith('blob:') ? 'Stockage local (PC)' : 'Synchronisé Smartphone 📱'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo('video-2')}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Supprimer cette vidéo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/30 font-medium">
                    En attente de téléversement
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Titre de la vidéo</label>
                  <input
                    type="text"
                    value={video2?.title || ''}
                    onChange={(e) => handleUpdateVideoField('video-2', 'title', e.target.value)}
                    placeholder="Ex: Spot Corporate Entreprise"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sous-titre / Thématique</label>
                  <input
                    type="text"
                    value={video2?.subtitle || ''}
                    onChange={(e) => handleUpdateVideoField('video-2', 'subtitle', e.target.value)}
                    placeholder="Ex: Campagne d'attraction d'investisseurs"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Client / Partenaire</label>
                  <input
                    type="text"
                    value={video2?.client || ''}
                    onChange={(e) => handleUpdateVideoField('video-2', 'client', e.target.value)}
                    placeholder="Ex: Nom de l'entreprise cliente"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Catégorie / Format</label>
                  <input
                    type="text"
                    value={video2?.category || ''}
                    onChange={(e) => handleUpdateVideoField('video-2', 'category', e.target.value)}
                    placeholder="Ex: Vidéo Corporate / Drone / Spot"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-xs">Description</label>
                <textarea
                  rows={2}
                  value={video2?.description || ''}
                  onChange={(e) => handleUpdateVideoField('video-2', 'description', e.target.value)}
                  placeholder="Décrivez brièvement le contexte et le savoir-faire démontré dans cette réalisation..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs resize-none"
                />
              </div>

              {/* Video 2 Source / Upload */}
              <div className="pt-2 border-t border-slate-900 space-y-2">
                <input
                  type="file"
                  ref={video2InputRef}
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoFileSelect('video-2', file);
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingVideoId === 'video-2'}
                  onClick={() => video2InputRef.current?.click()}
                  className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  {uploadingVideoId === 'video-2' ? (
                    <>
                      <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                      <span>Téléversement vers le Cloud Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-teal-400" />
                      <span>
                        {video2?.videoUrl ? 'Remplacer la vidéo via Supabase Cloud' : 'Téléverser vers Supabase Cloud (MP4, WebM)'}
                      </span>
                    </>
                  )}
                </button>

                <div>
                  <label className="block text-slate-500 mb-1 text-[11px]">Ou URL directe / Lien externe (YouTube, Google Drive, Vimeo, MP4 public)</label>
                  <input
                    type="text"
                    value={video2?.videoUrl || ''}
                    onChange={(e) => handleUpdateVideoField('video-2', 'videoUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500 text-[11px] font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Astuce : Un lien YouTube, Vimeo, Google Drive public ou un MP4 hébergé en ligne est immédiatement lisible sur smartphone sans nécessiter de quota de stockage.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cloud Sync & Supabase Backend Section */}
          <CloudSyncSettings syncStatus={syncStatus || undefined} />

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
