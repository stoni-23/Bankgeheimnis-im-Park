/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useId } from 'react';
import {
  X, BarChart3, Users, Film, Download, Upload, Key, 
  Trash2, Plus, Check, Shield, Search, Lock, Unlock,
  Eye, TrendingUp, Sparkles, RefreshCw, AlertTriangle,
  Play, ExternalLink, Calendar, Heart, ShieldAlert,
  Save, ArrowUpDown, Award
} from 'lucide-react';
import { CastId, RealVideo, UserAccount, AdminBackupData } from '../types/admin';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  onUpdateUsers: (users: UserAccount[]) => void;
  customVideos: RealVideo[];
  officialVideos: RealVideo[];
  onAddCustomVideo: (video: RealVideo) => void;
  onDeleteCustomVideo: (videoId: string) => void;
  onToggleVideoVip: (videoId: string) => void;
  videoViews: Record<string, number>;
  onResetVideoViews?: () => void;
  favorites: string[];
  adminPin: string;
  onUpdateAdminPin: (newPin: string) => void;
  onLogoutAdmin: () => void;
  onImportBackup: (backup: AdminBackupData, mode: 'merge' | 'replace') => void;
  showToast: (msg: string) => void;
}

const CAST_OPTIONS: { id: CastId; label: string }[] = [
  { id: 'omma', label: 'Omma' },
  { id: 'opa', label: 'Alman Opa' },
  { id: 'bahndidos', label: 'Bahndidos' },
  { id: 'punk', label: 'Punks' },
  { id: 'talahons', label: 'Talahons' },
  { id: 'talahinnen', label: 'Talahinnen' },
  { id: 'chantal', label: 'Chantal' },
  { id: 'kevin', label: 'Kevin' },
  { id: 'hippie', label: 'Hippie' },
  { id: 'pimpelhuber', label: 'Pimpelhuber' },
  { id: 'blocksberg', label: 'Blocksberg Brigade' },
  { id: 'omaschelle', label: 'Oma Schelle' },
  { id: 'parkbank', label: 'Parkbank' },
  { id: 'rentnerin', label: 'Rasende Rentnerin' },
  { id: 'classic', label: 'Classics' },
  { id: 'gender', label: 'Gender Girls' }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateUsers,
  customVideos,
  officialVideos,
  onAddCustomVideo,
  onDeleteCustomVideo,
  onToggleVideoVip,
  videoViews,
  favorites,
  adminPin,
  onUpdateAdminPin,
  onLogoutAdmin,
  onImportBackup,
  showToast
}) => {
  const jsonUploadId = useId();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'videos' | 'backup'>('overview');
  const [accountsNote, setAccountsNote] = useState('Konten werden geladen.');

  useEffect(() => {
    if (!isOpen) return;
    let cancel = false;
    (async () => {
      try {
        const response = await fetch('/api/admin-nutzer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: adminPin })
        });
        if (!response.ok || cancel) {
          if (!cancel) setAccountsNote('Konten konnten nicht geladen werden.');
          return;
        }
        const data = await response.json();
        if (cancel || !Array.isArray(data.users)) return;
        onUpdateUsers(data.users);
        setAccountsNote('Echte Konten von der Anmeldung.');
      } catch {
        if (!cancel) setAccountsNote('Konten konnten nicht geladen werden.');
      }
    })();
    return () => {
      cancel = true;
    };
  }, [isOpen, adminPin]);

  // Video-Formular State
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('01:00 min');
  const [videoPoster, setVideoPoster] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoCast, setVideoCast] = useState<CastId[]>(['opa']);
  const [videoIsVip, setVideoIsVip] = useState(false);
  const [videoIsExclusive, setVideoIsExclusive] = useState(false);

  // User-Management State
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'vip' | 'free'>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserIsVip, setNewUserIsVip] = useState(false);

  // PIN-Änderung State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  if (!isOpen) return null;

  // Alle Videos kombiniert
  const allVideos = [...customVideos, ...officialVideos];

  // Statistiken berechnen
  const totalUsers = users.length;
  const vipUsersCount = users.filter((u) => u.isVip).length;
  const vipRate = totalUsers > 0 ? Math.round((vipUsersCount / totalUsers) * 100) : 0;
  const totalViews = Object.values(videoViews).reduce((a, b) => a + b, 0);

  // Beliebteste Videos (Top 5)
  const sortedVideosByViews = [...allVideos].sort((a, b) => {
    const viewsA = videoViews[a.id] || 0;
    const viewsB = videoViews[b.id] || 0;
    return viewsB - viewsA;
  });
  const topVideos = sortedVideosByViews.slice(0, 5);

  // Filterung Nutzerliste
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (userFilter === 'vip') return u.isVip;
    if (userFilter === 'free') return !u.isVip;
    return true;
  });

  // Handler: Neues Video erstellen
  const handleCreateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) {
      showToast('Bitte mindestens Titel und Video-URL eingeben!');
      return;
    }

    let youtubeId: string | undefined = undefined;
    let src: string | undefined = undefined;
    let poster = videoPoster.trim();

    // YouTube Erkennung
    const ytMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      youtubeId = ytMatch[1];
      if (!poster) {
        poster = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      }
    } else {
      src = videoUrl.trim();
      if (!poster) {
        poster = '/assets/posters/no-go-area.jpg?v=frame';
      }
    }

    const newVideo: RealVideo = {
      id: `custom-${Date.now()}`,
      title: videoTitle.trim(),
      src,
      youtubeId,
      poster,
      duration: videoDuration.trim() || '01:00 min',
      episodeNumber: '',
      cast: videoCast.length > 0 ? videoCast : ['parkbank'],
      isVip: videoIsVip,
      isExclusive: videoIsExclusive,
      description: videoDescription.trim() || undefined,
      isCustom: true,
      createdAt: new Date().toLocaleDateString('de-DE')
    };

    onAddCustomVideo(newVideo);
    showToast(`✅ Video "${newVideo.title}" erfolgreich hinzugefügt!`);
    
    // Reset Form
    setVideoTitle('');
    setVideoUrl('');
    setVideoPoster('');
    setVideoDescription('');
    setVideoCast(['opa']);
    setVideoIsVip(false);
    setVideoIsExclusive(false);
    setIsAddVideoOpen(false);
  };

  // Handler: Neuen Nutzer manuell anlegen
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) {
      showToast('Bitte eine gültige E-Mail eingeben!');
      return;
    }
    const exists = users.some((u) => u.email.toLowerCase() === newUserEmail.trim().toLowerCase());
    if (exists) {
      showToast('⚠️ Ein Nutzer mit dieser E-Mail existiert bereits!');
      return;
    }

    const newUser: UserAccount = {
      name: newUserName.trim() || newUserEmail.split('@')[0],
      email: newUserEmail.trim().toLowerCase(),
      isVip: newUserIsVip,
      memberSince: new Date().getFullYear().toString(),
      status: 'active'
    };

    onUpdateUsers([newUser, ...users]);
    showToast(`✅ Nutzer ${newUser.name} erfolgreich angelegt!`);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserIsVip(false);
    setIsAddUserOpen(false);
  };

  // Handler: VIP Status eines Nutzers umschalten
  const handleToggleVip = async (email: string) => {
    const user = users.find((entry) => entry.email === email);
    if (!user) return;
    const nextVip = !user.isVip;
    if (user.id) {
      const response = await fetch('/api/admin-nutzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin, action: 'vip', userId: user.id, vip: nextVip })
      });
      if (!response.ok) {
        showToast('Abo konnte nicht gespeichert werden.');
        return;
      }
    }
    const updated = users.map((entry) => (entry.email === email ? { ...entry, isVip: nextVip } : entry));
    onUpdateUsers(updated);
    showToast(nextVip ? `Abo für ${user.name} aktiv` : `${user.name} ist wieder Standard`);
  };

  // Handler: Nutzer-Status umschalten (Aktiv <-> Gesperrt)
  const handleToggleUserStatus = (email: string) => {
    const updated = users.map((u) => {
      if (u.email === email) {
        const nextStatus: 'active' | 'suspended' = u.status === 'suspended' ? 'active' : 'suspended';
        showToast(nextStatus === 'active' ? `Konto ${u.name} entsperrt` : `⚠️ Konto ${u.name} gesperrt`);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  // Handler: Nutzer löschen
  const handleDeleteUser = (email: string, name: string) => {
    if (window.confirm(`Möchtest du den Nutzer "${name}" wirklich unwiderruflich löschen?`)) {
      const updated = users.filter((u) => u.email !== email);
      onUpdateUsers(updated);
      showToast(`Nutzer "${name}" gelöscht.`);
    }
  };

  // Handler: JSON Export herunterladen
  const handleExportBackup = () => {
    const backupData: AdminBackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      users,
      customVideos,
      videoViews,
      favorites,
      adminPin
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('download', `bankgeheimnis_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('💾 Backup-Datei (.json) erfolgreich heruntergeladen!');
  };

  // Handler: JSON Datei importieren
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as AdminBackupData;

        if (!parsed || (!Array.isArray(parsed.users) && !Array.isArray(parsed.customVideos))) {
          throw new Error('Ungültiges Datenformat');
        }

        const mode = window.confirm(
          `Backup gefunden (${parsed.users?.length || 0} Nutzer, ${parsed.customVideos?.length || 0} Videos).\n\n` +
          `Klicke [OK] um mit bestehenden Daten zusammenzuführen (Merge),\n` +
          `oder [Abbrechen] für vollständiges Ersetzen (Replace).`
        ) ? 'merge' : 'replace';

        onImportBackup(parsed, mode);
        showToast('✅ Backup erfolgreich importiert!');
      } catch (err) {
        showToast('❌ Fehler beim Lesen der Backup-Datei! Bitte überprüfe die JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handler: PIN ändern
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPinInput !== adminPin) {
      showToast('❌ Der aktuelle PIN ist nicht korrekt!');
      return;
    }
    if (newPinInput.length < 4) {
      showToast('⚠️ Der neue PIN muss mindestens 4 Zeichen lang sein!');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      showToast('❌ Die neuen PINs stimmen nicht überein!');
      return;
    }

    onUpdateAdminPin(newPinInput);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    showToast('🔑 Admin-PIN erfolgreich geändert!');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-5xl my-auto bg-neutral-950 rounded-2xl sm:rounded-3xl border-2 border-[#c89346] shadow-[0_0_50px_rgba(200,147,70,0.3)] flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* ============================================================ */}
        {/* PANEL HEADER                                                 */}
        {/* ============================================================ */}
        <div className="px-4 sm:px-6 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6d3c17] text-[#e8b568] flex items-center justify-center border border-[#c89346]">
              <Shield className="w-5 h-5 text-[#e8b568]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white tracking-wide">
                  Bankgeheimnis Admin-Panel
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#c89346] text-black font-black text-[10px] uppercase">
                  Chef-Modus
                </span>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">
                Statistiken, Nutzerverwaltung, Abo-Freischaltungen & Videouploads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogoutAdmin}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold border border-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Admin-Sitzung beenden"
            >
              <Lock className="w-3.5 h-3.5 text-[#e8b568]" />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* NAVIGATION TABS                                              */}
        {/* ============================================================ */}
        <div className="flex items-center gap-1 px-4 py-2 bg-neutral-900/60 border-b border-neutral-800 text-xs sm:text-sm font-bold overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#6d3c17] text-white border border-[#c89346] shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#e8b568]" />
            <span>Statistiken & Metriken</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-[#6d3c17] text-white border border-[#c89346] shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Users className="w-4 h-4 text-[#e8b568]" />
            <span>Nutzer & Abos ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'videos'
                ? 'bg-[#6d3c17] text-white border border-[#c89346] shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Film className="w-4 h-4 text-[#e8b568]" />
            <span>Videoverwaltung ({allVideos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-[#6d3c17] text-white border border-[#c89346] shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Download className="w-4 h-4 text-[#e8b568]" />
            <span>Backup & PIN</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* PANEL INHALT                                                 */}
        {/* ============================================================ */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* ---------------------------------------------------------- */}
          {/* TAB 1: STATISTIKEN & METRIKEN                             */}
          {/* ---------------------------------------------------------- */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Metrik-Kacheln */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs font-bold uppercase">Registrierte Nutzer</span>
                    <Users className="w-4 h-4 text-[#e8b568]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{totalUsers}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">{accountsNote}</div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900 border border-[#c89346]/40 shadow-sm">
                  <div className="flex items-center justify-between text-[#e8b568] mb-2">
                    <span className="text-xs font-bold uppercase">VIP-Abos aktiv</span>
                    <Award className="w-4 h-4 text-[#e8b568]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#e8b568]">{vipUsersCount}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">{vipRate}% Conversion-Rate</div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs font-bold uppercase">Gesamt-Aufrufe</span>
                    <Eye className="w-4 h-4 text-[#e8b568]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{totalViews}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Nur auf diesem Gerät gezählt</div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs font-bold uppercase">Verfügbare Clips</span>
                    <Film className="w-4 h-4 text-[#e8b568]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{allVideos.length}</div>
                  <div className="text-[11px] text-[#e8b568] mt-1">{customVideos.length} eigene Videos</div>
                </div>
              </div>

              {/* Top Videos & Performance */}
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#e8b568]" />
                    <h3 className="font-bold text-white text-base">Top 5 Meistgesehene Sketche</h3>
                  </div>
                  <span className="text-xs text-neutral-400">Echtzeit-Tracking</span>
                </div>

                <div className="space-y-3">
                  {topVideos.map((video, idx) => {
                    const views = videoViews[video.id] || 0;
                    const maxViews = Math.max(...Object.values(videoViews), 1);
                    const pct = Math.min(100, Math.round((views / maxViews) * 100));

                    return (
                      <div key={video.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                            idx === 0 ? 'bg-[#c89346] text-black' : 'bg-neutral-800 text-neutral-300'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm truncate">{video.title}</span>
                              {video.isVip && (
                                <span className="px-1.5 py-0.2 rounded bg-[#c89346]/20 text-[#e8b568] border border-[#c89346]/40 text-[9px] font-black uppercase shrink-0">
                                  VIP
                                </span>
                              )}
                              {video.isCustom && (
                                <span className="px-1.5 py-0.2 rounded bg-[#6d3c17]/50 text-[#e8b568] border border-[#c89346]/40 text-[9px] font-bold uppercase shrink-0">
                                  Eigenes Video
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-400">{video.duration}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:w-48 shrink-0">
                          <div className="flex-1 bg-neutral-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#c89346] h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct || 4}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-[#e8b568] w-12 text-right">
                            {views} Views
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Parkbank-Tipp Kachel */}
              <div className="p-4 rounded-2xl bg-[#6d3c17]/20 border border-[#c89346]/40 flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
                <Sparkles className="w-5 h-5 text-[#e8b568] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Konten liegen auf dem Server</span>
                  <span>
                    Standard und Abo kommen aus der Anmeldung, nicht aus einer JSON-Datei. Aufrufe und selbst eingefügte Clips gelten noch nur auf diesem Gerät. Sortierung und neue Clips für alle bleiben im Code, bis dafür eine eigene Liste steht.
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* TAB 2: NUTZER & ABOS                                      */}
          {/* ---------------------------------------------------------- */}
          {activeTab === 'users' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Steuerung & Filterleiste */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Nutzer suchen nach Name oder E-Mail..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-[#c89346]"
                    />
                  </div>

                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#c89346] cursor-pointer"
                  >
                    <option value="all">Alle ({users.length})</option>
                    <option value="vip">Nur VIP ({vipUsersCount})</option>
                    <option value="free">Standard ({totalUsers - vipUsersCount})</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(!isAddUserOpen)}
                  className="px-4 py-2 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-bold text-xs sm:text-sm border border-[#c89346] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Neuen Nutzer anlegen</span>
                </button>
              </div>

              {/* Formular: Neuen Nutzer anlegen */}
              {isAddUserOpen && (
                <form onSubmit={handleCreateUser} className="p-4 rounded-2xl bg-neutral-900 border border-[#c89346] space-y-3 animate-fadeIn">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#e8b568]" />
                    <span>Neues Mitglied manuell freischalten</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="z. B. Alman Werner"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#c89346]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        E-Mail *
                      </label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="werner@parkbank.de"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#c89346]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300 font-medium">
                      <input
                        type="checkbox"
                        checked={newUserIsVip}
                        onChange={(e) => setNewUserIsVip(e.target.checked)}
                        className="w-4 h-4 accent-[#c89346] rounded"
                      />
                      <span>Direkt mit Ehren-Parkausweis (VIP) ausstatten</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddUserOpen(false)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold hover:bg-neutral-700 cursor-pointer"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-[#6d3c17] text-white text-xs font-bold border border-[#c89346] hover:bg-[#7d441a] cursor-pointer"
                      >
                        Konto speichern
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Nutzertabelle */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-neutral-950 text-neutral-400 font-bold border-b border-neutral-800">
                      <tr>
                        <th className="py-3 px-4">Benutzer</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Abo-Stufe</th>
                        <th className="py-3 px-4">Dabei seit</th>
                        <th className="py-3 px-4 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-neutral-500 text-xs">
                            Keine Benutzer gefunden.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.email} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#6d3c17] text-[#e8b568] flex items-center justify-center font-bold text-xs shrink-0 border border-[#c89346]/40">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-white truncate max-w-[140px] sm:max-w-none">
                                    {user.name}
                                  </div>
                                  <div className="text-[11px] text-neutral-400 truncate max-w-[140px] sm:max-w-none">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(user.email)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                                  user.status === 'suspended'
                                    ? 'bg-red-950 text-red-400 border border-red-800 hover:bg-red-900'
                                    : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700'
                                }`}
                                title="Klicken, um Status umzuschalten"
                              >
                                {user.status === 'suspended' ? 'Gesperrt' : 'Aktiv'}
                              </button>
                            </td>

                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleVip(user.email)}
                                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                  user.isVip
                                    ? 'bg-[#6d3c17] text-[#e8b568] border border-[#c89346] shadow-sm hover:bg-[#7d441a]'
                                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-white'
                                }`}
                                title="Klicken, um VIP-Status direkt umzuschalten"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>{user.isVip ? 'Ehren-Parkausweis (VIP)' : 'Standard'}</span>
                              </button>
                            </td>

                            <td className="py-3 px-4 text-neutral-400 text-xs">
                              {user.memberSince || '2026'}
                            </td>

                            <td className="py-3 px-4 text-right">
                              {!user.id && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user.email, user.name)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                                title="Nutzer löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* TAB 3: VIDEOVERWALTUNG (EIGENE VIDEOS EINFÜGEN)            */}
          {/* ---------------------------------------------------------- */}
          {activeTab === 'videos' && (
            <div className="space-y-4 animate-fadeIn">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Videomediathek ({allVideos.length} Clips)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Füge hier eigene Sketche mit Videolink, Rollen & VIP-Status ein.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddVideoOpen(!isAddVideoOpen)}
                  className="px-4 py-2 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-bold text-xs sm:text-sm border border-[#c89346] transition-all cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Neues Video einpflegen</span>
                </button>
              </div>

              {/* Formular: Neues Video */}
              {isAddVideoOpen && (
                <form onSubmit={handleCreateVideo} className="p-5 rounded-2xl bg-neutral-900 border-2 border-[#c89346] space-y-4 animate-fadeIn shadow-xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#e8b568]" />
                      <span>Neues Video anlegen & veröffentlichen</span>
                    </h4>
                    <span className="text-xs text-neutral-400">Direktlink (MP4/WebM) oder YouTube</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Video-Titel *
                      </label>
                      <input
                        type="text"
                        required
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="z. B. Alman Opa: Razzia auf der Parkbank"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#c89346]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Video-URL / Link * (MP4, WebM oder YouTube)
                      </label>
                      <input
                        type="text"
                        required
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://.../video.mp4 oder https://youtu.be/..."
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#c89346]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Clip-Dauer
                      </label>
                      <input
                        type="text"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                        placeholder="01:15 min"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#c89346]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Thumbnail / Poster-URL (optional)
                      </label>
                      <input
                        type="text"
                        value={videoPoster}
                        onChange={(e) => setVideoPoster(e.target.value)}
                        placeholder="https://.../cover.jpg (bei YouTube automatisch)"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#c89346]"
                      />
                    </div>
                  </div>

                  {/* Rollen / Darsteller-Auswahl */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-2">
                      Rollen & Darsteller (für Filter im Hauptbereich)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CAST_OPTIONS.map((c) => {
                        const isSelected = videoCast.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                if (videoCast.length > 1) {
                                  setVideoCast(videoCast.filter((id) => id !== c.id));
                                }
                              } else {
                                setVideoCast([...videoCast, c.id]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#6d3c17] text-white border border-[#c89346]'
                                : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 inline mr-1 text-[#e8b568]" />}
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* VIP-Exklusivität */}
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-xs sm:text-sm block">
                        VIP-Exklusivität (Ehren-Parkausweis)
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Wenn aktiv, können nur zahlende Abonnenten diesen Clip ansehen.
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={videoIsVip}
                      onChange={(e) => setVideoIsVip(e.target.checked)}
                      className="w-5 h-5 accent-[#c89346] rounded cursor-pointer"
                    />
                  </div>

                  {/* Web-Exklusiv (nicht auf Social Media) */}
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-400 text-xs sm:text-sm block flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Web-Exklusiv (Nicht auf Social Media)</span>
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Kennzeichnet den Clip als exklusiven Inhalt, der ausschließlich auf dieser Webseite verfügbar ist.
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={videoIsExclusive}
                      onChange={(e) => setVideoIsExclusive(e.target.checked)}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddVideoOpen(false)}
                      className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold hover:bg-neutral-700 cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white text-xs sm:text-sm font-black uppercase tracking-wider border border-[#c89346] shadow cursor-pointer transition-transform active:scale-95"
                    >
                      Video veröffentlichen
                    </button>
                  </div>
                </form>
              )}

              {/* Liste aller Custom Videos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                  <span>Eigene Uploads ({customVideos.length})</span>
                  <span>Eingepflegte Clips erscheinen sofort in der Mediathek</span>
                </div>

                {customVideos.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-neutral-900 border border-dashed border-neutral-800 text-center">
                    <Film className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-neutral-400">Noch keine eigenen Videos hinzugefügt.</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Klicke oben auf <strong>"Neues Video einpflegen"</strong>, um beliebige MP4- oder YouTube-Links einzufügen!
                    </p>
                  </div>
                ) : (
                  customVideos.map((video) => (
                    <div
                      key={video.id}
                      className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-[#c89346]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {video.poster && (
                          <img
                            src={video.poster}
                            alt={video.title}
                            className="w-16 h-10 object-cover rounded-lg border border-neutral-800 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm truncate">{video.title}</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#6d3c17]/50 text-[#e8b568] border border-[#c89346]/40 text-[9px] font-bold uppercase shrink-0">
                              Eigenes Video
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                            <span>{video.duration}</span>
                            <span>•</span>
                            <span className="truncate">Rollen: {video.cast.join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onToggleVideoVip(video.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            video.isVip
                              ? 'bg-[#6d3c17] text-[#e8b568] border border-[#c89346]'
                              : 'bg-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                          title="VIP-Schutz umschalten"
                        >
                          {video.isVip ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          <span>{video.isVip ? 'VIP-Exklusiv' : 'Kostenlos'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Möchtest du das Video "${video.title}" wirklich löschen?`)) {
                              onDeleteCustomVideo(video.id);
                              showToast(`Video "${video.title}" gelöscht.`);
                            }
                          }}
                          className="p-2 rounded-xl bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 border border-neutral-700 transition-colors cursor-pointer"
                          title="Video löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* TAB 4: BACKUP & EINSTELLUNGEN                              */}
          {/* ---------------------------------------------------------- */}
          {activeTab === 'backup' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Backup Sektion */}
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-[#e8b568]" />
                  <h3 className="font-bold text-white text-base">Daten sichern & wiederherstellen</h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Exportiere deine vollständige Datenbank (Nutzer, VIP-Abos, eingepflegte Videos, Klickzahlen und PIN) als handliche JSON-Datei oder lade eine vorhandene Sicherung hoch.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="p-4 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-bold text-xs sm:text-sm border border-[#c89346] transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                  >
                    <Download className="w-4 h-4 text-[#e8b568]" />
                    <span>JSON-Backup herunterladen</span>
                  </button>

                  <label 
                    htmlFor={jsonUploadId}
                    className="p-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs sm:text-sm border border-neutral-700 transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
                  >
                    <Upload className="w-4 h-4 text-[#e8b568]" />
                    <span>JSON-Backup wiederherstellen</span>
                    <input
                      id={jsonUploadId}
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Admin-PIN ändern */}
              <form onSubmit={handleChangePin} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Key className="w-5 h-5 text-[#e8b568]" />
                  <h3 className="font-bold text-white text-base">Admin-PIN ändern</h3>
                </div>
                <p className="text-xs text-neutral-400">
                  Der PIN schützt dieses Verwaltungsfenster vor unbefugtem Zugriff durch reguläre Besucher.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Aktueller PIN
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#c89346]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Neuer PIN
                    </label>
                    <input
                      type="password"
                      required
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="Mind. 4 Zeichen"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#c89346]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Neuen PIN bestätigen
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#c89346]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white text-xs sm:text-sm font-bold border border-[#c89346] transition-colors cursor-pointer shadow"
                  >
                    PIN speichern
                  </button>
                </div>
              </form>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
