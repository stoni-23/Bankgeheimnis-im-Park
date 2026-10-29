/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Lock, User, X, ChevronRight, ThumbsUp,
  Check, LogOut, ShieldCheck, Sparkles, Clock,
  Film, Users, Gamepad2, Trophy, RotateCcw, ExternalLink
} from 'lucide-react';

export type VideoCategory = 'all' | 'oma' | 'opa' | 'bahndidos' | 'blocksberg' | 'kevin' | 'sonst' | 'vip';

interface RealVideo {
  id: string;
  youtubeId?: string;
  src?: string;
  poster?: string;
  title: string;
  duration: string;
  episodeNumber: string;
  category: 'oma' | 'opa' | 'bahndidos' | 'blocksberg' | 'kevin' | 'sonst' | 'vip';
  categoryLabel: string;
  characters: string;
  isVip: boolean;
}

const REAL_VIDEOS: RealVideo[] = [
  {
    id: 'r2-nogo',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bankgeheimnis_no_go_area_fuer_alman_opa.mp4',
    poster: '/assets/posters/no-go-area.jpg?v=frame',
    title: 'Alman Opa: No-Go-Area',
    duration: '01:01 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa',
    isVip: false
  },
  {
    id: 'r2-waschen',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/bankgeheimnis_waschenverbotszone.mp4',
    poster: '/assets/posters/waschenverbotszone.jpg?v=frame',
    title: 'Omma: Punk bei Waschverbotszone',
    duration: '01:01 min',
    episodeNumber: 'Neu',
    category: 'oma',
    categoryLabel: 'Omma Sketche',
    characters: 'Omma',
    isVip: false
  },
  {
    id: 'r2-blitzbirne',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/komissar_blitzbirne.mp4',
    poster: '/assets/posters/komissar-blitzbirne.jpg?v=frame',
    title: 'Omma: Komissar Blitzbirne',
    duration: '00:45 min',
    episodeNumber: 'Neu',
    category: 'oma',
    categoryLabel: 'Omma Sketche',
    characters: 'Komissar Blitzbirne',
    isVip: false
  },
  {
    id: 'r2-gemuese',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/oma_gem%C3%BCse_im_obstladen.mp4',
    poster: '/assets/posters/oma-gemuese.jpg?v=frame',
    title: 'Omma: Gemüse im Obstladen',
    duration: '01:02 min',
    episodeNumber: 'Neu',
    category: 'oma',
    categoryLabel: 'Omma Sketche',
    characters: 'Omma',
    isVip: false
  },
  {
    id: 'r2-nullpunkt',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/oma_punk_nullpunkt.mp4',
    poster: '/assets/posters/oma-punk-nullpunkt.jpg?v=frame',
    title: 'Omma: Punk bei Nullpunkt',
    duration: '00:27 min',
    episodeNumber: 'Neu',
    category: 'oma',
    categoryLabel: 'Omma Sketche',
    characters: 'Omma & Punk',
    isVip: false
  },
  {
    id: 'r2-eco',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/oma_rocker_im_eco_modus.mp4',
    poster: '/assets/posters/oma-rocker-eco.jpg?v=frame',
    title: 'Oma und Rocker im Eco-Modus',
    duration: '01:01 min',
    episodeNumber: 'Neu',
    category: 'bahndidos',
    categoryLabel: 'Bahndidos',
    characters: 'Omma & Bahndidos',
    isVip: false
  },
  {
    id: 'r2-genz',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/opa_genZ_leer.mp4',
    poster: '/assets/posters/opa-genz-leer.jpg?v=frame',
    title: 'Alman Opa: Kevin leer',
    duration: '00:15 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa & Kevin',
    isVip: false
  },
  {
    id: 'r2-shaschlik',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/opa_punk_shaschlik.mp4',
    poster: '/assets/posters/opa-punk-shaschlik.jpg?v=frame',
    title: 'Alman Opa: Punk bei Schaschlik',
    duration: '00:30 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa & Punk',
    isVip: false
  },
  {
    id: 'r2-naegel',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/opa_talahinnen_Plastikn%C3%A4gel_kartell_Full%20HD%201080p_HIGH_FR24.mp4',
    poster: '/assets/posters/opa-talahinnen-naegel.jpg?v=frame',
    title: 'Alman Opa: Chantal bei Plastiknägeln',
    duration: '00:23 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa & Chantal',
    isVip: false
  },
  {
    id: 'r2-ramadan',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/opa_talahons_ramadan_f%C3%BCrs_gehirn.mp4',
    poster: '/assets/posters/opa-talahons-ramadan.jpg?v=frame',
    title: 'Alman Opa: Talahons, Ramadan fürs Gehirn',
    duration: '00:39 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa & Talahons',
    isVip: false
  },
  {
    id: 'r2-bahnhofsklo',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bahnhofsklo_als_meldeadresse_4K_HIGH_FR24.mp4',
    poster: '/assets/posters/bahnhofsklo.jpg?v=frame',
    title: 'Alman Opa: Bahnhofsklo als Meldeadresse',
    duration: '00:24 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa',
    isVip: false
  },
  {
    id: 'r2-hippie',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bankgeheimnis_hippie_hohlkopf.mp4',
    poster: '/assets/posters/hippie-hohlkopf.jpg?v=frame',
    title: 'Alman Opa: Hippie Hohlkopf',
    duration: '00:17 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa & Hippie',
    isVip: false
  },
  {
    id: 'r2-barfuss',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bankgeheimnis_omma_barfu%C3%9F_durchs_waschbecken.mp4',
    poster: '/assets/posters/barfuss-waschbecken.jpg?v=frame',
    title: 'Omma: Barfuß durchs Waschbecken',
    duration: '00:31 min',
    episodeNumber: 'Neu',
    category: 'oma',
    categoryLabel: 'Omma Sketche',
    characters: 'Omma',
    isVip: false
  },
  {
    id: 'r2-fremdsprachen',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Fremdsprachen_akrobatinnen.mp4',
    poster: '/assets/posters/fremdsprachen.jpg?v=frame',
    title: 'Alman Opa: Fremdsprachen-Akrobatinnen',
    duration: '00:21 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa',
    isVip: false
  },
  {
    id: 'r2-oma-weg',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Hilfe%2C%20Oma%20ist%20weg%21%20Rollstuhl-Wahnsinn%20mit%20Lachflash%20Garantie..mp4',
    poster: '/assets/posters/oma-ist-weg.jpg?v=frame',
    title: 'Oma ist weg',
    duration: '02:40 min',
    episodeNumber: 'Neu',
    category: 'sonst',
    categoryLabel: 'Sonstiges',
    characters: 'Rollstuhl',
    isVip: false
  },
  {
    id: 'r2-kappen',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Kappenfraktion_oder_hutb%C3%BCrger.mp4',
    poster: '/assets/posters/kappenfraktion.jpg?v=frame',
    title: 'Alman Opa: Kappenfraktion oder Hutbürger',
    duration: '01:02 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa & Omma',
    isVip: false
  },
  {
    id: 'r2-handtasche',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/No%20Go%20Area%20f%C3%BCr%20wen_%20-%20Oma%20hat%20ne%20andere%20Idee%20in%20der%20Handtasche%20_%20Comedy%20Sketch.mp4',
    poster: '/assets/posters/nogo-handtasche.jpg?v=frame',
    title: 'Omma: No-Go-Area, andere Idee',
    duration: '01:03 min',
    episodeNumber: 'Neu',
    category: 'oma',
    categoryLabel: 'Omma Sketche',
    characters: 'Omma',
    isVip: false
  },
  {
    id: 'r2-parkverbot',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/PARK%20VERBOT%20F%C3%9CR%20ALMANS_%20%F0%9F%9A%AB%20Walla%20Omma%20Teil%203.mp4',
    poster: '/assets/posters/parkverbot-almans.jpg?v=frame',
    title: 'Omma: Parkverbot für Almans',
    duration: '01:15 min',
    episodeNumber: 'Neu',
    category: 'oma',
    categoryLabel: 'Omma Sketche',
    characters: 'Omma',
    isVip: false
  },
  {
    id: 'r2-tram',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Tramdidos.mp4',
    poster: '/assets/posters/tramdidos.jpg?v=frame',
    title: 'Bahndidos: Tramdidos',
    duration: '00:28 min',
    episodeNumber: 'Neu',
    category: 'bahndidos',
    categoryLabel: 'Bahndidos',
    characters: 'Bahndidos',
    isVip: false
  },
  {
    id: 'r2-ubahn',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Ubahndidos.mp4',
    poster: '/assets/posters/ubahndidos.jpg?v=frame',
    title: 'Bahndidos: Ubahndidos',
    duration: '00:29 min',
    episodeNumber: 'Neu',
    category: 'bahndidos',
    categoryLabel: 'Bahndidos',
    characters: 'Bahndidos',
    isVip: false
  },
  {
    id: 'r2-gesagt',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/WAS%20HABEN%20SIE%20GESAGT_%20%F0%9F%98%82%20Die%20frechste%20Oma%20Deutschlands.mp4',
    poster: '/assets/posters/was-haben-sie-gesagt.jpg?v=frame',
    title: 'Omma: Was haben Sie gesagt',
    duration: '02:47 min',
    episodeNumber: 'Neu',
    category: 'oma',
    categoryLabel: 'Omma Sketche',
    characters: 'Omma',
    isVip: false
  },
  {
    id: 'r2-weich',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Weichsp%C3%BCler_auf_lunge.mp4',
    poster: '/assets/posters/weichspueler.jpg?v=frame',
    title: 'Alman Opa: Weichspüler auf Lunge',
    duration: '01:01 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa',
    isVip: false
  },
  {
    id: 'r2-kassa',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/alman-opa-kassa-blanko.mp4',
    poster: '/assets/posters/kassa-blanko.jpg?v=frame',
    title: 'Alman Opa: Kassa blanko',
    duration: '01:02 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa',
    isVip: false
  },
  {
    id: 'r2-kevin-zeugnis',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/bankgeheimnis_kevin_zeugnis.mp4',
    poster: '/assets/posters/kevin-zeugnis.jpg?v=frame',
    title: 'Kevin: Zeugnis',
    duration: '01:03 min',
    episodeNumber: 'Abo',
    category: 'kevin',
    categoryLabel: 'Kevin',
    characters: 'Kevin',
    isVip: true
  },
  {
    id: 'r2-strick-1',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/bankgeheimnis_oma_stricknadel_modifiziert_Full%20HD%201080p_HIGH_FR24.mp4',
    poster: '/assets/posters/stricknadel-1.jpg?v=frame',
    title: 'Omma: Stricknadelkommando Teil 1',
    duration: '00:35 min',
    episodeNumber: 'Neu',
    category: 'oma',
    categoryLabel: 'Omma Sketche',
    characters: 'Omma',
    isVip: false
  },
  {
    id: 'r2-strick-2',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bankgeheimnis_stricknadel_mod_2.mp4',
    poster: '/assets/posters/stricknadel-2.jpg?v=frame2',
    title: 'Omma: Stricknadelkommando Teil 2',
    duration: '00:37 min',
    episodeNumber: 'Neu',
    category: 'oma',
    categoryLabel: 'Omma Sketche',
    characters: 'Omma',
    isVip: false
  },
  {
    id: 'r2-bimmel',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/bimmelbahndidos.mp4',
    poster: '/assets/posters/bimmelbahndidos.jpg?v=frame',
    title: 'Bahndidos: Bimmelbahndidos',
    duration: '00:29 min',
    episodeNumber: 'Neu',
    category: 'bahndidos',
    categoryLabel: 'Bahndidos',
    characters: 'Bahndidos',
    isVip: false
  },
  {
    id: 'r2-blocksberg',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/blocksberg_brigade_strohbesen_battalion.mp4',
    poster: '/assets/posters/blocksberg.jpg?v=frame',
    title: 'Blocksberg Brigade: Strohbesen-Bataillon',
    duration: '01:03 min',
    episodeNumber: 'Neu',
    category: 'blocksberg',
    categoryLabel: 'Blocksberg Brigade',
    characters: 'Blocksberg Brigade',
    isVip: false
  },
  {
    id: 'r2-glocke',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/die-reichszeitglocke.mp4',
    poster: '/assets/posters/reichszeitglocke.jpg?v=frame',
    title: 'Reichszeitglocke',
    duration: '01:33 min',
    episodeNumber: 'Neu',
    category: 'sonst',
    categoryLabel: 'Sonstiges',
    characters: 'Reichszeitglocke',
    isVip: false
  },
  {
    id: 'r2-hauptschule',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/hauptschulabschluss_aus_der_wunderlampe.mp4',
    poster: '/assets/posters/hauptschule.jpg?v=frame',
    title: 'Alman Opa: Hauptschulabschluss aus der Wunderlampe',
    duration: '01:01 min',
    episodeNumber: 'Neu',
    category: 'opa',
    categoryLabel: 'Opa Sketche',
    characters: 'Alman Opa',
    isVip: false
  },
  {
    id: 'r2-kevin-ki',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/kevin_ist_ki_generiert_4K_HIGH_FR24_%281%29.mp4',
    poster: '/assets/posters/kevin-ki.jpg?v=frame',
    title: 'Kevin: ist KI-generiert',
    duration: '01:01 min',
    episodeNumber: 'Neu',
    category: 'kevin',
    categoryLabel: 'Kevin',
    characters: 'Kevin',
    isVip: false
  },
  {
    id: 'r2-bus',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/omma-no-go-area-an-bushaltestelle.mp4',
    poster: '/assets/posters/bushaltestelle.jpg?v=frame',
    title: 'Omma: No-Go-Area an der Bushaltestelle',
    duration: '01:07 min',
    episodeNumber: 'Neu',
    category: 'oma',
    categoryLabel: 'Omma Sketche',
    characters: 'Omma',
    isVip: false
  },
  {
    id: 'r2-flixtrain',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/flixtrain_Angels__4K_HIGH_FR24_%281%29.mp4',
    poster: '/assets/posters/flixtrain-angels.jpg?v=frame',
    title: 'Bahndidos: Flixtrain Angels',
    duration: '00:42 min',
    episodeNumber: 'Neu',
    category: 'bahndidos',
    categoryLabel: 'Bahndidos',
    characters: 'Bahndidos',
    isVip: false
  },
];

