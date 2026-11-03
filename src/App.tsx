/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Lock, User, X, ChevronRight, ChevronDown, Filter, ThumbsUp,
  Check, LogOut, ShieldCheck, Sparkles, Shield, Share2,
  Film, Users, Gamepad2, Trophy, RotateCcw, RotateCw, ExternalLink, Gift, Copy, Eye,
  Ticket, Award, Heart, Tv, Maximize2, Minimize2, ChevronLeft, SkipForward
} from 'lucide-react';
import { AdminPanel } from './components/AdminPanel';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ShareModal } from './components/ShareModal';
import { AdminBackupData } from './types/admin';
import { supabase } from './lib/supabase';
import type { User as AuthUser } from '@supabase/supabase-js';

export type CastId =
  | 'omma'
  | 'opa'
  | 'bahndidos'
  | 'punk'
  | 'talahons'
  | 'talahinnen'
  | 'chantal'
  | 'kevin'
  | 'hippie'
  | 'pimpelhuber'
  | 'blocksberg'
  | 'omaschelle'
  | 'parkbank'
  | 'rentnerin'
  | 'classic'
  | 'gender';

interface RealVideo {
  id: string;
  youtubeId?: string;
  src?: string;
  poster?: string;
  title: string;
  duration: string;
  episodeNumber: string;
  cast: CastId[];
  isVip: boolean;
  isExclusive?: boolean;
  description?: string;
  isCustom?: boolean;
  createdAt?: string;
}

const getVideoDescription = (vid: RealVideo): string => {
  if (vid.description) return vid.description;
  if (vid.cast.includes('opa') && vid.cast.includes('talahinnen')) {
    return 'Alman Opa gerät mitten im Park an die stylischen Talahinnen – ein schonungsloser Generationen-Clash mit purer Lachgarantie!';
  }
  if (vid.cast.includes('opa') && vid.cast.includes('punk')) {
    return 'Recht, Ordnung und Mülltrennung treffen auf rebellischen Parkbank-Geist. Wenn Alman Opa auf Punks trifft, fliegen verbale Fetzen!';
  }
  if (vid.cast.includes('omma') && vid.cast.includes('talahons')) {
    return 'Omma lässt sich auf ihrer Parkbank von niemandem die Butter vom Brot nehmen – die Talahons lernen Respekt auf die humorvolle Art!';
  }
  if (vid.cast.includes('bahndidos')) {
    return 'Die legendären Bahndidos rollen an: Knallharte Parkbank-Philosophie und schräge Anekdoten zwischen Schiene und Park!';
  }
  if (vid.cast.includes('chantal') || vid.cast.includes('kevin')) {
    return 'Generation Z im echten Park-Leben: Zwischen Smartphone, Schule und schrägen Ausreden bleibt garantiert kein Auge trocken!';
  }
  if (vid.cast.includes('omma')) {
    return 'Omma teilt wieder gnadenlos aus! Bissige Alltagsbeobachtungen und unzensierter Humor direkt von der Parkbank.';
  }
  if (vid.cast.includes('opa')) {
    return 'Alman Opa sorgt für deutsche Gründlichkeit im Park. Ein satirisches Meisterwerk über Vorschriften, Hüte und gesunden Menschenverstand.';
  }
  return 'Unzensierte Comedy und bissige Parkbank-Satire – das Original von Bankgeheimnis im Park.';
};

