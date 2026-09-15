import { useState, useRef, FormEvent, DragEvent, ChangeEvent } from 'react';
import { X, Save, RotateCcw, MapPin, Phone, Mail, Globe, Linkedin, User, Upload, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';
import { BusinessCardProfile } from '../types';
import { KongoLogo } from './KongoLogo';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessCardProfile;
  onSave: (updated: BusinessCardProfile) => void;
  onReset: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
  onReset,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<BusinessCardProfile>({ ...profile });
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur z-10">
          <div>
            <h3 className="font-bold text-lg text-white">Personnaliser ma carte</h3>
            <p className="text-xs text-slate-400">Modifier vos coordonnées, portrait et repères GPS</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
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
