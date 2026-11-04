/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

export interface RealVideo {
  id: string;
  youtubeId?: string;
  src?: string;
  poster?: string;
  title: string;
  duration: string;
  episodeNumber: string;
  cast: CastId[];
  isVip: boolean;
  isExclusive?: boolean; // Web-Exklusiv (nicht auf Social Media wie YouTube/TikTok)
  description?: string;
  isCustom?: boolean;
  createdAt?: string;
}

export interface UserAccount {
  id?: string;
  name: string;
  email: string;
  isVip: boolean;
  memberSince: string;
  status?: 'active' | 'suspended';
  notes?: string;
}

export interface AdminBackupData {
  version: number;
  exportedAt: string;
  users: UserAccount[];
  customVideos: RealVideo[];
  videoViews: Record<string, number>;
  favorites: string[];
  adminPin?: string;
}