const REAL_VIDEOS: RealVideo[] = [
  {
    id: 'r2-altglas',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Omma_reif_fuers_altglas_Full%20HD%201080p_MEDIUM_FR24.mp4',
    poster: '/assets/posters/altglas.jpg?v=frame',
    title: 'Omma: reif fürs Altglas',
    duration: '01:02 min',
    episodeNumber: '',
    cast: ['omma'],
    isVip: true
  },
  {
    id: 'r2-gelber-sack',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/opa_punk_verbrennungsanlage_HD_720p.mp4',
    poster: '/assets/posters/gelber-sack.jpg?v=frame',
    title: 'Alman Opa: Container oder Gelber Sack',
    duration: '00:24 min',
    episodeNumber: '',
    cast: ['opa', 'punk'],
    isVip: true
  },
  {
    id: 'r2-alltag-neu',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/ES%20REICHT%21%20Opa%20rechnet%20mit%20der%20%E2%80%9EGeneration%20Spachtelmasse%E2%80%9C%20ab%21.mp4',
    poster: '/assets/posters/park-alltag-neu3.jpg?v=frame',
    title: 'Park Alltag Teil 3',
    duration: '02:31 min',
    episodeNumber: '',
    cast: ['parkbank'],
    isVip: true
  },
  {
    id: 'r2-schelle-bohne',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Unterwegs%20mit%20Oma%20Schelle_%20Eskalation%20im%20Caf%C3%A9%20Rote%20Bohne%21%20%F0%9F%AB%98.mp4',
    poster: '/assets/posters/oma-schelle-rote-bohne.jpg?v=frame',
    title: 'Oma Schelle: Eskalation im Café Rote Bohne',
    duration: '02:56 min',
    episodeNumber: '',
    cast: ['omaschelle', 'bahndidos', 'hippie'],
    isVip: true
  },
  {
    id: 'r2-berg-runter',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/alman_opa_rollt_den_berg_runter.mp4',
    poster: '/assets/posters/berg-runter.jpg?v=frame',
    title: 'Alman Opa: rollt den Berg runter',
    duration: '00:15 min',
    episodeNumber: '',
    cast: ['opa', 'gender'],
    isVip: true
  },
  {
    id: 'r2-vollgas',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/24_stunden_vollgas.mp4',
    poster: '/assets/posters/vollgas.jpg?v=frame',
    title: '24 Stunden Vollgas',
    duration: '03:00 min',
    episodeNumber: '',
    cast: ['omaschelle', 'punk', 'rentnerin'],
    isVip: true
  },
  {
    id: 'r2-protein',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/alman_opa_protein_fuers_gehirn.mp4',
    poster: '/assets/posters/protein-gehirn.jpg?v=frame',
    title: 'Alman Opa: Protein fürs Gehirn',
    duration: '00:21 min',
    episodeNumber: '',
    cast: ['opa'],
    isVip: true
  },
  {
    id: 'r2-classic-1',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/parkbank_classics1.mp4',
    poster: '/assets/posters/classic-1.jpg?v=frame',
    title: 'Parkbank Classics 1',
    duration: '00:15 min',
    episodeNumber: '',
    cast: ['classic'],
    isVip: true
  },
  {
    id: 'r2-classic-2',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/parkbank_classics2.mp4',
    poster: '/assets/posters/classic-2.jpg?v=frame',
    title: 'Parkbank Classics 2',
    duration: '00:18 min',
    episodeNumber: '',
    cast: ['classic'],
    isVip: true
  },
  {
    id: 'r2-classic-3',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/parkbank_classics3.mp4',
    poster: '/assets/posters/classic-3.jpg?v=frame',
    title: 'Parkbank Classics 3',
    duration: '00:21 min',
    episodeNumber: '',
    cast: ['classic'],
    isVip: true
  },
  {
    id: 'r2-classic-4',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/parkbank_classics4.mp4',
    poster: '/assets/posters/classic-4.jpg?v=frame',
    title: 'Parkbank Classics 4',
    duration: '00:13 min',
    episodeNumber: '',
    cast: ['classic'],
    isVip: true
  },
  {
    id: 'r2-classic-5',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/parkbank_classics5.mp4',
    poster: '/assets/posters/classic-5.jpg?v=frame',
    title: 'Parkbank Classics 5',
    duration: '00:19 min',
    episodeNumber: '',
    cast: ['classic'],
    isVip: true
  },
  {
    id: 'r2-classic-6',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/parkbank_classics6.mp4',
    poster: '/assets/posters/classic-6.jpg?v=frame',
    title: 'Parkbank Classics 6',
    duration: '00:16 min',
    episodeNumber: '',
    cast: ['classic'],
    isVip: true
  },
  {
    id: 'r2-classic-7',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/parkbank_classics7.mp4',
    poster: '/assets/posters/classic-7.jpg?v=frame',
    title: 'Parkbank Classics 7',
    duration: '00:14 min',
    episodeNumber: '',
    cast: ['classic'],
    isVip: true
  },
  {
    id: 'r2-classic-8',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/parkbank_classics8.mp4',
    poster: '/assets/posters/classic-8.jpg?v=frame',
    title: 'Parkbank Classics 8',
    duration: '00:15 min',
    episodeNumber: '',
    cast: ['classic'],
    isVip: true
  },
  {
    id: 'r2-classic-9',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/parkbank_classics9.mp4',
    poster: '/assets/posters/classic-9.jpg?v=frame',
    title: 'Parkbank Classics 9',
    duration: '00:21 min',
    episodeNumber: '',
    cast: ['classic'],
    isVip: true
  },
  {
    id: 'r2-classic-10',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/parkbank_classics10.mp4',
    poster: '/assets/posters/classic-10.jpg?v=frame',
    title: 'Parkbank Classics 10',
    duration: '00:18 min',
    episodeNumber: '',
    cast: ['classic'],
    isVip: true
  },
  {
    id: 'r2-classic-11',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/parkbank_classics11.mp4',
    poster: '/assets/posters/classic-11.jpg?v=frame',
    title: 'Parkbank Classics 11',
    duration: '00:27 min',
    episodeNumber: '',
    cast: ['classic'],
    isVip: true
  },
  {
    id: 'r2-plan',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/alman_opa_Ihr_plan_ist_aufgeflogen.mp4',
    poster: '/assets/posters/plan-aufgeflogen.jpg?v=frame',
    title: 'Alman Opa: Ihr Plan ist aufgeflogen',
    duration: '01:09 min',
    episodeNumber: '',
    cast: ['opa'],
    isVip: true
  },
  {
    id: 'r2-halal',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Alman_opa_halal_in_der_birne_Full%20HD%201080p_MEDIUM_FR24.mp4',
    poster: '/assets/posters/halal-birne.jpg?v=frame',
    title: 'Alman Opa: Halal in der Birne',
    duration: '01:03 min',
    episodeNumber: '',
    cast: ['opa', 'talahinnen'],
    isVip: true
  },
  {
    id: 'r2-ramadan',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/alman_opa_keine_almans_an_ramadan_Full%20HD%201080p_MEDIUM_FR24.mp4',
    poster: '/assets/posters/ramadan.jpg?v=frame',
    title: 'Alman Opa: Keine Almans an Ramadan',
    duration: '01:08 min',
    episodeNumber: '',
    cast: ['opa', 'talahons'],
    isVip: true
  },
  {
    id: 'r2-oregano',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/hippie_omma_nur_oregano.mp4',
    poster: '/assets/posters/oregano.jpg?v=frame',
    title: 'Oregano, ich schwör!',
    duration: '02:15 min',
    episodeNumber: '',
    cast: ['hippie', 'omma'],
    isVip: true
  },
  {
    id: 'r2-dunkelkammer',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/oma_schelle_dunkelkammer.mp4',
    poster: '/assets/posters/dunkelkammer.jpg?v=frame',
    title: 'Oma Schelle: Dunkelkammer Deko',
    duration: '00:25 min',
    episodeNumber: '',
    cast: ['omaschelle'],
    isVip: true
  },
  {
    id: 'r2-nogo',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bankgeheimnis_no_go_area_fuer_alman_opa.mp4',
    poster: '/assets/posters/no-go-area.jpg?v=frame',
    title: 'Alman Opa: No-Go-Area',
    duration: '01:01 min',
    episodeNumber: '',
    cast: ['opa', 'talahinnen'],
    isVip: false
  },
  {
    id: 'r2-waschen',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/bankgeheimnis_waschenverbotszone.mp4',
    poster: '/assets/posters/waschenverbotszone.jpg?v=frame',
    title: 'Omma: Punk bei Waschverbotszone',
    duration: '01:01 min',
    episodeNumber: '',
    cast: ['omma', 'punk'],
    isVip: false
  },
  {
    id: 'r2-blitzbirne',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/komissar_blitzbirne.mp4',
    poster: '/assets/posters/komissar-blitzbirne.jpg?v=frame',
    title: 'Omma: Komissar Blitzbirne',
    duration: '00:45 min',
    episodeNumber: '',
    cast: ['omma'],
    isVip: true
  },
  {
    id: 'r2-gemuese',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/oma_gem%C3%BCse_im_obstladen.mp4',
    poster: '/assets/posters/oma-gemuese.jpg?v=frame',
    title: 'Omma: Gemüse im Obstladen',
    duration: '01:02 min',
    episodeNumber: '',
    cast: ['omma', 'chantal'],
    isVip: false
  },
  {
    id: 'r2-nullpunkt',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/oma_punk_nullpunkt.mp4',
    poster: '/assets/posters/oma-punk-nullpunkt.jpg?v=frame',
    title: 'Omma: Punk bei Nullpunkt',
    duration: '00:27 min',
    episodeNumber: '',
    cast: ['omma', 'punk'],
    isVip: true
  },
  {
    id: 'r2-eco',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/oma_rocker_im_eco_modus.mp4',
    poster: '/assets/posters/oma-rocker-eco.jpg?v=frame',
    title: 'Oma und Rocker im Eco-Modus',
    duration: '01:01 min',
    episodeNumber: '',
    cast: ['bahndidos', 'omma'],
    isVip: true
  },
  {
    id: 'r2-genz',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/opa_genZ_leer.mp4',
    poster: '/assets/posters/opa-genz-leer.jpg?v=frame',
    title: 'Alman Opa: Chantal, leer',
    duration: '00:15 min',
    episodeNumber: '',
    cast: ['opa', 'chantal'],
    isVip: true
  },
  {
    id: 'r2-shaschlik',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/opa_punk_shaschlik.mp4',
    poster: '/assets/posters/opa-punk-shaschlik.jpg?v=frame',
    title: 'Alman Opa: Punk bei Schaschlik',
    duration: '00:30 min',
    episodeNumber: '',
    cast: ['opa', 'punk'],
    isVip: true
  },
  {
    id: 'r2-naegel',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/opa_talahinnen_Plastikn%C3%A4gel_kartell_Full%20HD%201080p_HIGH_FR24.mp4',
    poster: '/assets/posters/opa-talahinnen-naegel.jpg?v=frame',
    title: 'Alman Opa: Plastiknägeln Kartell',
    duration: '00:23 min',
    episodeNumber: '',
    cast: ['opa', 'talahinnen'],
    isVip: true
  },
  {
    id: 'r2-ramadan-gehirn',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/opa_talahons_ramadan_f%C3%BCrs_gehirn.mp4',
    poster: '/assets/posters/opa-talahons-ramadan.jpg?v=frame',
    title: 'Alman Opa: Talahons, Ramadan fürs Gehirn',
    duration: '00:39 min',
    episodeNumber: '',
    cast: ['opa', 'talahons'],
    isVip: true
  },
  {
    id: 'r2-bahnhofsklo',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bahnhofsklo_als_meldeadresse_4K_HIGH_FR24.mp4',
    poster: '/assets/posters/bahnhofsklo.jpg?v=frame',
    title: 'Alman Opa: Bahnhofsklo als Meldeadresse',
    duration: '00:24 min',
    episodeNumber: '',
    cast: ['opa', 'punk'],
    isVip: true
  },
  {
    id: 'r2-hippie',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bankgeheimnis_hippie_hohlkopf.mp4',
    poster: '/assets/posters/hippie-hohlkopf.jpg?v=frame',
    title: 'Alman Opa: Hippie Hohlkopf',
    duration: '00:17 min',
    episodeNumber: '',
    cast: ['opa', 'hippie'],
    isVip: true
  },
  {
    id: 'r2-barfuss',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bankgeheimnis_omma_barfu%C3%9F_durchs_waschbecken.mp4',
    poster: '/assets/posters/barfuss-waschbecken.jpg?v=frame',
    title: 'Omma: Barfuß durchs Waschbecken',
    duration: '00:31 min',
    episodeNumber: '',
    cast: ['omma'],
    isVip: true
  },
  {
    id: 'r2-fremdsprachen',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Fremdsprachen_akrobatinnen.mp4',
    poster: '/assets/posters/fremdsprachen.jpg?v=frame',
    title: 'Alman Opa: Fremdsprachen-Akrobatinnen',
    duration: '00:21 min',
    episodeNumber: '',
    cast: ['opa', 'gender'],
    isVip: true
  },
  {
    id: 'r2-oma-weg',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Hilfe%2C%20Oma%20ist%20weg%21%20Rollstuhl-Wahnsinn%20mit%20Lachflash%20Garantie..mp4',
    poster: '/assets/posters/oma-ist-weg.jpg?v=frame',
    title: 'Oma ist weg',
    duration: '02:40 min',
    episodeNumber: '',
    cast: ['chantal', 'bahndidos', 'hippie', 'rentnerin'],
    isVip: false
  },
  {
    id: 'r2-kappen',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Kappenfraktion_oder_hutb%C3%BCrger.mp4',
    poster: '/assets/posters/kappenfraktion.jpg?v=frame',
    title: 'Alman Opa: Kappenfraktion oder Hutbürger',
    duration: '01:02 min',
    episodeNumber: '',
    cast: ['opa'],
    isVip: true
  },
  {
    id: 'r2-handtasche',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/No%20Go%20Area%20f%C3%BCr%20wen_%20-%20Oma%20hat%20ne%20andere%20Idee%20in%20der%20Handtasche%20_%20Comedy%20Sketch.mp4',
    poster: '/assets/posters/nogo-handtasche.jpg?v=frame',
    title: 'Omma: keine Go Area für Deutsche',
    duration: '01:03 min',
    episodeNumber: '',
    cast: ['omma', 'talahons'],
    isVip: false
  },
  {
    id: 'r2-parkverbot',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/PARK%20VERBOT%20F%C3%9CR%20ALMANS_%20%F0%9F%9A%AB%20Walla%20Omma%20Teil%203.mp4',
    poster: '/assets/posters/parkverbot-almans.jpg?v=frame',
    title: 'Omma: Parkverbot für Almans',
    duration: '01:15 min',
    episodeNumber: '',
    cast: ['omma', 'talahons'],
    isVip: true
  },
  {
    id: 'r2-tram',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Tramdidos.mp4',
    poster: '/assets/posters/tramdidos.jpg?v=frame',
    title: 'Bahndidos: Tramdidos',
    duration: '00:28 min',
    episodeNumber: '',
    cast: ['bahndidos', 'omma'],
    isVip: true
  },
  {
    id: 'r2-ubahn',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Ubahndidos.mp4',
    poster: '/assets/posters/ubahndidos.jpg?v=frame',
    title: 'Bahndidos: Ubahndidos',
    duration: '00:29 min',
    episodeNumber: '',
    cast: ['bahndidos', 'omma'],
    isVip: true
  },
  {
    id: 'r2-gesagt',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/WAS%20HABEN%20SIE%20GESAGT_%20%F0%9F%98%82%20Die%20frechste%20Oma%20Deutschlands.mp4',
    poster: '/assets/posters/was-haben-sie-gesagt.jpg?v=frame',
    title: 'Omma: Was haben Sie gesagt',
    duration: '02:47 min',
    episodeNumber: '',
    cast: ['omma', 'opa', 'bahndidos'],
    isVip: false
  },
  {
    id: 'r2-weich',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Weichsp%C3%BCler_auf_lunge.mp4',
    poster: '/assets/posters/weichspueler.jpg?v=frame',
    title: 'Alman Opa: Weichspüler auf Lunge',
    duration: '01:01 min',
    episodeNumber: '',
    cast: ['opa', 'talahons'],
    isVip: false
  },
  {
    id: 'r2-kassa',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/alman-opa-kassa-blanko.mp4',
    poster: '/assets/posters/kassa-blanko.jpg?v=frame',
    title: 'Alman Opa: Kassa blanko',
    duration: '01:02 min',
    episodeNumber: '',
    cast: ['opa', 'talahinnen'],
    isVip: true
  },
  {
    id: 'r2-kevin-zeugnis',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/bankgeheimnis_kevin_zeugnis.mp4',
    poster: '/assets/posters/kevin-zeugnis.jpg?v=frame',
    title: 'Kevin: Zeugnis',
    duration: '01:03 min',
    episodeNumber: 'Exklusiv',
    cast: ['kevin'],
    isVip: true,
    isExclusive: true,
    description: 'Nur Kevin. Den Clip gibt es nur hier auf der Seite, nicht auf YouTube.'
  },
  {
    id: 'r2-strick-1',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/bankgeheimnis_oma_stricknadel_modifiziert_Full%20HD%201080p_HIGH_FR24.mp4',
    poster: '/assets/posters/stricknadel-1.jpg?v=frame',
    title: 'Omma: Stricknadelkommando Teil 1',
    duration: '00:35 min',
    episodeNumber: '',
    cast: ['omma', 'talahinnen'],
    isVip: true
  },
  {
    id: 'r2-strick-2',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bankgeheimnis_stricknadel_mod_2.mp4',
    poster: '/assets/posters/stricknadel-2.jpg?v=frame2',
    title: 'Omma: Stricknadelkommando Teil 2',
    duration: '00:37 min',
    episodeNumber: '',
    cast: ['omma', 'punk'],
    isVip: true
  },
  {
    id: 'r2-bimmel',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/bimmelbahndidos.mp4',
    poster: '/assets/posters/bimmelbahndidos.jpg?v=frame',
    title: 'Bahndidos: Bimmelbahndidos',
    duration: '00:29 min',
    episodeNumber: '',
    cast: ['bahndidos', 'opa'],
    isVip: true
  },
  {
    id: 'r2-blocksberg',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/blocksberg_brigade_strohbesen_battalion.mp4',
    poster: '/assets/posters/blocksberg.jpg?v=frame',
    title: 'Blocksberg Brigade: Strohbesen-Bataillon',
    duration: '01:03 min',
    episodeNumber: '',
    cast: ['blocksberg', 'pimpelhuber'],
    isVip: true
  },
  {
    id: 'r2-glocke',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/die-reichszeitglocke.mp4',
    poster: '/assets/posters/reichszeitglocke.jpg?v=frame',
    title: 'Reichszeitglocke',
    duration: '01:33 min',
    episodeNumber: '',
    cast: ['pimpelhuber'],
    isVip: false
  },
  {
    id: 'r2-hauptschule',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/hauptschulabschluss_aus_der_wunderlampe.mp4',
    poster: '/assets/posters/hauptschule.jpg?v=frame',
    title: 'Alman Opa: Hauptschulabschluss aus der Wunderlampe',
    duration: '01:01 min',
    episodeNumber: '',
    cast: ['opa', 'talahinnen'],
    isVip: false
  },
  {
    id: 'r2-kevin-ki',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/kevin_ist_ki_generiert_4K_HIGH_FR24_%281%29.mp4',
    poster: '/assets/posters/kevin-ki.jpg?v=frame',
    title: 'Kevin: ist KI-generiert',
    duration: '01:01 min',
    episodeNumber: '',
    cast: ['kevin'],
    isVip: true
  },
  {
    id: 'r2-bus',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/omma-no-go-area-an-bushaltestelle.mp4',
    poster: '/assets/posters/bushaltestelle.jpg?v=frame',
    title: 'Omma: No-Go-Area an der Bushaltestelle',
    duration: '01:07 min',
    episodeNumber: '',
    cast: ['omma', 'talahons'],
    isVip: true
  },
  {
    id: 'r2-flixtrain',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/flixtrain_Angels__4K_HIGH_FR24_%281%29.mp4',
    poster: '/assets/posters/flixtrain-angels.jpg?v=frame',
    title: 'Bahndidos: Flixtrain Angels',
    duration: '00:42 min',
    episodeNumber: '',
    cast: ['bahndidos', 'opa'],
    isVip: true
  },
  {
    id: 'r2-luftgitarre',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Alman-opa-luftgitarre-im-park.mp4',
    poster: '/assets/posters/luftgitarre.jpg?v=frame',
    title: 'Alman Opa: Luftgitarre im Park',
    duration: '00:16 min',
    episodeNumber: '',
    cast: ['opa'],
    isVip: true
  },
  {
    id: 'r2-spardidos',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bahndidos-Spardidos-mit-oma-schelle.mp4',
    poster: '/assets/posters/spardidos.jpg?v=frame',
    title: 'Bahndidos: Spardidos mit Oma Schelle',
    duration: '00:20 min',
    episodeNumber: '',
    cast: ['bahndidos', 'omaschelle'],
    isVip: true
  },
  {
    id: 'r2-pinguin',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Bankgeheimnis-Pinguin-im-park.mp4',
    poster: '/assets/posters/pinguin.jpg?v=frame',
    title: 'Pinguin im Park',
    duration: '00:30 min',
    episodeNumber: '',
    cast: ['parkbank'],
    isVip: true
  },
  {
    id: 'r2-groenland',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Blocksberg-Brigade-Gr%C3%B6nland-bleibt-besenrein.mp4',
    poster: '/assets/posters/groenland.jpg?v=frame',
    title: 'Blocksberg Brigade: Grönland bleibt besenrein',
    duration: '00:29 min',
    episodeNumber: '',
    cast: ['blocksberg'],
    isVip: true
  },
  {
    id: 'r2-stroh2000',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Blocksberg-Brigade-strohbesen2000.mp4',
    poster: '/assets/posters/strohbesen2000.jpg?v=frame',
    title: 'Blocksberg Brigade: Strohbesen 2000',
    duration: '00:38 min',
    episodeNumber: '',
    cast: ['blocksberg'],
    isVip: true
  },
  {
    id: 'r2-schelle-original',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Oma-Schelle-Bahndidos-orginal.mp4',
    poster: '/assets/posters/oma-schelle-original.jpg?v=frame',
    title: 'Bahndidos: Oma Schelle, Original',
    duration: '00:21 min',
    episodeNumber: '',
    cast: ['bahndidos', 'omaschelle'],
    isVip: true
  },
  {
    id: 'r2-pass',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Omma-talahons-deutschen-pass-im-app-store.mp4',
    poster: '/assets/posters/pass-appstore.jpg?v=frame',
    title: 'Omma: Deutscher Pass im App Store',
    duration: '01:04 min',
    episodeNumber: '',
    cast: ['omma', 'talahons'],
    isVip: true
  },
  {
    id: 'r2-sbahn',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/omma-s-bahndidos.mp4',
    poster: '/assets/posters/s-bahndidos.jpg?v=frame',
    title: 'Bahndidos: S-Bahndidos',
    duration: '00:22 min',
    episodeNumber: '',
    cast: ['bahndidos', 'omma'],
    isVip: true
  },
  {
    id: 'r2-alltag-1',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Park-Alltag-Teil-1.mp4',
    poster: '/assets/posters/park-alltag-1.jpg?v=frame',
    title: 'Park Alltag Teil 1',
    duration: '03:36 min',
    episodeNumber: '',
    cast: ['parkbank'],
    isVip: false
  },
  {
    id: 'r2-alltag-2',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Park-Alltag-Teil-2.mp4',
    poster: '/assets/posters/park-alltag-2.jpg?v=frame',
    title: 'Park Alltag Teil 2',
    duration: '03:17 min',
    episodeNumber: '',
    cast: ['parkbank'],
    isVip: true
  },
  {
    id: 'r2-alltag-3',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Park-Alltag-Teil-3.mp4',
    poster: '/assets/posters/park-alltag-3.jpg?v=frame',
    title: 'Park Alltag Teil 4',
    duration: '02:38 min',
    episodeNumber: '',
    cast: ['parkbank'],
    isVip: true
  },
  {
    id: 'r2-alltag-4',
    src: 'https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/Park-Alltag-Teil-4.mp4',
    poster: '/assets/posters/park-alltag-4.jpg?v=frame',
    title: 'Park Alltag Teil 5',
    duration: '02:55 min',
    episodeNumber: '',
    cast: ['parkbank'],
    isVip: true
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

const CAST_LABEL: Record<CastId, string> = {
  omma: 'Omma',
  opa: 'Alman Opa',
  bahndidos: 'Bahndidos',
  punk: 'Punks',
  talahons: 'Talahons',
  talahinnen: 'Talahinnen',
  chantal: 'Chantal',
  kevin: 'Kevin',
  hippie: 'Hippie',
  pimpelhuber: 'Pimpelhuber',
  blocksberg: 'Blocksberg Brigade',
  omaschelle: 'Oma Schelle',
  parkbank: 'Parkbank',
  rentnerin: 'Rasende Rentnerin',
  classic: 'Classics',
  gender: 'Gender Girls'
};

const CAST_FILTERS: CastId[] = [
  'omma',
  'opa',
  'bahndidos',
  'punk',
  'talahons',
  'talahinnen',
  'chantal',
  'kevin',
  'hippie',
  'pimpelhuber',
  'blocksberg',
  'omaschelle',
  'parkbank',
  'rentnerin',
  'classic',
  'gender'
];

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

const parseDurationSeconds = (dur: string): number => {
  const match = dur.match(/(\d+):(\d+)/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
};

interface UserAccount {
  name: string;
  email: string;
  isVip: boolean;
  memberSince: string;
  status?: 'active' | 'suspended';
  notes?: string;
}

const INITIAL_USERS: UserAccount[] = [
  { name: 'Alman Werner', email: 'opa.werner@web.de', isVip: true, memberSince: '2025', status: 'active' },
  { name: 'Chantal', email: 'chantal.berlin@gmail.com', isVip: true, memberSince: '2026', status: 'active' },
  { name: 'Bahndidos Rapper', email: 'bahndidos@berlin.de', isVip: false, memberSince: '2026', status: 'active' },
  { name: 'Kevin', email: 'kevin.park@gmx.de', isVip: false, memberSince: '2026', status: 'active' }
];

const MOBILE_COPY = new Set([
  'parkbank_classics11.mp4',
  'parkbank_classics10.mp4',
  'Bankgeheimnis_stricknadel_mod_2.mp4',
  'Bankgeheimnis_no_go_area_fuer_alman_opa.mp4',
  'flixtrain_Angels__4K_HIGH_FR24_(1).mp4',
  'bankgeheimnis_waschenverbotszone.mp4',
  'Ubahndidos.mp4',
  'Fremdsprachen_akrobatinnen.mp4',
  'Bankgeheimnis_omma_barfuß_durchs_waschbecken.mp4',
  'Tramdidos.mp4',
  'oma_rocker_im_eco_modus.mp4',
  'bimmelbahndidos.mp4',
  'Oma-Schelle-Bahndidos-orginal.mp4',
  'Bahndidos-Spardidos-mit-oma-schelle.mp4',
  'Kappenfraktion_oder_hutbürger.mp4',
  'parkbank_classics2.mp4',
  'Bankgeheimnis_hippie_hohlkopf.mp4',
  'blocksberg_brigade_strohbesen_battalion.mp4',
  'Weichspüler_auf_lunge.mp4',
  'Bankgeheimnis-Pinguin-im-park.mp4',
  'kevin_ist_ki_generiert_4K_HIGH_FR24_(1).mp4',
  'bankgeheimnis_kevin_zeugnis.mp4',
  'hauptschulabschluss_aus_der_wunderlampe.mp4',
  'Bahnhofsklo_als_meldeadresse_4K_HIGH_FR24.mp4',
  'oma_schelle_dunkelkammer.mp4',
  'parkbank_classics9.mp4',
  'parkbank_classics3.mp4',
  'parkbank_classics8.mp4',
  'Park-Alltag-Teil-1.mp4',
  'Park-Alltag-Teil-2.mp4',
  'Park-Alltag-Teil-3.mp4',
  'Park-Alltag-Teil-4.mp4',
  '24_stunden_vollgas.mp4',
]);

function playbackSrc(src?: string) {
  if (!src || typeof window === 'undefined') return src;
  if (!window.matchMedia('(max-width: 900px)').matches) return src;
  const file = decodeURIComponent(src.split('/').pop() || '');
  if (!MOBILE_COPY.has(file)) return src;
  return src.replace('/Sketches%2016zu9/', '/Sketches%2016zu9/mobil/');
}

export default function App() {
  const [animKey, setAnimKey] = useState(1);
  const [activeChar, setActiveChar] = useState<string | null>(null);
  const [activeCharTimeout, setActiveCharTimeout] = useState<NodeJS.Timeout | null>(null);

  // User Account & VIP Storage State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Admin-Panel & Authentifizierung State
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      return localStorage.getItem('bankgeheimnis_admin_pin') || '1870';
    } catch {
      return '1870';
    }
  });

  // Nutzerverwaltung (Gesamtliste aller Konten)
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('bankgeheimnis_users_list');
      if (saved) return JSON.parse(saved);
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const updateUsersList = (newUsers: UserAccount[]) => {
    setAllUsers(newUsers);
    try {
      localStorage.setItem('bankgeheimnis_users_list', JSON.stringify(newUsers));
    } catch {
      // Fallback
    }
    // Falls aktueller angemeldeter Nutzer in der Liste aktualisiert wurde (z.B. VIP getoggelt)
    if (currentUser) {
      const matched = newUsers.find((u) => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (matched && (matched.isVip !== currentUser.isVip || matched.name !== currentUser.name)) {
        const updatedCurrent = { ...currentUser, isVip: matched.isVip, name: matched.name, status: matched.status };
        setCurrentUser(updatedCurrent);
        try {
          localStorage.setItem('bankgeheimnis_user', JSON.stringify(updatedCurrent));
        } catch {}
      }
    }
  };

  // Eigene vom Admin hochgeladene/eingepflegte Videos
  const [customVideos, setCustomVideos] = useState<RealVideo[]>(() => {
    try {
      const saved = localStorage.getItem('bankgeheimnis_custom_videos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Klickzahlen / Video-Aufrufe Tracking
  const [videoViews, setVideoViews] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('bankgeheimnis_video_views');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authHint, setAuthHint] = useState('');
  const [registerForVip, setRegisterForVip] = useState(true);
  const [isGiftCodeRevealed, setIsGiftCodeRevealed] = useState(false);
  const [isGiftCodeCopied, setIsGiftCodeCopied] = useState(false);

  // Automatische Bildschirmanpassung (Quer- vs. Hochformat)
  const [isWidescreen, setIsWidescreen] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight * 1.05 : true
  );

  // Video Player State
  const [playingVideo, setPlayingVideo] = useState<RealVideo | null>(null);
  const [filmPhase, setFilmPhase] = useState<'intro' | 'film' | 'guestLock' | 'ende'>('intro');
  const [introReady, setIntroReady] = useState(false);
  const [tvLogo, setTvLogo] = useState(() =>
    typeof window !== 'undefined' &&
    window.innerWidth >= 1100 &&
    window.innerWidth > window.innerHeight
  );
  const bannerCanvasRef = useRef<HTMLCanvasElement>(null);
  const cinemaContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTitleBanner, setShowTitleBanner] = useState(true);

  const [castFilter, setCastFilter] = useState<CastId[]>([]);
  const [isCategoryBoxOpen, setIsCategoryBoxOpen] = useState(false);
  const [onlyAbo, setOnlyAbo] = useState<boolean>(false);
  const [onlyExclusive, setOnlyExclusive] = useState<boolean>(false);
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bankgeheimnis_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [durationFilter, setDurationFilter] = useState<'all' | 'under1' | 'over1'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});

  const videoSectionRef = useRef<HTMLElement>(null);

  const isVipUnlocked = Boolean(currentUser?.isVip);

  // Sicherheits-Wächter: Nicht angemeldete Gäste dürfen NIEMALS in der Filmphase sein
  useEffect(() => {
    if (!currentUser && filmPhase === 'film') {
      setFilmPhase('guestLock');
    }
  }, [currentUser, filmPhase]);

  // Zeigt den Clip-Namen prominent beim Start eines Clips / Intro für 5 Sekunden an
  useEffect(() => {
    if (!playingVideo) return;
    setShowTitleBanner(true);
    const timer = setTimeout(() => {
      setShowTitleBanner(false);
    }, 5500);
    return () => clearTimeout(timer);
  }, [playingVideo, filmPhase]);

  const toggleFavorite = (videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser || !currentUser.isVip) {
      showToast('Favoriten mit Herz ist exklusiv für angemeldete VIP-Mitglieder!');
      setAuthTab(currentUser ? 'login' : 'register');
      setRegisterForVip(true);
      setIsAuthModalOpen(true);
      return;
    }

    setFavoriteIds((prev) => {
      const exists = prev.includes(videoId);
      const updated = exists ? prev.filter((id) => id !== videoId) : [...prev, videoId];
      try {
        localStorage.setItem('bankgeheimnis_favorites', JSON.stringify(updated));
      } catch {
        // Fallback
      }
      showToast(exists ? 'Aus Favoriten entfernt' : '❤️ Zu Favoriten hinzugefügt');
      return updated;
    });
  };

  useEffect(() => {
    if (!tvLogo) return;
    const timer = window.setTimeout(() => setTvLogo(false), 2400);
    return () => window.clearTimeout(timer);
  }, [tvLogo]);

  // Bei jedem Clip-Wechsel und Start: IMMER zuerst das Intro abspielen
  useEffect(() => {
    if (!playingVideo?.src) return;
    setFilmPhase('intro');
    setIntroReady(false);
  }, [playingVideo]);

  // Scroll-Sperre für den Hintergrund, wenn der Player geöffnet ist
  useEffect(() => {
    if (playingVideo) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [playingVideo]);

  // Fullscreen Listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (cinemaContainerRef.current?.requestFullscreen) {
          await cinemaContainerRef.current.requestFullscreen();
        } else if ((cinemaContainerRef.current as any)?.webkitRequestFullscreen) {
          await (cinemaContainerRef.current as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const handleStreamToTv = async () => {
    const vid = videoRef.current;
    if (!vid) return;

    try {
      // 1. AirPlay (Apple / Safari / iOS / Smart TV)
      if ('webkitShowPlaybackTargetPicker' in vid && typeof (vid as any).webkitShowPlaybackTargetPicker === 'function') {
        (vid as any).webkitShowPlaybackTargetPicker();
        showToast('📺 AirPlay: Wähle deinen Fernseher oder Apple TV');
        return;
      }
      // 2. Remote Playback API (Chrome / Android / Smart TV Casting)
      if ('remote' in vid && (vid as any).remote && typeof (vid as any).remote.prompt === 'function') {
        await (vid as any).remote.prompt();
        showToast('📺 TV-Stream / Cast wird übertragen...');
        return;
      }
    } catch {
      // ignore
    }
    showToast('📺 TV-Tipp: Nutze das Streamen/Cast-Symbol im Browser oder die Bildschirmübertragung zum Smart-TV.');
  };

  const handleCloseCinema = () => {
    if (document.fullscreenElement) {
      try {
        if (document.exitFullscreen) document.exitFullscreen();
      } catch {
        // ignore
      }
    }
    setPlayingVideo(null);
    setIsAuthModalOpen(false);
  };

  // Keyboard Shortcuts im Kinomodus
  useEffect(() => {
    if (!playingVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseCinema();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingVideo]);

  // Autoplay State (Exklusiv für Ehren-Parkausweis / VIP)
  const [isAutoplay, setIsAutoplay] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bankgeheimnis_autoplay');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleAutoplay = () => {
    if (!isVipUnlocked) {
      showToast('Autoplay ist exklusiv mit dem Ehren-Parkausweis verfügbar!');
      setAuthTab('register');
      setRegisterForVip(true);
      setIsAuthModalOpen(true);
      return;
    }
    setIsAutoplay((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bankgeheimnis_autoplay', JSON.stringify(next));
      } catch {
        // Fallback
      }
      showToast(next ? 'Autoplay: AN' : 'Autoplay: AUS');
      return next;
    });
  };

  // Alle Videos (Eigene Videos vorangestellt, gefolgt von Original-Clips)
  const allVideos = React.useMemo(() => {
    return [...customVideos, ...REAL_VIDEOS];
  }, [customVideos]);

  const filteredVideos = React.useMemo(() => {
    return allVideos.filter((video) => {
      if (onlyAbo && !video.isVip) {
        return false;
      }
      if (onlyExclusive && !video.isExclusive) {
        return false;
      }
      if (onlyFavorites && !favoriteIds.includes(video.id)) {
        return false;
      }
      if (castFilter.length > 0 && !castFilter.every((id) => video.cast.includes(id))) {
        return false;
      }
      if (durationFilter !== 'all') {
        const sec = parseDurationSeconds(video.duration);
        if (durationFilter === 'under1' && sec >= 60) return false;
        if (durationFilter === 'over1' && sec < 60) return false;
      }
      return true;
    });
  }, [allVideos, onlyAbo, onlyExclusive, onlyFavorites, favoriteIds, castFilter, durationFilter]);

  const shownVideos = React.useMemo(() => {
    if (isVipUnlocked) return filteredVideos;
    return [...filteredVideos].sort((a, b) => Number(Boolean(a.isVip)) - Number(Boolean(b.isVip)));
  }, [filteredVideos, isVipUnlocked]);

  // Aktive Playlist basierend auf exakt den gefilterten Videos (oder allen zugänglichen Sketchen)
  const currentCategoryPlaylist = React.useMemo(() => {
    return filteredVideos.filter((v) => !v.isVip || isVipUnlocked);
  }, [filteredVideos, isVipUnlocked]);

  const currentPlaylistIndex = playingVideo 
    ? currentCategoryPlaylist.findIndex((v) => v.id === playingVideo.id) 
    : -1;

  const handleNextClip = (manual = true) => {
    if (currentCategoryPlaylist.length <= 1) {
      if (manual) showToast('Kein weiterer Clip in dieser Auswahl.');
      return;
    }
    const currentIndex = currentCategoryPlaylist.findIndex((v) => v.id === playingVideo?.id);
    const nextIndex = (currentIndex + 1) % currentCategoryPlaylist.length;
    const nextVid = currentCategoryPlaylist[nextIndex];

    if (nextVid.isVip && !isVipUnlocked) {
      showToast('🔒 Dieser Clip erfordert den Ehren-Parkausweis!');
      setRegisterForVip(true);
      setAuthTab('register');
      setIsAuthModalOpen(true);
      return;
    }

    // IMMER Intro vor jedem Clip abspielen (auch bei Autoplay)
    setPlayingVideo(nextVid);
    setFilmPhase('intro');
    setIntroReady(false);
    showToast(`${manual ? 'Nächster Clip' : 'Autoplay'}: ${nextVid.title}`);
  };

  const handlePrevClip = () => {
    if (currentCategoryPlaylist.length <= 1) return;
    const currentIndex = currentCategoryPlaylist.findIndex((v) => v.id === playingVideo?.id);
    const prevIndex = (currentIndex - 1 + currentCategoryPlaylist.length) % currentCategoryPlaylist.length;
    const prevVid = currentCategoryPlaylist[prevIndex];

    if (prevVid.isVip && !isVipUnlocked) {
      showToast('🔒 Dieser Clip erfordert den Ehren-Parkausweis!');
      setRegisterForVip(true);
      setAuthTab('register');
      setIsAuthModalOpen(true);
      return;
    }

    // IMMER Intro vor jedem Clip abspielen
    setPlayingVideo(prevVid);
    setFilmPhase('intro');
    setIntroReady(false);
    showToast(`Vorheriger Clip: ${prevVid.title}`);
  };

  // Speichern in localStorage
  const saveUser = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('bankgeheimnis_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bankgeheimnis_user');
    }
  };

  const accountFromAuth = (user: AuthUser): UserAccount => {
    const email = user.email || '';
    const listed = allUsers.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
    const metaName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : '';
    return {
      name: metaName || listed?.name || email.split('@')[0] || 'Gast',
      email,
      isVip: user.app_metadata?.vip === true,
      memberSince: listed?.memberSince || String(new Date(user.created_at).getFullYear()),
      status: listed?.status || 'active'
    };
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const abo = params.get('abo');
    if (!abo) return;
    const sessionId = params.get('session_id');
    window.history.replaceState({}, '', window.location.pathname);
    if (abo === 'abgebrochen') {
      setToastMsg('Zahlung abgebrochen.');
      setTimeout(() => setToastMsg(null), 3500);
      return;
    }
    if (abo !== 'ok' || !sessionId) return;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      await fetch('/api/abo-bestaetigen', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      await supabase.auth.refreshSession();
      setToastMsg('Zahlung wird geprüft. Der Ausweis geht auf, sobald Stripe durch ist.');
      setTimeout(() => setToastMsg(null), 3500);
    })();
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      saveUser(data.session?.user ? accountFromAuth(data.session.user) : null);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      saveUser(session?.user ? accountFromAuth(session.user) : null);
    });
    return () => {
      alive = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

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

  const heroSlides = [
    {
      src: '/assets/banner/banner-landing.webp',
      alt: 'Deutsche Comedy-Sketche, die ganze Parkbank-Crew',
      title: 'Bankgeheimnis im Park',
      action: 'videos' as const,
      label: 'Jetzt anschauen',
    },
    {
      src: '/assets/banner/banner-landing-kevin.webp',
      alt: 'Comedy-Sketch: Kevin mit dem Zeugnis',
      title: 'Kevin: Zeugnis',
      action: 'kevin' as const,
      label: 'Jetzt anschauen',
    },
    {
      src: '/assets/banner/duell-landing.webp?v=align',
      alt: 'Parkbank-Duell, kostenloses Wort-Duell im Browser',
      title: 'Parkbank Duell',
      action: 'spiel' as const,
      label: 'Jetzt spielen',
    },
  ];
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

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

  const openHero = () => {
    const slide = heroSlides[heroIndex];
    if (slide.action === 'kevin') {
      const vid = REAL_VIDEOS.find((video) => video.id === 'r2-kevin-zeugnis');
      if (vid) handleWatchVideo(vid);
      return;
    }
    if (slide.action === 'spiel') {
      document.getElementById('spiel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    scrollToVideos();
  };

  const handleWatchVideo = (vid: RealVideo) => {
    // Aufrufe / Klickzahlen erfassen & persistieren
    setVideoViews((prev) => {
      const updated = { ...prev, [vid.id]: (prev[vid.id] || 0) + 1 };
      try {
        localStorage.setItem('bankgeheimnis_video_views', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Bei Premium-Videos (mit Schloss im Thumbnail): Registrierung/VIP Hinweis
    if (vid.isVip && !isVipUnlocked) {
      showToast('🔒 Für diesen Sketch wird der Ehren-Parkausweis benötigt!');
      setRegisterForVip(true);
      setAuthTab('register');
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

  // Echter Login / Registrierungs-Handler mit Admin-Nutzerlisten-Synchronisation
  const startAbo = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setAuthTab('register');
      setRegisterForVip(true);
      setIsAuthModalOpen(true);
      showToast('Erst kostenlos anmelden, dann den Ausweis holen.');
      return;
    }
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.url) {
      showToast(body.error || 'Zahlung gerade nicht möglich.');
      return;
    }
    window.location.href = body.url;
  };

  const openAboPortal = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const response = await fetch('/api/portal', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.url) {
      showToast(body.error || 'Abo kann gerade nicht geöffnet werden.');
      return;
    }
    window.location.href = body.url;
  };

  const signInAccount = async (email: string, password: string) => {
    let result = await supabase.auth.signInWithPassword({ email, password });
    const firstMessage = (result.error?.message || '').toLowerCase();
    if (result.error && firstMessage.includes('not confirmed')) {
      await fetch('/api/konto-freigeben', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      result = await supabase.auth.signInWithPassword({ email, password });
    }
    if (result.error || !result.data.user) {
      const message = (result.error?.message || '').toLowerCase();
      if (message.includes('not confirmed')) {
        setAuthHint('Die Bestätigungsmail geht auf localhost und gilt nicht. Das Konto ließ sich nicht freischalten.');
      } else {
        setAuthHint('E-Mail oder Passwort ist falsch.');
      }
      return null;
    }
    const user = accountFromAuth(result.data.user);
    saveUser(user);
    const filtered = allUsers.filter((entry) => entry.email.toLowerCase() !== user.email.toLowerCase());
    updateUsersList([user, ...filtered]);
    setAuthHint('');
    setIsAuthModalOpen(false);
    if (playingVideo && (user.isVip || !playingVideo.isVip)) {
      setFilmPhase('film');
    }
    return user;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = authEmail.trim();
    const password = authPassword;
    setAuthHint('');
    if (!email || !password) {
      setAuthHint('E-Mail und Passwort eingeben.');
      return;
    }
    if (password.length < 6) {
      setAuthHint('Passwort mindestens 6 Zeichen.');
      return;
    }

    if (authTab === 'login') {
      const user = await signInAccount(email, password);
      if (user) showToast(`Angemeldet als ${user.name}`);
      return;
    }

    const name = authName.trim() || email.split('@')[0];
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin
      }
    });
    if (error) {
      const message = error.message.toLowerCase();
      if (!message.includes('already')) {
        setAuthHint('Konto konnte nicht angelegt werden.');
        return;
      }
    }
    if (!data?.session) {
      await fetch('/api/konto-freigeben', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    }
    const user = data?.session?.user
      ? accountFromAuth(data.session.user)
      : await signInAccount(email, password);
    if (!user) {
      setAuthTab('login');
      return;
    }
    if (data?.session?.user) {
      user.name = name || user.name;
      saveUser(user);
      const filtered = allUsers.filter((entry) => entry.email.toLowerCase() !== user.email.toLowerCase());
      updateUsersList([user, ...filtered]);
      setIsAuthModalOpen(false);
    }
    showToast('Konto erstellt. Du bist angemeldet.');
    if (registerForVip) await startAbo();
  };

  // Admin Aktionen: Videos, Backups & PIN
  const handleAddCustomVideo = (video: RealVideo) => {
    const updated = [video, ...customVideos];
    setCustomVideos(updated);
    try {
      localStorage.setItem('bankgeheimnis_custom_videos', JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteCustomVideo = (videoId: string) => {
    const updated = customVideos.filter((v) => v.id !== videoId);
    setCustomVideos(updated);
    try {
      localStorage.setItem('bankgeheimnis_custom_videos', JSON.stringify(updated));
    } catch {}
  };

  const handleToggleVideoVip = (videoId: string) => {
    const updated = customVideos.map((v) => {
      if (v.id === videoId) {
        return { ...v, isVip: !v.isVip };
      }
      return v;
    });
    setCustomVideos(updated);
    try {
      localStorage.setItem('bankgeheimnis_custom_videos', JSON.stringify(updated));
    } catch {}
  };

  const handleUpdateAdminPin = (newPin: string) => {
    setAdminPin(newPin);
    try {
      localStorage.setItem('bankgeheimnis_admin_pin', newPin);
    } catch {}
  };

  const handleImportBackup = (backup: AdminBackupData, mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      if (Array.isArray(backup.users)) updateUsersList(backup.users);
      if (Array.isArray(backup.customVideos)) {
        setCustomVideos(backup.customVideos);
        try {
          localStorage.setItem('bankgeheimnis_custom_videos', JSON.stringify(backup.customVideos));
        } catch {}
      }
      if (backup.videoViews && typeof backup.videoViews === 'object') {
        setVideoViews(backup.videoViews);
        try {
          localStorage.setItem('bankgeheimnis_video_views', JSON.stringify(backup.videoViews));
        } catch {}
      }
      if (backup.adminPin) {
        handleUpdateAdminPin(backup.adminPin);
      }
      if (Array.isArray(backup.favorites)) {
        setFavoriteIds(backup.favorites);
        try {
          localStorage.setItem('bankgeheimnis_favorites', JSON.stringify(backup.favorites));
        } catch {}
      }
    } else {
      // Merge
      if (Array.isArray(backup.users)) {
        const existingEmails = new Set(allUsers.map((u) => u.email.toLowerCase()));
        const toAdd = backup.users.filter((u) => !existingEmails.has(u.email.toLowerCase()));
        updateUsersList([...allUsers, ...toAdd]);
      }
      if (Array.isArray(backup.customVideos)) {
        const existingIds = new Set(customVideos.map((v) => v.id));
        const toAdd = backup.customVideos.filter((v) => !existingIds.has(v.id));
        const combined = [...customVideos, ...toAdd];
        setCustomVideos(combined);
        try {
          localStorage.setItem('bankgeheimnis_custom_videos', JSON.stringify(combined));
        } catch {}
      }
      if (backup.videoViews && typeof backup.videoViews === 'object') {
        const merged = { ...videoViews };
        for (const [k, v] of Object.entries(backup.videoViews)) {
          merged[k] = (merged[k] || 0) + v;
        }
        setVideoViews(merged);
        try {
          localStorage.setItem('bankgeheimnis_video_views', JSON.stringify(merged));
        } catch {}
      }
      if (Array.isArray(backup.favorites)) {
        const merged = Array.from(new Set([...favoriteIds, ...backup.favorites]));
        setFavoriteIds(merged);
        try {
          localStorage.setItem('bankgeheimnis_favorites', JSON.stringify(merged));
        } catch {}
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    saveUser(null);
    setIsAuthModalOpen(false);
    showToast('Abgemeldet.');
  };

  // Homepage Teilen Funktion (Web Share API mit Zwischenablage-Fallback)
  const handleShareHomepage = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://bankgeheimnisimpark.de';
    const shareData = {
      title: 'Bankgeheimnis im Park',
      text: 'Comedy Deutsch & unzensierte Parkbank-Satire mit den Bahndidos, Alman Opa & Omma – schau mal rein!',
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('🎉 Danke fürs Weitersagen!');
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('📋 Link zur Homepage in Zwischenablage kopiert!');
      } else {
        showToast('🔗 Homepage-Link: ' + shareUrl);
      }
    } catch {
      showToast('🔗 Homepage-Link: ' + shareUrl);
    }
  };

  const toggleCast = (id: CastId) => {
    setCastFilter((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 2) return [current[1], id];
      return [...current, id];
    });
    setVisibleCount(4);
  };

  const visibleVideos = shownVideos.slice(0, visibleCount);

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
      <header role="banner" className="w-full max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between z-40 border-b border-neutral-900 bg-black/95 backdrop-blur-md sticky top-0 shrink-0">
        
        {/* Logo und Kanalname nebeneinander in einer Reihe */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
          <img 
            src="/assets/logo_gross.webp" 
            alt="Bankgeheimnis im Park Logo" 
            title="Bankgeheimnis im Park"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0"
          />
          <span className="font-extrabold text-sm sm:text-lg text-white tracking-tight whitespace-nowrap">
            Bankgeheimnis im Park
          </span>
        </div>

        {/* Rechte Seite: Teilen & Login/Konto */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button 
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-[#e8b568] text-xs font-bold border border-neutral-800 hover:border-[#c89346] shadow cursor-pointer transition-all"
            title="Homepage & Logo teilen"
          >
            <Share2 className="w-3.5 h-3.5 text-[#e8b568] shrink-0" />
            <span className="hidden md:inline">Teilen</span>
          </button>

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

      <main id="inhalt">

      {/* ============================================================ */}
      {/* SEKTION 1: DAS HERO-BANNER                                   */}
      {/* - OHNE INFO-ICONS (i)                                       */}
      {/* - BEIM ANKLICKEN WIRD DIE FIGUR LEICHT GRÖSSER              */}
      {/* - NUR DIE ECHTEN BEZEICHNUNGEN (PUNKS, TALAHONS, BAHNDIDOS) */}
      {/* - TITEL & BUTTON DIREKT IM BILD                             */}
      {/* ============================================================ */}
      {/* ============================================================ */}
      {/* SEKTION 1: RESPONSIVER HERO-SLIDER                           */}
      {/* ============================================================ */}
      {/* SEKTION 1: BANNER (QUER-OPTIMIERT, OHNE ANIMATION)           */}
      {/* ============================================================ */}
      <section className="w-full relative bg-black overflow-hidden border-b border-neutral-900 h-[calc(100dvh-4rem)]">
        <div
          className={`w-full h-full ${
            isWidescreen
              ? 'px-8 flex flex-row items-center justify-center gap-10'
              : 'max-w-6xl mx-auto px-3 sm:px-6 flex flex-col items-center justify-center text-center pb-8'
          }`}
        >
          <div
            className={
              isWidescreen
                ? 'h-[88%] aspect-[896/1200] shrink-0 relative'
                : 'h-[min(58dvh,calc(100dvh-16rem))] aspect-[896/1200] relative'
            }
          >
            {heroSlides.map((slide, index) => (
              <img
                key={slide.src}
                src={slide.src}
                alt={slide.alt}
                title={slide.title}
                className={`absolute inset-0 h-full w-full object-contain ${index === heroIndex ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>

          <div className={isWidescreen ? 'w-64 shrink-0 flex flex-col items-start text-left' : 'shrink-0 mt-1 flex flex-col items-center'}>
            <p className={`font-black tracking-tight text-white uppercase leading-tight ${isWidescreen ? 'text-2xl' : 'text-3xl'}`}>
              {heroSlides[heroIndex].title}
            </p>
            <button
              type="button"
              onClick={openHero}
              className={`rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-black uppercase tracking-wider border-2 border-[#c89346] shadow-[0_4px_20px_rgba(200,147,70,0.4)] transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                isWidescreen ? 'mt-4 py-3 px-6 text-sm' : 'mt-4 py-4 px-10 text-base'
              }`}
            >
              <span>{heroSlides[heroIndex].label}</span>
              <Play className="w-5 h-5 fill-white text-white" />
            </button>
          </div>
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
          
          <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
            Bankgeheimnis im Park – Deutsche Comedy-Sketche & kostenlose Browsergames
          </h1>

          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
            PARKBANK-SKETCHE & HIGHLIGHTS
          </h2>
          
          <p className="mt-3 text-lg sm:text-xl text-neutral-300 font-medium leading-relaxed">
            Echte Comedy von der Parkbank – Wählen Sie eine Folge und schauen Sie direkt im Player los!
          </p>
          <p className="mt-2 text-[11px] text-neutral-500">Sketche mit KI erzeugt.</p>
        </div>


        <div className="mb-8 rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-950 p-3.5 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Filter-Auslöser & Aktive Filter Chips - zentriert im Hochformat / auf Mobile */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 w-full sm:w-auto">
              
              {/* Filter Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsCategoryBoxOpen(!isCategoryBoxOpen)}
                  className={`bg-neutral-900 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 shadow-sm ${
                    isCategoryBoxOpen || castFilter.length > 0 || onlyAbo || onlyExclusive || onlyFavorites || durationFilter !== 'all'
                      ? 'border-[#c89346] text-[#e8b568] bg-[#6d3c17]/30'
                      : 'border-neutral-700 hover:border-[#c89346]'
                  }`}
                >
                  <Filter className="w-4 h-4 text-[#c89346] shrink-0" />
                  <span>Kategorien & Filter</span>
                  {((castFilter.length > 0 ? castFilter.length : 0) + (onlyAbo ? 1 : 0) + (onlyExclusive ? 1 : 0) + (onlyFavorites ? 1 : 0) + (durationFilter !== 'all' ? 1 : 0)) > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#c89346] text-black text-[11px] font-black flex items-center justify-center shrink-0">
                      {(castFilter.length > 0 ? castFilter.length : 0) + (onlyAbo ? 1 : 0) + (onlyExclusive ? 1 : 0) + (onlyFavorites ? 1 : 0) + (durationFilter !== 'all' ? 1 : 0)}
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isCategoryBoxOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Auswahl-Kasten Modal: Kategorien, Abo-Clips & Dauer - PERFEKT ZENTRIERT IM HOCHFORMAT & DESKTOP */}
              {isCategoryBoxOpen && (
                <div 
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
                  onClick={() => setIsCategoryBoxOpen(false)}
                >
                  <div 
                    className="w-full max-w-[500px] my-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0e0e0e] border-2 border-[#c89346] shadow-[0_0_50px_rgba(200,147,70,0.25)] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-neutral-800">
                      <div>
                        <h4 className="text-white font-black text-base sm:text-lg uppercase tracking-wide flex items-center gap-2">
                          <Filter className="w-4 h-4 text-[#c89346]" />
                          <span>Kategorien & Filter</span>
                        </h4>
                        <p className="text-neutral-400 text-xs mt-0.5">
                          Wähle Kategorien, Abo-Status oder Clip-Länge
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(castFilter.length > 0 || onlyAbo || onlyExclusive || onlyFavorites || durationFilter !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setCastFilter([]);
                              setOnlyAbo(false);
                              setOnlyExclusive(false);
                              setOnlyFavorites(false);
                              setDurationFilter('all');
                              setVisibleCount(4);
                            }}
                            className="text-xs font-bold text-[#e8b568] hover:underline cursor-pointer px-1 py-0.5"
                          >
                            Zurücksetzen
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsCategoryBoxOpen(false)}
                          className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Kategorien-Grid inklusive ABO-CLIPS, WEB-EXKLUSIV & FAVORITEN - VOLLSTÄNDIG SICHTBAR */}
                    <div className="mb-3">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">
                        Kategorien & Rollen
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        
                        {/* Abo-Clips direkt als Kategorie in der Liste */}
                        <button
                          type="button"
                          onClick={() => {
                            setOnlyAbo(!onlyAbo);
                            setVisibleCount(4);
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-black text-left transition-all border flex items-center justify-between gap-1 cursor-pointer ${
                            onlyAbo
                              ? 'bg-[#6d3c17] text-[#fcd34d] border-[#c89346] shadow-md'
                              : 'bg-neutral-900 text-[#e8b568] border-[#c89346]/40 hover:border-[#c89346]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Lock className="w-3.5 h-3.5 text-[#e8b568] shrink-0" />
                            <span className="truncate">Abo-Clips</span>
                          </div>
                          {onlyAbo && <Check className="w-3.5 h-3.5 text-[#e8b568] shrink-0" />}
                        </button>

                        {/* Web-Exklusiv (Nicht auf Social Media) */}
                        <button
                          type="button"
                          onClick={() => {
                            setOnlyExclusive(!onlyExclusive);
                            setVisibleCount(4);
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-black text-left transition-all border flex items-center justify-between gap-1 cursor-pointer ${
                            onlyExclusive
                              ? 'bg-amber-700/80 text-white border-amber-400 shadow-md'
                              : 'bg-neutral-900 text-amber-300 border-amber-500/40 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            <span className="truncate">Web-Exklusiv</span>
                          </div>
                          {onlyExclusive && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>

                        {/* Favoriten direkt als Kategorie in der Liste */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentUser || !currentUser.isVip) {
                              showToast('Favoriten ist exklusiv für angemeldete VIP-Mitglieder!');
                              setAuthTab(currentUser ? 'login' : 'register');
                              setRegisterForVip(true);
                              setIsAuthModalOpen(true);
                              return;
                            }
                            setOnlyFavorites(!onlyFavorites);
                            setVisibleCount(4);
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-black text-left transition-all border flex items-center justify-between gap-1 cursor-pointer ${
                            onlyFavorites
                              ? 'bg-red-600 text-white border-red-500 shadow-md'
                              : 'bg-neutral-900 text-red-400 border-red-500/40 hover:border-red-500'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white text-white' : 'fill-red-400 text-red-400'} shrink-0`} />
                            <span className="truncate">Favoriten</span>
                          </div>
                          {onlyFavorites ? (
                            <Check className="w-3.5 h-3.5 text-white shrink-0" />
                          ) : !isVipUnlocked ? (
                            <Lock className="w-3 h-3 text-[#c89346] shrink-0" />
                          ) : null}
                        </button>

                        {/* Alle weiteren Rollen-Kategorien */}
                        {CAST_FILTERS.map((id) => {
                          const isSelected = castFilter.includes(id);
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => toggleCast(id)}
                              className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-left transition-all border flex items-center justify-between gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#6d3c17] text-white border-[#c89346] shadow-md'
                                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600'
                              }`}
                            >
                              <span className="truncate">{CAST_LABEL[id]}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#e8b568] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Länge / Dauer direkt hier als Buttons statt Dropdown */}
                    <div className="pt-3 border-t border-neutral-800">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">
                        Clip-Länge
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDurationFilter('all');
                            setVisibleCount(4);
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                            durationFilter === 'all'
                              ? 'bg-[#6d3c17] text-white border-[#c89346] shadow-sm'
                              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600'
                          }`}
                        >
                          Alle Längen
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDurationFilter('under1');
                            setVisibleCount(4);
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                            durationFilter === 'under1'
                              ? 'bg-[#6d3c17] text-white border-[#c89346] shadow-sm'
                              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600'
                          }`}
                        >
                          Unter 1 Min.
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDurationFilter('over1');
                            setVisibleCount(4);
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                            durationFilter === 'over1'
                              ? 'bg-[#6d3c17] text-white border-[#c89346] shadow-sm'
                              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600'
                          }`}
                        >
                          Über 1 Min.
                        </button>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="mt-4 pt-3.5 border-t border-neutral-800 flex items-center justify-between">
                      <span className="text-xs text-neutral-400 font-medium">
                        {filteredVideos.length === 1 ? '1 Video gefunden' : `${filteredVideos.length} Videos gefunden`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCategoryBoxOpen(false)}
                        className="px-6 py-2 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white text-xs font-black uppercase tracking-wider border border-[#c89346] cursor-pointer shadow-md transition-all active:scale-95"
                      >
                        Fertig
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Aktive Filter Chips im Hauptbalken (Schnelles Entfernen) */}
              {onlyAbo && (
                <button
                  type="button"
                  onClick={() => setOnlyAbo(false)}
                  className="px-2.5 py-1 rounded-lg bg-[#6d3c17]/50 text-[#fcd34d] border border-[#c89346]/60 text-xs font-bold flex items-center gap-1.5 hover:bg-[#6d3c17] transition-colors cursor-pointer"
                  title="Abo-Filter entfernen"
                >
                  <Lock className="w-3 h-3 text-[#e8b568]" />
                  <span>Abo-Clips</span>
                  <X className="w-3 h-3 text-neutral-400 hover:text-white" />
                </button>
              )}

              {onlyExclusive && (
                <button
                  type="button"
                  onClick={() => setOnlyExclusive(false)}
                  className="px-2.5 py-1 rounded-lg bg-amber-600/30 text-amber-300 border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-600/50 transition-colors cursor-pointer"
                  title="Web-Exklusiv-Filter entfernen"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Web-Exklusiv</span>
                  <X className="w-3 h-3 text-neutral-400 hover:text-white" />
                </button>
              )}

              {onlyFavorites && (
                <button
                  type="button"
                  onClick={() => setOnlyFavorites(false)}
                  className="px-2.5 py-1 rounded-lg bg-red-600/30 text-red-400 border border-red-500/50 text-xs font-bold flex items-center gap-1.5 hover:bg-red-600/50 transition-colors cursor-pointer"
                  title="Favoriten-Filter entfernen"
                >
                  <Heart className="w-3 h-3 fill-red-400 text-red-400" />
                  <span>Favoriten</span>
                  <X className="w-3 h-3 text-neutral-400 hover:text-white" />
                </button>
              )}

              {castFilter.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleCast(id)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white border border-neutral-700 text-xs font-bold flex items-center gap-1.5 hover:border-[#c89346] transition-colors cursor-pointer"
                  title={`${CAST_LABEL[id]} entfernen`}
                >
                  <span>{CAST_LABEL[id]}</span>
                  <X className="w-3 h-3 text-neutral-400 hover:text-white" />
                </button>
              ))}

              {durationFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setDurationFilter('all')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white border border-neutral-700 text-xs font-bold flex items-center gap-1.5 hover:border-[#c89346] transition-colors cursor-pointer"
                  title="Dauer-Filter zurücksetzen"
                >
                  <span>{durationFilter === 'under1' ? '< 1 Min.' : '> 1 Min.'}</span>
                  <X className="w-3 h-3 text-neutral-400 hover:text-white" />
                </button>
              )}

              {(castFilter.length > 0 || onlyAbo || onlyExclusive || onlyFavorites || durationFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setCastFilter([]);
                    setOnlyAbo(false);
                    setOnlyExclusive(false);
                    setOnlyFavorites(false);
                    setDurationFilter('all');
                    setVisibleCount(4);
                  }}
                  className="text-xs text-[#e8b568] hover:underline cursor-pointer ml-1"
                >
                  Alle löschen
                </button>
              )}

            </div>

            {/* Ergebnis-Anzahl (nur Gesamtergebnis, keine Zahlen in Klammern bei Kategorien) */}
            <div className="text-xs sm:text-sm font-semibold text-neutral-400 text-center sm:text-right pt-0.5 sm:pt-0 shrink-0 w-full sm:w-auto">
              {filteredVideos.length === 1 ? '1 Video gefunden' : `${filteredVideos.length} Videos gefunden`}
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {visibleVideos.map((vid, index) => {

              const isLiked = likedVideos[vid.id];

              return (
                <div 
                  key={`${vid.id}-${index}`}
                  onClick={() => handleWatchVideo(vid)}
                  className="group bg-neutral-900/90 rounded-2xl overflow-hidden border-2 border-neutral-800 hover:border-[#c89346] transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-xl hover:-translate-y-1"
                >
                  {/* Vorschaubild */}
                  <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
                    <img 
                      src={vid.poster ?? `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`} 
                      alt={`Comedy-Sketch: ${vid.title}`}
                      title={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                      loading="lazy"
                    />
                    
                    {/* Play- / Lock-Icon Overlay */}
                    <div className={`absolute inset-0 transition-colors flex items-center justify-center ${
                      vid.isVip && !isVipUnlocked ? 'bg-black/60 group-hover:bg-black/50' : 'bg-black/40 group-hover:bg-black/20'
                    }`}>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#6d3c17] group-hover:bg-[#7d441a] text-white flex items-center justify-center shadow-2xl border border-[#c89346] transform group-hover:scale-110 transition-transform">
                        {vid.isVip && !isVipUnlocked ? (
                          <Lock className="w-7 h-7 text-[#fcd34d] fill-[#fcd34d]" />
                        ) : (
                          <Play className="w-7 h-7 fill-white text-white ml-1" />
                        )}
                      </div>
                    </div>

                    {/* Badges: ABO Ehren-Pass vs Standart-Pass; 'Neu' nur bei Kevin Zeugnis; Web-Exklusiv */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      {vid.id === 'r2-kevin-zeugnis' && (
                        <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-xs uppercase tracking-wider shadow">
                          Neu
                        </span>
                      )}
                      {vid.isExclusive && (
                        <span className="px-2 py-1 rounded-lg bg-amber-500 text-black font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow">
                          ⭐ Exklusiv
                        </span>
                      )}
                      {vid.isVip ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#c89346] text-black font-black text-xs uppercase flex items-center gap-1 shadow">
                          <Lock className="w-3 h-3" /> ABO Ehren-Pass
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 text-neutral-100 border border-neutral-400/80 font-black text-xs uppercase tracking-wider shadow-md">
                          Standart-Pass
                        </span>
                      )}
                    </div>

                    {/* Favoriten Herz-Button (VIP) */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(vid.id, e)}
                      className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-lg ${
                        favoriteIds.includes(vid.id)
                          ? 'bg-red-600 text-white scale-110 shadow-[0_0_14px_rgba(239,68,68,0.6)]'
                          : 'bg-black/60 text-white/80 hover:text-red-400 hover:bg-black/85'
                      }`}
                      title={favoriteIds.includes(vid.id) ? "Aus Favoriten entfernen" : "Als Favorit merken (VIP)"}
                    >
                      <Heart className={`w-4 h-4 ${favoriteIds.includes(vid.id) ? 'fill-white' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/85 text-white font-bold text-xs tracking-wide">
                      {vid.duration}
                    </div>
                  </div>

                  {/* Video Info: Titel & Rollen (Ganze Karte klickbar) */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-start">
                    <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#c89346] transition-colors leading-snug line-clamp-2">
                      {vid.title}
                    </h3>
                    
                    {/* Rollen-Badges */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {vid.cast.map((id) => (
                        <span key={id} className="px-2.5 py-0.5 rounded-md bg-[#6d3c17]/40 text-[#e8b568] border border-[#c89346]/40 text-xs font-bold">
                          {CAST_LABEL[id]}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
        </div>
        {visibleVideos.length === 0 && (
          <p className="mt-8 text-center text-neutral-300 text-lg">Keine Videos gefunden.</p>
        )}

        {/* Mehr anzeigen Button */}
        {filteredVideos.length > visibleCount && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="px-8 py-3.5 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-black text-base uppercase tracking-wider border-2 border-[#c89346] shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Mehr anzeigen</span>
              <ChevronRight className="w-5 h-5 text-[#e8b568]" />
            </button>
          </div>
        )}

        <p className="mt-12 max-w-3xl mx-auto text-left text-base text-neutral-300 leading-relaxed">
          Auf der Parkbank treffen Rentner, Alltagssatire und trockener deutscher Humor aufeinander. Die Comedy-Sketche zeigen die schrägsten Geschichten und Dialoge direkt aus dem Parkleben, ungefiltert, kurzweilig und in voller Länge. Alman Opa, Omma, die Bahndidos und der Rest der Crew sitzen auf derselben Bank: No-Go-Area, Waschverbotszone, Regionalexpress und der ganz normale Nachmittag im Park. Die Folgen laufen hier im eigenen Player. Ein Teil ist frei anschaubar, die längeren Sketche gibt es mit dem Ehren-Parkausweis. Neue Clips liegen oft zuerst auf dieser Seite, bevor sie auf{' '}
          <a href="https://www.youtube.com/@bankgeheimnisimpark" title="Comedy-Sketche auf YouTube" className="text-[#e8b568] underline underline-offset-2">YouTube</a>
          {' '}erscheinen.
        </p>

        {/* On-Site Parkbank Info-Box (Keine externen YouTube-Verlinkungen) */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left">
          <div className="flex flex-col items-start text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#6d3c17]/40 text-[#e8b568] flex items-center justify-center shrink-0 border border-[#c89346]/40 mb-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-bold text-white">
                Direkt hier auf der Parkbank anschauen
              </h4>
              <p className="mt-2 text-neutral-400 text-base sm:text-lg">
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

          <div className={`mt-8 sm:mt-10 ${isWidescreen ? 'grid grid-cols-2 gap-6 items-center' : ''}`}>
            <img 
              src="/assets/group_frei.webp" 
              alt="Bankgeheimnis im Park Crew am Steineingang und Mauer" 
              title="Die Parkbank-Crew"
              className="w-full h-auto object-contain max-h-[540px] drop-shadow-[0_16px_40px_rgba(0,0,0,0.95)]"
              loading="lazy"
              decoding="async"
            />
            <div className={`flex flex-col gap-4 ${isWidescreen ? '' : 'mt-6'}`}>
              <div className="p-5 rounded-2xl bg-neutral-950/80 border-2 border-neutral-800">
                <div className="w-12 h-12 rounded-xl bg-[#6d3c17] text-[#e8b568] flex items-center justify-center mb-4 border border-[#c89346]/40">
                  <Film className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-white uppercase">Lustige Videos & Sketche</h4>
                <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                  Die besten Clips, Flachwitze und skurrilen Dialoge für deinen täglichen Lachflash.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-950/80 border-2 border-neutral-800">
                <div className="w-12 h-12 rounded-xl bg-[#6d3c17] text-[#e8b568] flex items-center justify-center mb-4 border border-[#c89346]/40">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-white uppercase">Kult-Charaktere</h4>
                <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                  Erlebe die Bahndidos und die komplette Park-Crew in ihren neuesten Abenteuern.
                </p>
              </div>
              <button
                type="button"
                onClick={scrollToVideos}
                className="self-start flex items-center gap-1.5 text-sm font-bold text-[#c89346] hover:text-white transition-colors cursor-pointer"
              >
                <span>Zu den Videos scrollen</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 mx-auto w-full max-w-[280px]">
          <p className="mb-2 text-center text-sm font-black uppercase tracking-wide text-[#e8b568]">Parkbank Duell Trailer</p>
          <video
            className="w-full rounded-2xl border-2 border-[#c89346]/40 bg-black"
            style={{ aspectRatio: '1080 / 1350' }}
            controls
            playsInline
            preload="none"
            poster="/assets/posters/duell-trailer.jpg?v=frame"
            controlsList="nodownload"
            title="Parkbank Duell Trailer"
          >
            <source src="https://pub-b2dbd42a03674a94b543b5fd499d6a9e.r2.dev/Sketches%2016zu9/duell_trailer_Full%20HD%201080p_MEDIUM_FR24.mp4" type="video/mp4" />
          </video>
        </div>

        <div className={`mb-12 text-left ${isWidescreen ? 'grid grid-cols-2 gap-6 items-stretch' : 'flex flex-col gap-6'}`}>
          <div id="spiel" className="h-full scroll-mt-20 p-6 sm:p-7 rounded-2xl bg-neutral-900/90 border-2 border-neutral-800 hover:border-[#c89346] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#6d3c17] text-[#e8b568] flex items-center justify-center border border-[#c89346]/40 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#6d3c17]/60 text-[#e8b568] text-[11px] font-black uppercase tracking-wider border border-[#c89346]/40">
                  Offizielles Game
                </span>
              </div>

              {/* Cover Art Preview - Icon komplett sichtbar */}
              <div className="w-full flex justify-center mb-4">
                <div className="w-36 sm:w-44 aspect-square rounded-2xl overflow-hidden border-2 border-[#c89346]/40 shadow-xl bg-black">
                  <img 
                    src="/assets/parkbank-duell.webp" 
                    alt="Parkbank-Duell, kostenloses Wort-Duell im Browser"
                    title="Parkbank Duell"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              <h4 className="text-xl font-black text-white uppercase group-hover:text-[#c89346] transition-colors text-center sm:text-left">
                Parkbank-Duell
              </h4>
              <p className="mt-2 text-sm text-neutral-300 leading-relaxed text-center sm:text-left">
                Parkbank-Duell ist das kostenlose Wort-Duell direkt im Browser. Du sitzt selbst auf der Bank und zeigst, wie schlagfertig du bist. Kein Download und keine Extra-App. Wer angemeldet ist, löst den Geschenkcode im Spiel unter Einstellungen ein.
              </p>
              <a
                href="https://duell.bankgeheimnisimpark.de"
                title="Parkbank-Duell spielen"
                className="mt-3 inline-block text-sm font-bold text-[#e8b568] underline underline-offset-2"
              >
                Parkbank-Duell: kostenloses Wort-Duell online spielen
              </a>

              <div className="mt-4 pt-4 border-t border-neutral-800/80 w-full">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#e8b568] flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#c89346]" />
                    <span>Geschenkcode</span>
                    {!currentUser && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[9px] font-bold">
                        <Lock className="w-2.5 h-2.5 text-[#e8b568]" />
                        <span>Gesperrt</span>
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-neutral-400 text-right">
                    {!currentUser
                      ? 'Anmelden zum Aufdecken'
                      : isGiftCodeRevealed
                      ? 'Antippen zum Kopieren'
                      : 'Antippen zum Aufdecken'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      setAuthHint('');
                      setAuthTab('login');
                      setRegisterForVip(false);
                      setIsAuthModalOpen(true);
                      return;
                    }
                    if (!isGiftCodeRevealed) setIsGiftCodeRevealed(true);
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText('ALMANOPA');
                    }
                    setIsGiftCodeCopied(true);
                    showToast(isGiftCodeRevealed ? 'Code ALMANOPA kopiert.' : 'Code ALMANOPA aufgedeckt.');
                    setTimeout(() => setIsGiftCodeCopied(false), 2500);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    !currentUser
                      ? 'bg-neutral-950/80 hover:bg-neutral-900 border-neutral-800 hover:border-[#c89346]/60 text-neutral-300'
                      : isGiftCodeRevealed
                      ? 'bg-[#1e1308] border-[#c89346] text-[#fcd34d]'
                      : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {!currentUser ? (
                      <>
                        <Lock className="w-4 h-4 text-[#e8b568] shrink-0" />
                        <span className="font-mono tracking-widest text-neutral-500 text-sm font-bold">••••••••</span>
                      </>
                    ) : isGiftCodeRevealed ? (
                      <span className="font-mono font-black text-sm sm:text-base tracking-widest text-[#fcd34d]">ALMANOPA</span>
                    ) : (
                      <>
                        <span className="font-mono tracking-widest text-neutral-400 text-sm font-bold">••••••••</span>
                        <span className="text-[11px] font-bold text-neutral-400">Aufdecken</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold shrink-0">
                    {!currentUser ? (
                      <span className="text-[#e8b568]">Anmelden</span>
                    ) : isGiftCodeCopied ? (
                      <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Kopiert</span>
                    ) : isGiftCodeRevealed ? (
                      <span className="text-[#e8b568] flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Kopieren</span>
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                </button>
                <p className="mt-2 text-[11px] text-neutral-400 leading-snug">
                  Einlösen im Spiel unter Einstellungen – Einlösen.
                </p>
              </div>
            </div>

            {/* Jetzt spielen Button - öffnet direkt im neuen Tab ohne Kasten */}
            <a 
              href="https://duell.bankgeheimnisimpark.de"
              title="Parkbank Duell spielen"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white text-sm sm:text-base font-black border-2 border-[#c89346] shadow-lg transition-transform active:scale-95 cursor-pointer text-center"
            >
              <Gamepad2 className="w-4 h-4 text-[#e8b568]" />
              <span>Jetzt spielen</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#e8b568]/80" />
            </a>
          </div>

        {/* Deutscher Humor genau nach deinem Geschmack & CTA */}
        <div className="h-full p-6 sm:p-7 rounded-2xl bg-neutral-900/90 border-2 border-neutral-800 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              Deutscher Humor genau nach deinem Geschmack
            </h3>
            <p className="mt-3 text-neutral-300 text-base leading-relaxed">
              Egal ob du nach Feierabend einfach abschalten willst oder die neuesten Videos unserer Parkbank-Legenden suchst: Bankgeheimnis im Park liefert dir tägliche Unterhaltung, die sitzt. Schau dir die aktuellen Clips an oder starte direkt eine Runde in unseren Online-Games!
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAuthTab(currentUser ? 'login' : 'register');
              setRegisterForVip(false);
              setIsAuthModalOpen(true);
            }}
            className="mt-5 self-end px-6 py-3 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-black text-sm border-2 border-[#c89346] shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            {currentUser ? 'Mein Konto' : 'Kostenlos anmelden'}
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
            Offizielle Parkbank-Pässe
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase mt-1">
            PARK-SCHEIN & PARKAUSWEIS
          </h2>
          <p className="mt-2 text-lg text-neutral-300">
            Wähle deinen Zugang: Kostenloser Einstieg oder voller VIP-Zugang mit dem Ehren-Parkausweis!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Karte 1: Standard-Parkschein (Ticket-Karten-Design) */}
          <div className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-8 rounded-3xl border-2 border-neutral-800 hover:border-neutral-700 transition-all shadow-xl flex flex-col justify-between relative group">
            {/* Karten-Kopfstreifen */}
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 border border-neutral-700">
                    <Ticket className="w-4 h-4 text-neutral-300" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
                    PARK-SCHEIN
                  </span>
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-neutral-200 bg-neutral-800/90 border border-neutral-700 px-2.5 py-1 rounded-lg shadow-sm">
                  Standart-Pass
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Standard-Parkschein
              </h3>
              <p className="text-sm font-semibold text-neutral-400 mt-1">
                Kostenloser Einstieg auf der Parkbank
              </p>

              <div className="mt-4 pt-4 border-t border-dashed border-neutral-800 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">Kostenlos</span>
                <span className="text-xs text-neutral-500 font-medium">/ Dauerhafter Zugriff</span>
              </div>

              {/* Bullet-Liste laut Vorgabe */}
              <ul className="mt-6 space-y-3 text-sm sm:text-base text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-[#e8b568] flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">✓</span>
                  <span>Feste Auswahl beliebter Park-Sketche</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-[#e8b568] flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">✓</span>
                  <span>Alle Highlights übersichtlich an einem Ort</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-[#e8b568] flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">✓</span>
                  <span>Kein nerviges Suchen im Social-Media-Feed</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-[#e8b568] flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">✓</span>
                  <span>Direkt und komplett kostenlos abspielen</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => {
                if (currentUser) {
                  showToast('Du bist bereits angemeldet! Viel Spaß beim Reinschauen.');
                  setIsAuthModalOpen(true);
                } else {
                  setAuthTab('register');
                  setRegisterForVip(false);
                  setIsAuthModalOpen(true);
                }
              }}
              className="mt-8 w-full py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-base sm:text-lg cursor-pointer transition-all border border-neutral-700 flex items-center justify-center gap-2"
            >
              <span>Kostenlos reinschauen</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          {/* Karte 2: Ehren-Parkausweis (Premium Parkausweis-Karten-Design) */}
          <div className="bg-gradient-to-b from-[#1b120a] via-neutral-900 to-neutral-950 p-6 sm:p-8 rounded-3xl border-2 border-[#c89346] shadow-[0_0_50px_rgba(200,147,70,0.22)] flex flex-col justify-between relative group">
            <div>
              {/* Karten-Kopfstreifen */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#c89346]/40">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#6d3c17] flex items-center justify-center text-[#e8b568] border border-[#c89346]/50 shadow">
                    <Award className="w-4 h-4 text-[#e8b568]" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#e8b568]">
                    PARKAUSWEIS
                  </span>
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#fcd34d] bg-[#6d3c17]/90 border border-[#c89346] px-2.5 py-1 rounded-lg shadow-sm">
                  Ehren-Pass
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#e8b568] tracking-tight flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#c89346]" />
                <span>Ehren-Parkausweis</span>
              </h3>
              <p className="text-sm font-semibold text-neutral-300 mt-1">
                Voller Zugang zum kompletten Park
              </p>

              <div className="mt-4 pt-4 border-t border-dashed border-[#c89346]/40 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">3,99 €</span>
                <span className="text-xs sm:text-sm font-medium text-neutral-400">/ Monat (Jederzeit kündbar)</span>
              </div>

              {/* Bullet-Liste laut Vorgabe */}
              <ul className="mt-6 space-y-3 text-sm sm:text-base text-neutral-200">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#6d3c17] text-[#e8b568] border border-[#c89346]/50 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black shadow-sm">✓</span>
                  <span>Zugriff auf das komplette Video-Archiv</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#6d3c17] text-[#e8b568] border border-[#c89346]/50 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black shadow-sm">✓</span>
                  <span>Bekannte Social-Media-Clips in 16:9 & 4K</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#6d3c17] text-[#e8b568] border border-[#c89346]/50 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black shadow-sm">✓</span>
                  <span>Exklusive, unveröffentlichte Premium-Sketche</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#6d3c17] text-[#e8b568] border border-[#c89346]/50 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black shadow-sm">✓</span>
                  <span>Neue Videos vorab vor allen anderen sehen</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#6d3c17] text-[#e8b568] border border-[#c89346]/50 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black shadow-sm">✓</span>
                  <span>Entspanntes Durchschauen dank Autoplay-Funktion</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#6d3c17] text-[#e8b568] border border-[#c89346]/50 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black shadow-sm">✓</span>
                  <span>Monatlicher Bonus für „Parkbank-Duell“ (Charaktere, Sticker & mehr)</span>
                </li>
              </ul>
            </div>
            
            <button 
              onClick={() => {
                if (isVipUnlocked) {
                  openAboPortal();
                } else {
                  startAbo();
                }
              }}
              className="mt-8 w-full py-3.5 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-black text-base sm:text-lg transition-transform active:scale-95 shadow-xl border-2 border-[#c89346] cursor-pointer flex items-center justify-center gap-2"
            >
              {isVipUnlocked ? (
                <>
                  <Check className="w-5 h-5 text-[#e8b568]" />
                  <span>Abo verwalten</span>
                </>
              ) : (
                <>
                  <Award className="w-5 h-5 text-[#e8b568]" />
                  <span>Ehren-Parkausweis sichern</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
      </main>

      {/* FOOTER */}
      <footer role="contentinfo" className="w-full py-12 px-4 sm:px-6 text-center border-t border-neutral-900 bg-black">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
        <nav aria-label="Inhalt" className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-bold text-[#e8b568]">
          <a href="/" title="Startseite">Start</a>
          <a href="#video-section" title="Zu den Sketchen">Sketche</a>
          <a href="#spiel" title="Zum Spiel und Geschenkcode">Spiel</a>
          <a href="https://duell.bankgeheimnisimpark.de" title="Parkbank-Duell spielen">Parkbank-Duell online spielen</a>
        </nav>
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-1">
            <p className="font-medium text-neutral-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} Bankgeheimnis im Park. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#e8b568] transition-colors cursor-pointer"
                title="Homepage & Logo teilen"
              >
                <Share2 className="w-3.5 h-3.5 text-[#e8b568]" />
                <span>Teilen</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isAdminAuthenticated) {
                    setIsAdminPanelOpen(true);
                  } else {
                    setIsAdminAuthModalOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#e8b568] transition-colors cursor-pointer"
                title="Admin-Bereich öffnen (PIN geschützt)"
              >
                <Shield className="w-3.5 h-3.5 text-[#e8b568]" />
                <span>Admin-Panel</span>
              </button>
            </div>
          </div>
          <p className="text-sm sm:text-base text-[#c89346] font-extrabold mt-2 tracking-wide">
            Comedy, Sketche & Geheimnisse von der wohl berühmtesten Parkbank Deutschlands.
          </p>
          <p className="mt-3 text-[11px] text-neutral-500">Sketche mit KI erzeugt.</p>
        </div>
      </footer>



      {/* ============================================================ */}
      {/* MODAL: ANMELDUNG & MITGLIEDERKONTO                           */}
      {/* ============================================================ */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn" style={{ zIndex: 200 }}>
          <div className="w-full max-w-md my-auto bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#c89346] shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
            
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
                      <span>{currentUser.isVip ? 'Ehren-Parkausweis (Aktiv)' : 'Standard-Parkschein'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-sm space-y-2">
                  <div className="flex justify-between text-neutral-300">
                    <span>Mitglied seit:</span>
                    <span className="font-bold text-white">{currentUser.memberSince}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Ausweis-Status:</span>
                    <span className={`font-bold ${currentUser.isVip ? 'text-[#e8b568]' : 'text-neutral-400'}`}>
                      {currentUser.isVip ? 'Ehren-Parkausweis aktiv' : 'Standard-Parkschein'}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Vorab-Folgen:</span>
                    <span className="font-bold text-[#e8b568]">
                      {currentUser.isVip ? 'Verfügbar' : 'Gesperrt'}
                    </span>
                  </div>
                </div>

                {!currentUser.isVip ? (
                  <button
                    onClick={startAbo}
                    className="w-full py-3 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-bold text-base border border-[#c89346] shadow cursor-pointer transition-all"
                  >
                    Jetzt Ehren-Parkausweis sichern (3,99 €/Monat)
                  </button>
                ) : (
                  <button
                    onClick={openAboPortal}
                    className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[#e8b568] font-bold text-base border border-[#c89346] shadow cursor-pointer transition-all"
                  >
                    Abo verwalten oder kündigen
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
                        autoFocus
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
                        <span>Ehren-Parkausweis aktivieren (3,99 €/Monat)</span>
                      </label>
                    </div>
                  )}

                  {authHint && (
                    <p className="text-sm text-[#e8b568] leading-snug">{authHint}</p>
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
      {/* REINER VIDEOPLAYER - DIREKT, VOLLBILD & OHNE STÖRENDE ELEMENTE */}
      {/* ============================================================ */}
      {playingVideo && (
        <div 
          ref={cinemaContainerRef}
          className={`fixed inset-0 bg-black text-white flex flex-col overflow-hidden animate-fadeIn ${isAuthModalOpen ? 'z-10' : 'z-[90]'}`}
        >
          {/* Player-Kopf: Titel, Autoplay-Umschalter, Nächster Clip, Schließen */}
          <div className="h-14 sm:h-16 px-3 sm:px-6 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e8b568] animate-pulse shrink-0" />
              <h2 className="text-white font-black text-sm sm:text-base md:text-lg truncate max-w-xs sm:max-w-md md:max-w-xl">
                {playingVideo.title}
              </h2>
              <span className="hidden sm:inline text-[10px] font-medium text-neutral-500 shrink-0">KI</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Autoplay-Einstellung direkt im Player */}
              <button
                type="button"
                onClick={toggleAutoplay}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isAutoplay && isVipUnlocked
                    ? 'bg-[#6d3c17] text-[#f7e0b5] border-[#c89346] shadow-sm'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}
                title="Autoplay: Automatisch nächsten Clip starten"
              >
                {!isVipUnlocked && <Lock className="w-3.5 h-3.5 text-[#e8b568]" />}
                <span className="hidden sm:inline">Autoplay:</span>
                <span className={isAutoplay && isVipUnlocked ? 'text-[#e8b568] font-black' : 'text-neutral-400'}>
                  {isAutoplay && isVipUnlocked ? 'AN' : 'AUS'}
                </span>
              </button>

              {/* Nächster Clip Button im Header */}
              {currentCategoryPlaylist.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleNextClip(true)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-neutral-700 hover:border-[#c89346] transition-colors cursor-pointer shadow-sm active:scale-95"
                  title="Nächsten Clip abspielen"
                >
                  <SkipForward className="w-4 h-4 text-[#e8b568]" />
                  <span className="hidden xs:inline">Nächster Clip</span>
                </button>
              )}

              {/* Schließen Button */}
              <button
                type="button"
                onClick={handleCloseCinema}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-neutral-700 hover:border-[#c89346] transition-colors cursor-pointer shrink-0 shadow-sm active:scale-95"
                title="Player schließen (Esc)"
              >
                <X className="w-4 h-4 text-[#e8b568]" />
                <span className="hidden sm:inline">Schließen</span>
              </button>
            </div>
          </div>

          {/* Reiner Videobereich - 100% Fläche */}
          <div className="flex-1 relative flex items-center justify-center bg-black min-h-0 overflow-hidden">
            {/* Titel-Overlay NUR im Vollbildmodus bei Clip-Start (für 5,5 Sekunden) */}
            {isFullscreen && showTitleBanner && filmPhase !== 'guestLock' && (
              <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-black/90 backdrop-blur-md border-2 border-[#c89346] shadow-[0_8px_32px_rgba(0,0,0,0.9)] flex items-center gap-3 pointer-events-none transition-all duration-500 animate-fadeIn max-w-[90vw]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e8b568] animate-ping shrink-0" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#e8b568] shrink-0">
                  {filmPhase === 'intro' ? 'Gleich:' : 'Jetzt läuft:'}
                </span>
                <span className="text-sm sm:text-base md:text-lg font-black text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
                  {playingVideo.title}
                </span>
              </div>
            )}
            {playingVideo.src ? (
              filmPhase === 'guestLock' ? (
                /* Kompakte, barrierefreie Anmeldekarte für Gäste */
                <div className="w-full max-w-sm sm:max-w-md p-5 sm:p-6 mx-3 my-auto rounded-2xl sm:rounded-3xl bg-neutral-950/95 border-2 border-[#c89346] shadow-[0_0_40px_rgba(200,147,70,0.35)] flex flex-col items-center justify-center text-center animate-fadeIn max-h-[88vh] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#6d3c17] text-[#e8b568] flex items-center justify-center border border-[#c89346]/50">
                      <Lock className="w-4 h-4 text-[#e8b568]" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#e8b568]">
                      Kostenloser Sketch
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-2xl font-black text-white leading-snug mb-2">
                    Kostenlos schauen nach Anmeldung
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-300 mb-5 leading-relaxed max-w-xs">
                    Melde dich einmalig kostenlos an, um alle Parkbank-Sketche sofort und in voller Länge zu schauen.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterForVip(false);
                        setAuthTab('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-black text-sm uppercase tracking-wider border-2 border-[#c89346] shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Kostenlos anmelden</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCloseCinema}
                      className="w-full sm:w-auto py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-neutral-700 transition-colors cursor-pointer"
                    >
                      Zurück
                    </button>
                  </div>
                </div>
              ) : filmPhase === 'ende' ? (
                <div className="w-full max-w-sm p-5 sm:p-6 mx-3 my-auto rounded-2xl bg-neutral-950/95 border border-neutral-800 shadow-2xl flex flex-col items-center justify-center text-center animate-fadeIn">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">
                    Clip beendet
                  </h3>

                  <p className="text-xs text-neutral-300 mb-4 truncate max-w-xs">
                    {playingVideo.title}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setFilmPhase('film');
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase border border-neutral-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Nochmal ansehen</span>
                  </button>
                </div>
              ) : filmPhase === 'intro' ? (
                <>
                  <video
                    src={INTRO_SRC}
                    autoPlay
                    playsInline
                    preload="auto"
                    onPlaying={() => setIntroReady(true)}
                    onEnded={() => {
                      if (!currentUser) setFilmPhase('guestLock');
                      else setFilmPhase('film');
                    }}
                    className="w-full h-full max-h-full object-contain bg-black"
                  />
                  {!introReady && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                      <img
                        src="/assets/logo_gross.webp"
                        alt="Lade..."
                        className="w-[36%] max-w-[16rem] h-auto animate-pulse"
                      />
                    </div>
                  )}
                </>
              ) : (
                <video
                  key={playingVideo.id}
                  ref={videoRef}
                  src={playbackSrc(playingVideo.src)}
                  poster={playingVideo.poster}
                  controls
                  controlsList="nodownload"
                  crossOrigin="anonymous"
                  {...({ 'x-webkit-airplay': 'allow' } as Record<string, string>)}
                  autoPlay
                  playsInline
                  preload="metadata"
                  onEnded={() => {
                    if (isAutoplay && isVipUnlocked && currentCategoryPlaylist.length > 0) {
                      handleNextClip(false);
                    } else {
                      setFilmPhase('ende');
                    }
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full max-h-full object-contain bg-black"
                />
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
        </div>
      )}

      {/* ============================================================ */}
      {/* ADMIN AUTHENTIFIZIERUNG (PIN-ABFRAGE)                        */}
      {/* ============================================================ */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={() => {
          setIsAdminAuthModalOpen(false);
          setIsAdminAuthenticated(true);
          setIsAdminPanelOpen(true);
          showToast('🔓 Admin-Bereich freigeschaltet!');
        }}
        adminPin={adminPin}
      />

      {/* ============================================================ */}
      {/* ADMIN PANEL (DASHBOARD)                                      */}
      {/* ============================================================ */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        users={allUsers}
        onUpdateUsers={updateUsersList}
        customVideos={customVideos}
        officialVideos={REAL_VIDEOS}
        onAddCustomVideo={handleAddCustomVideo}
        onDeleteCustomVideo={handleDeleteCustomVideo}
        onToggleVideoVip={handleToggleVideoVip}
        videoViews={videoViews}
        favorites={favoriteIds}
        adminPin={adminPin}
        onUpdateAdminPin={handleUpdateAdminPin}
        onLogoutAdmin={() => {
          setIsAdminAuthenticated(false);
          setIsAdminPanelOpen(false);
          showToast('Admin-Bereich gesperrt.');
        }}
        onImportBackup={handleImportBackup}
        showToast={showToast}
      />

      {/* ============================================================ */}
      {/* HOMEPAGE & LOGO TEILEN MODAL                                 */}
      {/* ============================================================ */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        showToast={showToast}
      />

    </div>
  );
}