// Exakt die Bezeichnungen, die vom Nutzer vorgegeben wurden (keine ausgedachten Namen)
const CHARACTER_NAMES: Record<string, string> = {
  rocker: 'Bahndidos',
  talahon: 'Talahons',
  punk: 'Punks',
  genz: 'Chantal',
  kevin: 'Kevin',
  hippi: 'Hippie',
  omma: 'Omma',
  opa: 'Alman Opa',
  schild: 'Bankgeheimnis im Park'
};

interface LeafParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  wobble: number;
  wobbleSpeed: number;
  color: string;
  opacity: number;
}

const INTRO_SRC = 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Intro-player.mp4';

const LEAF_COLORS = [
  '#2a612b',
  '#3d823f',
  '#4a9b4c',
  '#1d491e',
  '#5ea855',
  '#7fa33b'
];

interface UserAccount {
  name: string;
  email: string;
  isVip: boolean;
  memberSince: string;
}

export default function App() {
  const [animKey, setAnimKey] = useState(1);
  const [activeChar, setActiveChar] = useState<string | null>(null);
  const [activeCharTimeout, setActiveCharTimeout] = useState<NodeJS.Timeout | null>(null);

  // User Account & VIP Storage State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('bankgeheimnis_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [registerForVip, setRegisterForVip] = useState(true);

  // Automatische Bildschirmanpassung (Quer- vs. Hochformat)
  const [isWidescreen, setIsWidescreen] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight * 1.05 : true
  );

  // Video Player State
  const [playingVideo, setPlayingVideo] = useState<RealVideo | null>(null);
  const [filmPhase, setFilmPhase] = useState<'intro' | 'film' | 'ende'>('intro');
  const [introReady, setIntroReady] = useState(false);
  const [tvLogo, setTvLogo] = useState(() =>
    typeof window !== 'undefined' &&
    window.innerWidth >= 1100 &&
    window.innerWidth > window.innerHeight
  );
  const bannerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});

  const videoSectionRef = useRef<HTMLElement>(null);

  const isVipUnlocked = Boolean(currentUser?.isVip);

  useEffect(() => {
    if (!tvLogo) return;
    const timer = window.setTimeout(() => setTvLogo(false), 2400);
    return () => window.clearTimeout(timer);
  }, [tvLogo]);

  useEffect(() => {
    if (!playingVideo?.src) return;
    setFilmPhase('intro');
    setIntroReady(false);
  }, [playingVideo]);

  // Offizielles Parkbank-Duell Browsergame Modal State
  const [isGameOpen, setIsGameOpen] = useState(false);

  // Speichern in localStorage
  const saveUser = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('bankgeheimnis_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bankgeheimnis_user');
    }
  };

  // Bildschirmgröße überwachen
  useEffect(() => {
    const handleResize = () => {
      setIsWidescreen(window.innerWidth > window.innerHeight * 1.05);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Sound-Effekte
  const playSoundEffect = (type: 'shoot' | 'wobble' | 'pop') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'shoot') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.35);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'wobble') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.linearRampToValueAtTime(250, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {
      // Audio autoplay policy
    }
  };

  // Blätter-Partikeleffekt
  const triggerLeafExplosion = useCallback(() => {
    const canvas = bannerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    const originX = width * 0.5;
    const originY = height * 0.65;

    const particles: LeafParticle[] = [];
    const count = 35;

    for (let i = 0; i < count; i++) {
      const angle = Math.PI * (1.1 + Math.random() * 0.8);
      const speed = 4.5 + Math.random() * 9.5;
      particles.push({
        x: originX + (Math.random() - 0.5) * 70,
        y: originY + (Math.random() - 0.5) * 35,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
        vy: Math.sin(angle) * speed - 2.5,
        size: 13 + Math.random() * 17,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.28,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.08 + Math.random() * 0.12,
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        opacity: 1
      });
    }

    let animId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.17;
        p.vx *= 0.985;
        p.rotation += p.vRot;
        p.wobble += p.wobbleSpeed;

        if (elapsed > 0.8) {
          p.opacity -= 0.024;
        }

        if (p.opacity > 0 && p.y < height + 40 && p.x > -50 && p.x < width + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(Math.cos(p.wobble), 1);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;

          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.75, -p.size * 0.4, p.size * 0.7, p.size * 0.65, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.65, -p.size * 0.75, -p.size * 0.4, 0, -p.size);
          ctx.fill();

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.85);
          ctx.lineTo(0, p.size * 0.85);
          ctx.stroke();

          ctx.restore();
        }
      }

      if (alive && elapsed < 3.0) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Animation Start
  useEffect(() => {
    playSoundEffect('shoot');

    const leafTimer = setTimeout(() => {
      triggerLeafExplosion();
      playSoundEffect('wobble');
    }, 340);

    return () => clearTimeout(leafTimer);
  }, [animKey, triggerLeafExplosion]);

  // Klick auf den Charakter -> Wird leicht größer & zeigt NUR die offizielle Bezeichnung
  const handleCharacterClick = (charKey: string) => {
    playSoundEffect('pop');
    setActiveChar(charKey);

    if (activeCharTimeout) clearTimeout(activeCharTimeout);
    const t = setTimeout(() => {
      setActiveChar(null);
    }, 3200);
    setActiveCharTimeout(t);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const scrollToVideos = () => {
    videoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWatchVideo = (vid: RealVideo) => {
    if (vid.isVip && !isVipUnlocked) {
      showToast('🔒 Für VIP-Videos bitte einloggen oder VIP-Abo aktivieren!');
      setIsAuthModalOpen(true);
      return;
    }
    setPlayingVideo(vid);
  };

  const handleLikeVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedVideos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Echter Login / Registrierungs-Handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) {
      showToast('Bitte eine E-Mail-Adresse eingeben!');
      return;
    }

    if (authTab === 'login') {
      const user: UserAccount = {
        name: authEmail.split('@')[0],
        email: authEmail,
        isVip: isVipUnlocked,
        memberSince: '2026'
      };
      saveUser(user);
      showToast(`Erfolgreich angemeldet als ${user.name}`);
    } else {
      const user: UserAccount = {
        name: authName.trim() || authEmail.split('@')[0],
        email: authEmail,
        isVip: registerForVip,
        memberSince: '2026'
      };
      saveUser(user);
      showToast(registerForVip ? 'Konto erstellt & VIP-Abo aktiviert!' : 'Konto erfolgreich erstellt!');
    }

    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    saveUser(null);
    setIsAuthModalOpen(false);
    showToast('Erfolgreich abgemeldet.');
  };

  const clipSeconds = (duration: string) => {
    const [minutes, seconds] = duration.split(' ')[0].split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const byLength = (list: RealVideo[]) =>
    [...list].sort((a, b) => clipSeconds(a.duration) - clipSeconds(b.duration));

  const of = (who: RealVideo['category']) => REAL_VIDEOS.filter((video) => video.category === who);

  const lengthSections = (who: 'oma' | 'opa', label: string) => {
    const list = of(who);
    const kurz = byLength(list.filter((video) => clipSeconds(video.duration) < 60));
    const lang = byLength(list.filter((video) => clipSeconds(video.duration) >= 60));
    const prefix = activeCategory === 'all' ? `${label} · ` : '';
    return [
      kurz.length ? { title: `${prefix}Unter einer Minute`, videos: kurz } : null,
      lang.length ? { title: `${prefix}Über einer Minute`, videos: lang } : null,
    ].filter((section): section is { title: string; videos: RealVideo[] } => section !== null);
  };

  const videoSections =
    activeCategory === 'oma'
      ? lengthSections('oma', 'Omma')
      : activeCategory === 'opa'
        ? lengthSections('opa', 'Opa')
        : activeCategory === 'bahndidos'
          ? [{ title: 'Bahndidos', videos: byLength(of('bahndidos')) }]
          : activeCategory === 'blocksberg'
            ? [{ title: 'Blocksberg Brigade', videos: byLength(of('blocksberg')) }]
            : activeCategory === 'kevin'
              ? [{ title: 'Kevin', videos: byLength(of('kevin')) }]
              : activeCategory === 'sonst'
                ? [{ title: 'Sonstiges', videos: of('sonst') }]
                : activeCategory === 'vip'
                  ? []
                  : [
                      ...lengthSections('oma', 'Omma'),
                      ...lengthSections('opa', 'Opa'),
                      { title: 'Bahndidos', videos: byLength(of('bahndidos')) },
                      { title: 'Blocksberg Brigade', videos: byLength(of('blocksberg')) },
                      { title: 'Kevin', videos: byLength(of('kevin')) },
                      { title: 'Sonstiges', videos: of('sonst') },
                    ].filter((section) => section.videos.length);

  // Render-Funktion für das Namensschild direkt AUF der jeweils angeklickten Figur
  const renderCharBadge = (charKey: string, posClasses: string = "bottom-1 left-1/2 -translate-x-1/2") => {
    if (activeChar !== charKey) return null;
    return (
      <div className={`absolute ${posClasses} z-50 pointer-events-none whitespace-nowrap animate-bounce drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]`}>
        <div className="bg-black/95 text-[#e8b568] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border-2 border-[#c89346] shadow-2xl backdrop-blur-md">
          <span className="font-black text-[10px] sm:text-xs uppercase tracking-wider">
            {CHARACTER_NAMES[charKey]}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen selection:bg-[#743f19] selection:text-white font-sans flex flex-col items-center">
      {tvLogo && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black">
          <img
            src="/assets/logo_gross.webp"
            alt="Bankgeheimnis im Park"
            className="w-[min(42vw,28rem)] h-auto"
          />
        </div>
      )}
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm sm:text-base border-2 border-[#c89346] animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* ============================================================ */}
      {/* HEADER: FESTSTEHEND IN EINER REIHE (KEIN YT ZEICHEN)         */}
      {/* ============================================================ */}
      <header className="w-full max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between z-40 border-b border-neutral-900 bg-black/95 backdrop-blur-md sticky top-0 shrink-0">
        
        {/* Logo und Kanalname nebeneinander in einer Reihe */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
          <img 
            src="/assets/logo_gross.webp" 
            alt="Bankgeheimnis im Park Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-contain border border-[#c89346]/40 shadow shrink-0"
          />
          <span className="font-extrabold text-sm sm:text-lg md:text-xl text-white tracking-tight truncate whitespace-nowrap">
            Bankgeheimnis im Park
          </span>
        </div>

        {/* Rechte Seite: Nur Login/Konto (garantiert ohne YouTube Icon) */}
        <div className="flex items-center shrink-0">
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white text-xs sm:text-sm font-bold border border-[#c89346] shadow cursor-pointer transition-all whitespace-nowrap"
            title={currentUser ? "Mein Konto" : "Anmelden / Registrieren"}
          >
            <User className="w-3.5 h-3.5 text-[#e8b568] shrink-0" />
            {currentUser ? (
              <span className="max-w-[85px] sm:max-w-[130px] truncate">{currentUser.name}</span>
            ) : (
              <span>Anmelden</span>
            )}
            {currentUser?.isVip && (
              <span className="px-1.5 py-0.5 rounded bg-[#c89346] text-black font-black text-[9px] uppercase">
                VIP
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* SEKTION 1: DAS HERO-BANNER                                   */}
      {/* - OHNE INFO-ICONS (i)                                       */}
      {/* - BEIM ANKLICKEN WIRD DIE FIGUR LEICHT GRÖSSER              */}
      {/* - NUR DIE ECHTEN BEZEICHNUNGEN (PUNKS, TALAHONS, BAHNDIDOS) */}
      {/* - TITEL & BUTTON DIREKT IM BILD                             */}
      {/* ============================================================ */}
      <section 
        className="w-full h-[calc(100vh-56px)] max-h-[calc(100vh-56px)] flex items-center justify-center p-2 sm:p-3 relative bg-black overflow-hidden select-none shrink-0"
      >
        
        {/* CONTAINER FÜR DAS BANNER */}
        <div key={animKey} className="w-full h-full max-h-full flex items-center justify-center">

          {isWidescreen ? (
            /* ------------------------------------------------------------ */
            /* A) QUERFORMAT 16:9 BANNER                                    */
            /* - Passt genau in die Höhe (max-h-full) -> KEIN SCROLLEN      */
            /* - Alle 8 Figuren frei sichtbar, werden beim Klick größer     */
            /* - Name erscheint direkt auf der jeweiligen Figur             */
            /* ------------------------------------------------------------ */
            <div 
              onClick={triggerLeafExplosion}
              className="relative aspect-[16/9] h-full max-h-full max-w-full w-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_15px_60px_rgba(0,0,0,0.9)] border-2 border-neutral-800 select-none bg-neutral-950 cursor-pointer mx-auto"
              title="Klicke auf das Banner, um Blätter aufzuwirbeln!"
            >
              {/* 1. HINTERGRUND: Parkhecke */}
              <img 
                src="/assets/banner/banner_bush_bg.jpg" 
                alt="Parkhecke Hintergrund" 
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
              />

              {/* 2. CHARAKTER-FIGUREN (WERDEN BEIM ANKLICKEN LEICHT GRÖSSER & NAME ERSCHEINT DIREKT AUF DER FIGUR) */}
              
              {/* Rocker: Bahndidos (hängt oben zentriert links vom Schild, Schnittkante oben verborgen) */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('rocker'); }}
                className={`absolute top-[-6%] left-[32%] w-[16%] max-w-[170px] z-10 anim-banner-rocker cursor-pointer pointer-events-auto transition-transform duration-300 origin-top ${
                  activeChar === 'rocker' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Bahndidos"
              >
                <img 
                  src="/assets/characters/rocker_crop.webp" 
                  alt="Bahndidos" 
                  className="w-full h-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('rocker', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Murat: Talahons (hängt oben zentriert rechts vom Schild, Schnittkante oben verborgen) */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('talahon'); }}
                className={`absolute top-[-6%] right-[32%] w-[15.5%] max-w-[165px] z-10 anim-banner-talahon cursor-pointer pointer-events-auto transition-transform duration-300 origin-top ${
                  activeChar === 'talahon' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Talahons"
              >
                <img 
                  src="/assets/characters/talahon_crop.webp" 
                  alt="Talahons" 
                  className="w-full h-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('talahon', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Punk: Punks (oben links aus der Hecke) */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('punk'); }}
                className={`absolute left-[-2%] top-[12%] w-[15%] max-w-[160px] z-10 anim-banner-punk cursor-pointer pointer-events-auto transition-transform duration-300 origin-left ${
                  activeChar === 'punk' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Punks"
              >
                <img 
                  src="/assets/characters/punk_crop.webp" 
                  alt="Punks" 
                  className="w-full h-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('punk', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Chantal: Talahinnen (unten links aus der Hecke, unter Punk) */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('genz'); }}
                className={`absolute left-[2%] top-[38%] w-[14.5%] max-w-[155px] z-10 anim-banner-genz cursor-pointer pointer-events-auto transition-transform duration-300 origin-left ${
                  activeChar === 'genz' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Chantal"
              >
                <img 
                  src="/assets/characters/genz_crop.webp" 
                  alt="Chantal" 
                  className="w-full h-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('genz', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Kevin: Gen Z (oben rechts aus der Hecke) */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('kevin'); }}
                className={`absolute right-[-2%] top-[11%] w-[12.5%] max-w-[135px] z-10 anim-banner-kevin cursor-pointer pointer-events-auto transition-transform duration-300 origin-right ${
                  activeChar === 'kevin' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Kevin"
              >
                <img 
                  src="/assets/characters/kevin_crop.webp" 
                  alt="Kevin" 
                  className="w-full h-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('kevin', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Hippie: Hippie (unten rechts aus der Hecke, unter Kevin) */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('hippi'); }}
                className={`absolute right-[3%] top-[36%] w-[14.5%] max-w-[155px] z-10 anim-banner-hippi cursor-pointer pointer-events-auto transition-transform duration-300 origin-right ${
                  activeChar === 'hippi' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Hippie"
              >
                <img 
                  src="/assets/characters/hippi_crop.webp" 
                  alt="Hippie" 
                  className="w-full h-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('hippi', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Oma: Omma */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('omma'); }}
                className={`absolute bottom-[-3%] left-[17%] w-[20%] max-w-[215px] z-15 anim-banner-omma cursor-pointer pointer-events-auto transition-transform duration-300 origin-bottom-left ${
                  activeChar === 'omma' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Omma"
              >
                <img 
                  src="/assets/characters/omma_crop.webp" 
                  alt="Omma" 
                  className="w-full h-auto object-contain drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
                />
                {renderCharBadge('omma', 'top-4 sm:top-6 left-1/2 -translate-x-1/2')}
              </div>

              {/* Opa: Alman Opa */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('opa'); }}
                className={`absolute bottom-[-3%] right-[16%] w-[20%] max-w-[215px] z-15 anim-banner-opa cursor-pointer pointer-events-auto transition-transform duration-300 origin-bottom-right ${
                  activeChar === 'opa' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Alman Opa"
              >
                <img 
                  src="/assets/characters/opa_crop.webp" 
                  alt="Alman Opa" 
                  className="w-full h-auto object-contain drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
                />
                {renderCharBadge('opa', 'top-4 sm:top-6 left-1/2 -translate-x-1/2')}
              </div>

              {/* 3. DAS SCHILD */}
              <div 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  playSoundEffect('wobble'); 
                  triggerLeafExplosion();
                  handleCharacterClick('schild'); 
                }}
                className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-[20%] max-w-[230px] h-[72%] z-15 anim-banner-schild cursor-pointer pointer-events-auto flex items-end justify-center transition-transform duration-300 ${
                  activeChar === 'schild' ? 'scale-105 z-30' : 'hover:scale-[1.02]'
                }`}
                title="Bankgeheimnis im Park Schild"
              >
                <img 
                  src="/assets/characters/schild_crop.webp" 
                  alt="Bankgeheimnis im Park Schild" 
                  className="h-full w-auto object-contain drop-shadow-[0_12px_35px_rgba(0,0,0,0.95)]"
                />
                {renderCharBadge('schild', 'top-[22%] left-1/2 -translate-x-1/2')}
              </div>

              {/* 4. CANVAS PARTIKEL: WEGFLIEGENDE BLÄTTER */}
              <canvas 
                ref={bannerCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-25"
              />

              {/* 5. TITEL & BUTTON: DIREKT IM BANNER ZWISCHEN OMMA UND ALMAN OPA */}
              <div className="absolute bottom-[3%] sm:bottom-[4%] left-0 right-0 z-30 flex flex-col items-center text-center px-2 anim-cta-banner pointer-events-auto">
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)] leading-none select-none">
                  BANKGEHEIMNIS
                </h1>
                <p className="text-[9px] sm:text-xs md:text-sm font-extrabold tracking-[0.25em] text-[#c89346] uppercase mt-0.5 sm:mt-1 mb-1 sm:mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] select-none">
                  COMEDY KANAL
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); scrollToVideos(); }}
                  className="py-1.5 sm:py-2 px-4 sm:px-6 md:px-7 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider border border-[#c89346] shadow-[0_4px_16px_rgba(0,0,0,0.7)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>JETZT ANSCHAUEN</span>
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 fill-white text-white" />
                </button>
              </div>

            </div>
          ) : (
            /* ------------------------------------------------------------ */
            /* B) HOCHFORMAT 9:16 BANNER                                    */
            /* - Köpfe weiter außen (keine Ränder abgeschnitten)           */
            /* - Werden beim Anklicken leicht größer                        */
            /* ------------------------------------------------------------ */
            <div 
              onClick={triggerLeafExplosion}
              className="relative aspect-[9/16] h-full max-h-full max-w-full w-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_15px_60px_rgba(0,0,0,0.9)] border-2 border-neutral-800 select-none bg-neutral-950 cursor-pointer mx-auto"
              title="Klicke auf das Banner, um Blätter aufzuwirbeln!"
            >
              {/* 1. HINTERGRUND: Parkhecke */}
              <img 
                src="/assets/banner/banner_bush_bg.jpg" 
                alt="Parkhecke Hintergrund" 
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
              />

              {/* 2. CHARAKTER-FIGUREN */}
              
              {/* Bahndidos */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('rocker'); }}
                className={`absolute top-[-6%] left-[2%] w-[33%] z-10 anim-banner-rocker cursor-pointer pointer-events-auto transition-transform duration-300 origin-top ${
                  activeChar === 'rocker' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Bahndidos"
              >
                <img 
                  src="/assets/characters/rocker_crop.webp" 
                  alt="Bahndidos" 
                  className="w-full h-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('rocker', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Talahons */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('talahon'); }}
                className={`absolute top-[-6%] right-[2%] w-[30%] z-10 anim-banner-talahon cursor-pointer pointer-events-auto transition-transform duration-300 origin-top ${
                  activeChar === 'talahon' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Talahons"
              >
                <img 
                  src="/assets/characters/talahon_crop.webp" 
                  alt="Talahons" 
                  className="w-full h-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('talahon', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Punks */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('punk'); }}
                className={`absolute left-[-2%] top-[16%] w-[28%] z-10 anim-banner-punk cursor-pointer pointer-events-auto transition-transform duration-300 origin-left ${
                  activeChar === 'punk' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Punks"
              >
                <img 
                  src="/assets/characters/punk_crop.webp" 
                  alt="Punks" 
                  className="w-full h-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('punk', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Talahinnen */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('genz'); }}
                className={`absolute left-[-2%] top-[34%] w-[26%] z-10 anim-banner-genz cursor-pointer pointer-events-auto transition-transform duration-300 origin-left ${
                  activeChar === 'genz' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Chantal"
              >
                <img 
                  src="/assets/characters/genz_crop.webp" 
                  alt="Chantal" 
                  className="w-full h-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('genz', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Gen Z */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('kevin'); }}
                className={`absolute right-[-2%] top-[16%] w-[23%] z-10 anim-banner-kevin cursor-pointer pointer-events-auto transition-transform duration-300 origin-right ${
                  activeChar === 'kevin' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Kevin"
              >
                <img 
                  src="/assets/characters/kevin_crop.webp" 
                  alt="Kevin" 
                  className="w-full h-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('kevin', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Hippie */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('hippi'); }}
                className={`absolute right-[-2%] top-[33%] w-[27%] z-10 anim-banner-hippi cursor-pointer pointer-events-auto transition-transform duration-300 origin-right ${
                  activeChar === 'hippi' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Hippie"
              >
                <img 
                  src="/assets/characters/hippi_crop.webp" 
                  alt="Hippie" 
                  className="w-full h-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
                />
                {renderCharBadge('hippi', 'bottom-0 left-1/2 -translate-x-1/2')}
              </div>

              {/* Omma */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('omma'); }}
                className={`absolute bottom-[-2%] left-0 w-[44%] z-15 anim-banner-omma cursor-pointer pointer-events-auto transition-transform duration-300 origin-bottom-left ${
                  activeChar === 'omma' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Omma"
              >
                <img 
                  src="/assets/characters/omma_crop.webp" 
                  alt="Omma" 
                  className="w-full h-auto object-contain drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
                />
                {renderCharBadge('omma', 'top-4 sm:top-8 left-1/2 -translate-x-1/2')}
              </div>

              {/* Alman Opa */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleCharacterClick('opa'); }}
                className={`absolute bottom-[-2%] right-0 w-[42%] z-15 anim-banner-opa cursor-pointer pointer-events-auto transition-transform duration-300 origin-bottom-right ${
                  activeChar === 'opa' ? 'scale-110 z-30 drop-shadow-[0_0_20px_rgba(200,147,70,0.8)]' : 'hover:scale-105'
                }`}
                title="Alman Opa"
              >
                <img 
                  src="/assets/characters/opa_crop.webp" 
                  alt="Alman Opa" 
                  className="w-full h-auto object-contain drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
                />
                {renderCharBadge('opa', 'top-4 sm:top-8 left-1/2 -translate-x-1/2')}
              </div>

              {/* 3. DAS SCHILD */}
              <div 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  playSoundEffect('wobble'); 
                  triggerLeafExplosion();
                  handleCharacterClick('schild'); 
                }}
                className={`absolute left-1/2 bottom-0 w-[44%] h-[74%] z-15 anim-banner-schild cursor-pointer pointer-events-auto flex items-end justify-center transition-transform duration-300 ${
                  activeChar === 'schild' ? 'scale-105 z-30' : 'hover:scale-[1.02]'
                }`}
                title="Bankgeheimnis im Park Schild"
              >
                <img 
                  src="/assets/characters/schild_crop.webp" 
                  alt="Bankgeheimnis im Park Schild" 
                  className="h-full w-auto object-contain drop-shadow-[0_12px_35px_rgba(0,0,0,0.95)]"
                />
                {renderCharBadge('schild', 'top-[20%] left-1/2 -translate-x-1/2')}
              </div>

              {/* 4. CANVAS PARTIKEL: WEGFLIEGENDE BLÄTTER */}
              <canvas 
                ref={bannerCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-25"
              />

              {/* 5. TITEL & BUTTON: DIREKT IM BANNER UNTER DEM SCHILD ZWISCHEN DEN KÖPFEN */}
              <div className="absolute bottom-[23%] sm:bottom-[24%] left-0 right-0 z-30 flex flex-col items-center text-center px-3 anim-cta-banner pointer-events-auto">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white uppercase drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)] leading-none select-none">
                  BANKGEHEIMNIS
                </h1>
                <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.25em] text-[#c89346] uppercase mt-1 mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] select-none">
                  COMEDY KANAL
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); scrollToVideos(); }}
                  className="w-full max-w-[220px] sm:max-w-[250px] py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-[#c89346] shadow-[0_4px_16px_rgba(0,0,0,0.7)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>JETZT ANSCHAUEN</span>
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                </button>
              </div>

            </div>
          )}

        </div>

      </section>

      {/* ============================================================ */}
      {/* SEKTION 2: ECHTE VIDEOS & SKETCHE                            */}
      {/* ============================================================ */}
      <section 
        ref={videoSectionRef}
        id="video-section"
        className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16 bg-[#050505] border-t border-neutral-900"
      >
        
        {/* Überschrift & Badge */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3a2211]/90 text-[#e8b568] font-bold text-sm uppercase tracking-wider border border-[#7a461e]/70 mb-3">
            <Play className="w-3.5 h-3.5 fill-[#e8b568]" />
            <span>Offizielle Sketche & Episoden</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
            PARKBANK-SKETCHE & HIGHLIGHTS
          </h2>
          
          <p className="mt-3 text-lg sm:text-xl text-neutral-300 font-medium leading-relaxed">
            Echte Comedy von der Parkbank – Wählen Sie eine Folge und schauen Sie direkt im Player los!
          </p>
        </div>

        {/* Kategorie-Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
              activeCategory === 'all' 
                ? 'bg-[#6d3c17] text-white shadow-lg scale-105 border border-[#c89346]' 
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
          >
            Alle Sketche ({REAL_VIDEOS.length})
          </button>

          <button 
            onClick={() => setActiveCategory('oma')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
              activeCategory === 'oma' 
                ? 'bg-[#6d3c17] text-white shadow-lg scale-105 border border-[#c89346]' 
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
          >
            Oma ({REAL_VIDEOS.filter((video) => video.category === 'oma').length})
          </button>

          <button 
            onClick={() => setActiveCategory('opa')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
              activeCategory === 'opa' 
                ? 'bg-[#6d3c17] text-white shadow-lg scale-105 border border-[#c89346]' 
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
          >
            Opa ({REAL_VIDEOS.filter((video) => video.category === 'opa').length})
          </button>

          <button 
            onClick={() => setActiveCategory('bahndidos')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'bahndidos' 
                ? 'bg-[#6d3c17] text-white shadow-lg scale-105 border border-[#c89346]' 
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
          >
            <span>Bahndidos</span>
          </button>

          <button 
            onClick={() => setActiveCategory('blocksberg')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
              activeCategory === 'blocksberg' 
                ? 'bg-[#6d3c17] text-white shadow-lg scale-105 border border-[#c89346]' 
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
          >
            Blocksberg ({REAL_VIDEOS.filter((video) => video.category === 'blocksberg').length})
          </button>

          <button 
            onClick={() => setActiveCategory('kevin')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
              activeCategory === 'kevin' 
                ? 'bg-[#6d3c17] text-white shadow-lg scale-105 border border-[#c89346]' 
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
          >
            Kevin ({REAL_VIDEOS.filter((video) => video.category === 'kevin').length})
          </button>

          <button 
            onClick={() => setActiveCategory('sonst')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
              activeCategory === 'sonst' 
                ? 'bg-[#6d3c17] text-white shadow-lg scale-105 border border-[#c89346]' 
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
          >
            Sonstiges ({REAL_VIDEOS.filter((video) => video.category === 'sonst').length})
          </button>

          <button 
            onClick={() => setActiveCategory('vip')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'vip' 
                ? 'bg-[#c89346] text-black shadow-lg scale-105 font-extrabold' 
                : 'bg-neutral-900 text-[#c89346] hover:bg-neutral-800 border border-[#c89346]/40'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>VIP Special</span>
          </button>
        </div>

        {/* VIDEOLISTE IM RASTER */}
        {activeCategory === 'kevin' && !REAL_VIDEOS.some((video) => video.category === 'kevin') ? (
          /* ============================================================ */
          /* KEVIN STATUS-KARTE: NOCH KEIN VIDEO ONLINE                    */
          /* ============================================================ */
          <div className="max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl bg-neutral-900/90 border-2 border-[#c89346]/60 text-center flex flex-col items-center shadow-2xl">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-black/80 border-2 border-[#c89346] flex items-center justify-center overflow-hidden mb-5 shadow-inner">
              <img 
                src="/assets/characters/kevin_crop.webp" 
                alt="Kevin" 
                className="w-full h-auto object-contain translate-y-3 scale-125" 
              />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-950/80 text-[#e8b568] border border-amber-600/50 text-xs font-black uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Noch kein Video online • In Produktion</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Kevin
            </h3>
            
            <p className="mt-3 text-neutral-300 text-base sm:text-lg max-w-lg leading-relaxed">
              Für <strong>Kevin</strong> gibt es aktuell noch kein fertiges Video online. Die erste Folge befindet sich gerade im Dreh und Schnitt!
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              Die Sketche von <strong>Bahndidos</strong> sowie von <strong>Omma & Opa</strong> kannst du dir bereits jetzt in voller Länge anschauen!
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button 
                onClick={() => setActiveCategory('bahndidos')}
                className="px-5 py-3 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-bold text-sm sm:text-base border border-[#c89346] shadow cursor-pointer transition-all"
              >
                Bahndidos Sketche ansehen (Bereits online)
              </button>
              <button 
                onClick={() => setActiveCategory('oma')}
                className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-sm sm:text-base border border-neutral-700 cursor-pointer transition-all"
              >
                Oma und Opa Sketche ansehen
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {activeCategory === 'vip' && (
              <p className="text-center text-neutral-300 text-lg">Noch keine VIP-Folge.</p>
            )}
            {videoSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 text-xl sm:text-2xl font-black uppercase tracking-wide text-[#e8b568]">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {section.videos.map((vid) => {
              const isLiked = likedVideos[vid.id];

              return (
                <div 
                  key={vid.id}
                  onClick={() => handleWatchVideo(vid)}
                  className="group bg-neutral-900/90 rounded-2xl overflow-hidden border-2 border-neutral-800 hover:border-[#c89346] transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-xl hover:-translate-y-1"
                >
                  {/* Vorschaubild */}
                  <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
                    <img 
                      src={vid.poster ?? `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`} 
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                      loading="lazy"
                    />
                    
                    {/* Play-Icon Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#6d3c17] group-hover:bg-[#7d441a] text-white flex items-center justify-center shadow-2xl border border-[#c89346] transform group-hover:scale-110 transition-transform">
                        {vid.isVip && !isVipUnlocked ? (
                          <Lock className="w-7 h-7 text-[#c89346] fill-[#c89346]" />
                        ) : (
                          <Play className="w-7 h-7 fill-white text-white ml-1" />
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-black/85 backdrop-blur-md text-white font-extrabold text-xs uppercase tracking-wider border border-white/10">
                        {vid.episodeNumber}
                      </span>
                      {vid.isVip && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#c89346] text-black font-black text-xs uppercase flex items-center gap-1 shadow">
                          <Lock className="w-3 h-3" /> VIP
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/85 text-white font-bold text-xs tracking-wide">
                      {vid.duration}
                    </div>
                  </div>

                  {/* Video Info: OHNE SCHEIN-AUFRUFZAHLEN */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-lg sm:text-xl text-white group-hover:text-[#c89346] transition-colors leading-snug line-clamp-2">
                        {vid.title}
                      </h3>
                      
                      {/* Echte Kategorien & Rollen statt erfundener Aufrufzahlen */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#6d3c17]/40 text-[#e8b568] border border-[#c89346]/40 text-xs font-bold">
                          {vid.categoryLabel}
                        </span>
                        <span className="text-xs text-neutral-400 font-medium">
                          Mit: {vid.characters}
                        </span>
                      </div>
                    </div>

                    {/* Klickleiste unten */}
                    <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between">
                      <span className="text-[#c89346] font-bold text-sm sm:text-base flex items-center gap-1.5 group-hover:underline">
                        <span>{vid.isVip && !isVipUnlocked ? 'VIP Freischalten' : 'Jetzt abspielen'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>

                      <button 
                        onClick={(e) => handleLikeVideo(vid.id, e)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isLiked 
                            ? 'bg-[#6d3c17]/40 text-[#c89346]' 
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                        title={isLiked ? "Gefällt mir entfernt" : "Gefällt mir"}
                      >
                        <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-[#c89346]' : ''}`} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
                </div>
              </div>
            ))}

            {activeCategory === 'all' && (
              <div 
                onClick={() => setActiveCategory('kevin')}
                className="bg-neutral-900/50 rounded-2xl p-6 border-2 border-dashed border-neutral-800 hover:border-[#c89346]/70 transition-all flex flex-col justify-between items-center text-center cursor-pointer group shadow-lg"
              >
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-full bg-neutral-950 border border-neutral-700 group-hover:border-[#c89346] transition-colors overflow-hidden mb-3 flex items-center justify-center">
                    <img 
                      src="/assets/characters/kevin_crop.webp" 
                      alt="Kevin" 
                      className="w-full h-auto object-contain translate-y-1.5 scale-125" 
                    />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 text-[#e8b568] border border-amber-600/40 text-[11px] font-black uppercase tracking-wider mb-2">
                    <Clock className="w-3 h-3" />
                    <span>In Produktion</span>
                  </div>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-[#c89346] transition-colors">
                    Kevin
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
                    Für Kevin gibt es noch kein Video online. Die erste Folge ist im Dreh.
                  </p>
                </div>

                <div className="mt-5 w-full pt-3 border-t border-neutral-800/80 flex items-center justify-center text-xs text-[#e8b568] font-bold group-hover:underline">
                  <span>Status zu Kevin ansehen</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* On-Site Parkbank Info-Box (Keine externen YouTube-Verlinkungen) */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#6d3c17]/40 text-[#e8b568] flex items-center justify-center shrink-0 border border-[#c89346]/40">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-bold text-white">
                Direkt hier auf der Parkbank anschauen
              </h4>
              <p className="text-neutral-400 text-base sm:text-lg">
                Neue Sketche & Episoden erscheinen regelmäßig direkt hier auf der offiziellen Seite!
              </p>
            </div>
          </div>

          <button 
            onClick={scrollToVideos}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-black text-base sm:text-lg transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shrink-0 cursor-pointer border border-[#c89346]"
          >
            <span>Jetzt Sketche ansehen</span>
            <ChevronRight className="w-5 h-5 text-[#e8b568]" />
          </button>
        </div>

      </section>

      {/* ============================================================ */}
      {/* SEKTION 3: DAS PORTAL - COMEDY DEUTSCH & PARKBANK-SATIRE     */}
      {/* SEO-OPTIMIERTER INHALT: ELEGANT & INTERAKTIV STRUKTURIERT   */}
      {/* ============================================================ */}
      <section 
        id="portal-info"
        className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-14 sm:py-20 bg-gradient-to-b from-[#050505] via-neutral-950 to-[#000000] border-t border-neutral-900"
      >
        {/* Header mit klarer SEO-Hierarchie */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3a2211]/90 text-[#e8b568] font-bold text-xs sm:text-sm uppercase tracking-wider border border-[#7a461e]/70 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#e8b568]" />
            <span>Offizielles Portal</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-tight">
            Bankgeheimnis im Park
          </h2>
          <p className="text-xl sm:text-2xl font-black text-[#c89346] mt-2">
            Dein Portal für Comedy Deutsch & Parkbank-Satire
          </p>

          <p className="mt-5 text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Vergiss trockene Finanzthemen: Unser Bankgeheimnis findet draußen im Grünen statt! Auf der offiziellen Website von Bankgeheimnis im Park erwartet dich unzensierte Comedy deutsch, bissige Alltagssatire und schwarzer Humor direkt von Deutschlands bekanntester Parkbank.
          </p>
        </div>

        {/* Die Bahndidos & Story Showcase Box */}
        <div className="relative rounded-3xl bg-neutral-900/80 border-2 border-[#c89346]/40 p-6 sm:p-10 mb-12 overflow-hidden shadow-2xl backdrop-blur-sm">
          {/* Story Text */}
          <div className="text-left max-w-4xl">
            <div className="inline-block px-3 py-1 rounded-md bg-[#6d3c17]/60 text-[#e8b568] text-xs font-black uppercase tracking-wider mb-3 border border-[#c89346]/30">
              Echtes Parkbank-Leben
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Die Bahndidos, schräge Vögel und legendäre Parkbank-Geschichten
            </h3>
            <p className="mt-4 text-neutral-300 text-base sm:text-lg leading-relaxed">
              Auf unserer Bank trifft sich das wahre Leben. Wenn die Bahndidos vorfahren, Alman Opa für Recht und Ordnung sorgt oder Omma ihre Sprüche raushaut, bleibt kein Auge trocken. Wir nehmen den Alltag aufs Korn – direkt, ehrlich und garantiert ohne Blatt vor dem Mund.
            </p>

            {/* Schnelle Charakter-Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {['Bahndidos', 'Alman Opa', 'Omma', 'Punks', 'Talahons', 'Kevin', 'Hippie'].map((charName) => (
                <span 
                  key={charName}
                  className="px-3 py-1 rounded-lg bg-black/60 text-neutral-300 border border-neutral-800 text-xs font-bold"
                >
                  #{charName}
                </span>
              ))}
            </div>
          </div>

          {/* Steintor Bild: Ohne extra Kasten, ohne Beschreibung, auf voller Breite im Hauptkasten */}
          <div className="w-full mt-8 sm:mt-10 flex items-center justify-center">
            <img 
              src="/assets/group_frei.webp" 
              alt="Bankgeheimnis im Park Crew am Steineingang und Mauer" 
              className="w-full h-auto object-contain max-h-[540px] drop-shadow-[0_16px_40px_rgba(0,0,0,0.95)]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        {/* 3 Core Highlights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
          
          {/* Card 1: Lustige Videos & Sketche */}
          <div className="p-6 sm:p-7 rounded-2xl bg-neutral-900/90 border-2 border-neutral-800 hover:border-[#c89346] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#6d3c17] text-[#e8b568] flex items-center justify-center mb-5 border border-[#c89346]/40 group-hover:scale-110 transition-transform">
                <Film className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-white uppercase group-hover:text-[#c89346] transition-colors">
                Lustige Videos & Sketche
              </h4>
              <p className="mt-3 text-sm sm:text-base text-neutral-300 leading-relaxed">
                Die besten Clips, Flachwitze und skurrilen Dialoge für deinen täglichen Lachflash.
              </p>
            </div>
            <button 
              onClick={scrollToVideos}
              className="mt-6 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#c89346] hover:text-white transition-colors cursor-pointer"
            >
              <span>Zu den Videos scrollen</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Kult-Charaktere */}
          <div className="p-6 sm:p-7 rounded-2xl bg-neutral-900/90 border-2 border-neutral-800 hover:border-[#c89346] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#6d3c17] text-[#e8b568] flex items-center justify-center mb-5 border border-[#c89346]/40 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-white uppercase group-hover:text-[#c89346] transition-colors">
                Kult-Charaktere
              </h4>
              <p className="mt-3 text-sm sm:text-base text-neutral-300 leading-relaxed">
                Erlebe die Bahndidos und die komplette Park-Crew in ihren neuesten Abenteuern.
              </p>
            </div>
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast('Tippe auf die Köpfe im Banner, um die Charaktere zu erleben!');
              }}
              className="mt-6 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#c89346] hover:text-white transition-colors cursor-pointer"
            >
              <span>Charaktere im Banner ansehen</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Parkbank-Duell (Offizielles Spiel) */}
          <div className="p-6 sm:p-7 rounded-2xl bg-neutral-900/90 border-2 border-neutral-800 hover:border-[#c89346] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#6d3c17] text-[#e8b568] flex items-center justify-center border border-[#c89346]/40 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#6d3c17]/60 text-[#e8b568] text-[11px] font-black uppercase tracking-wider border border-[#c89346]/40">
                  Offizielles Game
                </span>
              </div>

              {/* Cover Art Preview */}
              <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-[#c89346]/30 bg-black shadow-lg">
                <img 
                  src="/assets/parkbank-duell.webp" 
                  alt="Parkbank Duell" 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h4 className="text-xl font-black text-white uppercase group-hover:text-[#c89346] transition-colors">
                Parkbank-Duell
              </h4>
              <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                Zocke unser offizielles Retro-Game direkt hier im Browser – komplett ohne Download am Smartphone oder PC.
              </p>
            </div>
            <button 
              onClick={() => setIsGameOpen(true)}
              className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white text-xs sm:text-sm font-bold border border-[#c89346] shadow transition-transform active:scale-95 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-[#e8b568]" />
              <span>Parkbank-Duell spielen</span>
            </button>
          </div>

        </div>

        {/* Deutscher Humor genau nach deinem Geschmack & CTA */}
        <div className="p-8 sm:p-10 rounded-3xl bg-neutral-950 border-2 border-neutral-800 text-center flex flex-col items-center">
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Deutscher Humor genau nach deinem Geschmack
          </h3>
          <p className="mt-3 text-neutral-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            Egal ob du nach Feierabend einfach abschalten willst oder die neuesten Videos unserer Parkbank-Legenden suchst: Bankgeheimnis im Park liefert dir tägliche Unterhaltung, die sitzt. Schau dir die aktuellen Clips an oder starte direkt eine Runde in unseren Online-Games!
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={scrollToVideos}
              className="px-6 py-3 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-black text-sm sm:text-base border border-[#c89346] shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Zu den aktuellen Clips</span>
            </button>

            <button 
              onClick={() => setIsGameOpen(true)}
              className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[#e8b568] hover:text-white font-bold text-sm sm:text-base border border-neutral-700 hover:border-[#c89346] shadow transition-all cursor-pointer flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Parkbank-Duell spielen (Ohne Download)</span>
            </button>
          </div>
        </div>

      </section>

      {/* ============================================================ */}
      {/* SEKTION 4: VIP ABO & MITGLIEDSCHAFT                          */}
      {/* ============================================================ */}
      <section 
        id="vip-section" 
        className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-12 bg-black border-t border-neutral-900"
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[#c89346] font-extrabold text-sm uppercase tracking-widest">
            Exklusiver Parkbank-Club
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase mt-1">
            VIP-ABO & VORAB-FOLGEN
          </h2>
          <p className="mt-2 text-lg text-neutral-300">
            Unterstützen Sie das Bankgeheimnis-Team und sehen Sie neue Sketche 48 Stunden vor allen anderen!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Basis Fan */}
          <div className="bg-neutral-900 p-6 sm:p-8 rounded-2xl border-2 border-neutral-800 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black text-white">Parkbank-Fan</h3>
              <p className="text-sm text-neutral-400 mt-1">Für treue Zuschauer</p>
              <div className="text-3xl font-black text-white mt-4">Kostenlos</div>
              <ul className="mt-6 space-y-3 text-base text-neutral-300">
                <li className="flex items-center gap-2">
                  <span className="text-[#c89346] font-bold">✓</span> Alle regulären Sketche
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#c89346] font-bold">✓</span> YouTube Kanalzugriff
                </li>
                <li className="flex items-center gap-2 text-neutral-500">
                  <span>✗</span> Keine Vorab-Veröffentlichungen
                </li>
              </ul>
            </div>
            <button 
              onClick={scrollToVideos}
              className="mt-8 w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-lg cursor-pointer transition-colors"
            >
              Kostenlos ansehen
            </button>
          </div>

          {/* VIP Club */}
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 sm:p-8 rounded-2xl border-2 border-[#c89346] shadow-[0_0_40px_rgba(200,147,70,0.15)] flex flex-col justify-between relative">
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#c89346] text-black font-extrabold text-xs uppercase tracking-wider">
              Empfohlen
            </span>
            <div>
              <h3 className="text-2xl font-black text-[#c89346] flex items-center gap-2">
                <Lock className="w-5 h-5" /> VIP Ehren-Rentner
              </h3>
              <p className="text-sm text-neutral-400 mt-1">Exklusiver Vorab-Zugang</p>
              <div className="text-3xl font-black text-white mt-4">
                3,99 € <span className="text-sm font-normal text-neutral-400">/ Monat</span>
              </div>
              <ul className="mt-6 space-y-3 text-base text-neutral-200">
                <li className="flex items-center gap-2">
                  <span className="text-[#c89346] font-bold">✓</span> Alle Folgen 48 Std früher
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#c89346] font-bold">✓</span> Unzensierte Outtakes & Pannen
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#c89346] font-bold">✓</span> Namentliche Nennung im Abspann
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#c89346] font-bold">✓</span> Exklusiver Mitglieds-Rang
                </li>
              </ul>
            </div>
            
            <button 
              onClick={() => {
                if (isVipUnlocked) {
                  showToast('Du bist bereits stolzes VIP-Mitglied!');
                  setIsAuthModalOpen(true);
                } else {
                  setAuthTab('register');
                  setRegisterForVip(true);
                  setIsAuthModalOpen(true);
                }
              }}
              className="mt-8 w-full py-3.5 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-black text-lg transition-transform active:scale-95 shadow-lg border border-[#c89346] cursor-pointer flex items-center justify-center gap-2"
            >
              {isVipUnlocked ? (
                <>
                  <Check className="w-5 h-5 text-[#e8b568]" />
                  <span>VIP Aktiviert (Freigeschaltet)</span>
                </>
              ) : (
                <span>Jetzt VIP werden (3,99 €)</span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-12 px-4 sm:px-6 text-center border-t border-neutral-900 bg-black">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Social Media Kanäle: TT, Insta, FB, YouTube in einer Reihe mit nur Icons und Plattformnamen */}
          <div className="mb-6 flex flex-row items-center justify-center gap-1 sm:gap-2.5 flex-nowrap w-full max-w-full px-1">
            {/* TikTok */}
            <a 
              href="https://www.tiktok.com/@bankgeheimnisimpark" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white hover:text-[#e8b568] border border-neutral-800 hover:border-[#c89346] transition-all text-[11px] sm:text-sm font-bold shadow cursor-pointer group shrink-0"
              title="TikTok"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 fill-white group-hover:fill-[#e8b568] transition-colors" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.86-4.49V8.71a8.16 8.16 0 0 0 4.91 1.45V6.69z"/>
              </svg>
              <span>TikTok</span>
            </a>

            {/* Instagram */}
            <a 
              href="https://www.instagram.com/bankgeheimnisimpark" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white hover:text-[#e8b568] border border-neutral-800 hover:border-[#c89346] transition-all text-[11px] sm:text-sm font-bold shadow cursor-pointer group shrink-0"
              title="Instagram"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 fill-white group-hover:fill-[#e8b568] transition-colors" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>

            {/* Facebook */}
            <a 
              href="https://www.facebook.com/bankgeheimnisimpark" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white hover:text-[#e8b568] border border-neutral-800 hover:border-[#c89346] transition-all text-[11px] sm:text-sm font-bold shadow cursor-pointer group shrink-0"
              title="Facebook"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 fill-white group-hover:fill-[#e8b568] transition-colors" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </a>

            {/* YouTube */}
            <a 
              href="https://www.youtube.com/@bankgeheimnisimpark" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white hover:text-[#e8b568] border border-neutral-800 hover:border-[#c89346] transition-all text-[11px] sm:text-sm font-bold shadow cursor-pointer group shrink-0"
              title="YouTube"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 fill-white group-hover:fill-[#e8b568] transition-colors" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>YouTube</span>
            </a>
          </div>

          <p className="font-medium text-neutral-400 text-xs sm:text-sm">
            © {new Date().getFullYear()} Bankgeheimnis im Park. Alle Rechte vorbehalten.
          </p>
          <p className="text-sm sm:text-base text-[#c89346] font-extrabold mt-2 tracking-wide">
            Comedy, Sketche & Geheimnisse von der wohl berühmtesten Parkbank Deutschlands.
          </p>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* MODAL: OFFIZIELLES BROWSERGAME - PARKBANK-DUELL              */}
      {/* ============================================================ */}
      {isGameOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-5xl h-[92vh] max-h-[92vh] bg-neutral-900 rounded-3xl overflow-hidden border-2 border-[#c89346] shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-950 flex items-center justify-between border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src="/assets/parkbank-duell.webp" 
                  alt="Parkbank Duell" 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-[#c89346] shrink-0 shadow"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide truncate">
                      Parkbank-Duell
                    </h3>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#6d3c17]/70 text-[#e8b568] text-[10px] font-black uppercase border border-[#c89346]/40">
                      Offizielles Game
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">
                    Online im Browser spielen • Ohne Download
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://parkbank-duell.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-neutral-700"
                  title="In separatem Tab / Vollbild öffnen"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#e8b568]" />
                  <span>Vollbild-Tab</span>
                </a>

                <button 
                  onClick={() => setIsGameOpen(false)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Spiel schließen"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Echtes Spiel iFrame: https://parkbank-duell.vercel.app/ */}
            <div className="relative flex-1 w-full bg-black overflow-hidden flex items-center justify-center">
              <iframe
                src="https://parkbank-duell.vercel.app/"
                title="Parkbank-Duell"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full border-0 bg-black"
              ></iframe>
            </div>

            {/* Footer Bar */}
            <div className="px-4 py-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 shrink-0">
              <span className="truncate">
                🎮 Steuerung direkt im Spiel • Kompatibel mit Touch & Maus
              </span>
              <a
                href="https://parkbank-duell.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-[#e8b568] hover:underline font-bold flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Direktlink</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ANMELDUNG & MITGLIEDERKONTO                           */}
      {/* ============================================================ */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-neutral-900 rounded-3xl overflow-hidden border-2 border-[#c89346] shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 bg-neutral-950 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#6d3c17] text-[#e8b568] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  {currentUser ? 'Mein Mitgliedskonto' : 'Parkbank-Mitgliederbereich'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Eingeloggt vs. Nicht eingeloggt */}
            {currentUser ? (
              <div className="p-6 flex flex-col gap-5">
                <div className="p-4 rounded-2xl bg-black border border-neutral-800 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#6d3c17] text-[#e8b568] flex items-center justify-center text-xl font-black border-2 border-[#c89346]">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-lg leading-tight">
                      {currentUser.name}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {currentUser.email}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6d3c17]/60 text-[#e8b568] border border-[#c89346]/40 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{currentUser.isVip ? 'VIP Ehren-Rentner (Aktiv)' : 'Kostenloser Fan'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-sm space-y-2">
                  <div className="flex justify-between text-neutral-300">
                    <span>Mitglied seit:</span>
                    <span className="font-bold text-white">{currentUser.memberSince}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>VIP-Status:</span>
                    <span className={`font-bold ${currentUser.isVip ? 'text-[#e8b568]' : 'text-neutral-400'}`}>
                      {currentUser.isVip ? 'Freigeschaltet (Unbegrenzt)' : 'Nicht abonniert'}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Vorab-Folgen:</span>
                    <span className="font-bold text-green-400">
                      {currentUser.isVip ? 'Verfügbar' : 'Gesperrt'}
                    </span>
                  </div>
                </div>

                {!currentUser.isVip && (
                  <button
                    onClick={() => {
                      const updated = { ...currentUser, isVip: true };
                      saveUser(updated);
                      showToast('🎉 VIP-Abo erfolgreich aktiviert!');
                    }}
                    className="w-full py-3 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-bold text-base border border-[#c89346] shadow cursor-pointer transition-all"
                  >
                    Jetzt auf VIP upgraden (3,99 €/Monat)
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Abmelden</span>
                </button>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-5">
                
                {/* Tabs */}
                <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-sm font-bold">
                  <button 
                    onClick={() => setAuthTab('login')}
                    className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                      authTab === 'login' ? 'bg-[#6d3c17] text-white shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Anmelden
                  </button>
                  <button 
                    onClick={() => setAuthTab('register')}
                    className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                      authTab === 'register' ? 'bg-[#6d3c17] text-white shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Registrieren
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authTab === 'register' && (
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                        Ihr Name
                      </label>
                      <input 
                        type="text" 
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Ihr Name" 
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#c89346]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                      E-Mail-Adresse
                    </label>
                    <input 
                      type="email" 
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@beispiel.de" 
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#c89346]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                      Passwort
                    </label>
                    <input 
                      type="password" 
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#c89346]"
                    />
                  </div>

                  {authTab === 'register' && (
                    <div className="pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-neutral-300 font-medium">
                        <input 
                          type="checkbox"
                          checked={registerForVip}
                          onChange={(e) => setRegisterForVip(e.target.checked)}
                          className="w-4 h-4 accent-[#c89346] rounded"
                        />
                        <span>VIP Ehren-Rentner Abo aktivieren (3,99 €/Monat)</span>
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-bold text-base border border-[#c89346] shadow cursor-pointer transition-transform active:scale-95"
                  >
                    {authTab === 'login' ? 'Jetzt einloggen' : 'Konto erstellen'}
                  </button>
                </form>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIDEO PLAYER THEATER MODAL                                   */}
      {/* ============================================================ */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-4xl bg-neutral-900 rounded-3xl overflow-hidden border-2 border-neutral-700 shadow-2xl flex flex-col max-h-[95vh]">
            
            {/* Modal Kopfzeile */}
            <div className="px-5 py-4 bg-neutral-950 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-md bg-[#6d3c17]/50 text-[#c89346] font-extrabold text-sm uppercase">
                  {playingVideo.episodeNumber}
                </span>
                <span className="text-white font-bold text-base sm:text-lg truncate max-w-md sm:max-w-xl">
                  {playingVideo.title}
                </span>
              </div>
              <button 
                onClick={() => setPlayingVideo(null)}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Video schließen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Echtes iFrame Video Player */}
            <div className="relative aspect-video w-full bg-black">
              {playingVideo.src ? (
                filmPhase === 'ende' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <img
                      src="/assets/logo_gross.webp"
                      alt="Bankgeheimnis im Park"
                      className="w-[38%] max-w-[18rem] h-auto"
                    />
                  </div>
                ) : (
                  <>
                    <video
                      key={filmPhase === 'intro' ? 'intro' : playingVideo.src}
                      src={filmPhase === 'intro' ? INTRO_SRC : playingVideo.src}
                      poster={filmPhase === 'film' ? playingVideo.poster : undefined}
                      controls={filmPhase === 'film'}
                      controlsList="nodownload noplaybackrate"
                      disablePictureInPicture
                      autoPlay
                      playsInline
                      onPlaying={() => {
                        if (filmPhase === 'intro') setIntroReady(true);
                      }}
                      onEnded={() => setFilmPhase(filmPhase === 'intro' ? 'film' : 'ende')}
                      onContextMenu={(event) => event.preventDefault()}
                      className="w-full h-full bg-black"
                    />
                    {filmPhase === 'intro' && !introReady && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                        <img
                          src="/assets/logo_gross.webp"
                          alt=""
                          className="w-[38%] max-w-[18rem] h-auto"
                        />
                      </div>
                    )}
                  </>
                )
              ) : (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playingVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                ></iframe>
              )}
            </div>

            {/* Modal Fußzeile & Interaktion (Keine externen YouTube-Links) */}
            <div className="p-4 sm:p-6 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-white">
                  {playingVideo.title}
                </p>
                <p className="text-sm text-neutral-400">
                  Offizielle Episode von Bankgeheimnis im Park
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button 
                  onClick={() => setPlayingVideo(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-bold text-sm sm:text-base border border-[#c89346] shadow cursor-pointer transition-all"
                >
                  Schließen
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
