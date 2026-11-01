/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Share2, Download, Copy, Check, Sparkles, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, showToast }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://bankgeheimnisimpark.de';
  const shareText = 'Comedy Deutsch & unzensierte Parkbank-Satire mit den Bahndidos, Alman Opa & Omma – schau mal rein!';

  // Nativer Web-Share
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Bankgeheimnis im Park',
          text: shareText,
          url: currentUrl
        });
        showToast('🎉 Danke fürs Weitersagen!');
        onClose();
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    handleCopyLink();
  };

  // Link kopieren
  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        showToast('📋 Link zur Homepage in Zwischenablage kopiert!');
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      showToast('🔗 Homepage: ' + currentUrl);
    }
  };

  // Offizielles Logo herunterladen
  const handleDownloadLogo = () => {
    const link = document.createElement('a');
    link.href = '/assets/aistudio/logo_icon_8e8b5bd2.png';
    link.download = 'bankgeheimnis_im_park_logo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Offizielles Logo wird heruntergeladen!');
  };

  // Social Share URLs
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-sm my-auto bg-neutral-950 rounded-2xl sm:rounded-3xl border-2 border-[#c89346] shadow-[0_0_50px_rgba(200,147,70,0.35)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6d3c17] text-[#e8b568] flex items-center justify-center border border-[#c89346]/50">
              <Share2 className="w-4 h-4 text-[#e8b568]" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wide">
              Homepage & Logo teilen
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-center">
          
          {/* Logo-Vorschaukarte */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center">
            <div className="relative w-24 h-24 mb-3 rounded-2xl overflow-hidden border border-[#c89346]/60 shadow-xl bg-white p-1">
              <img
                src="/assets/aistudio/logo_icon_8e8b5bd2.png"
                alt="Bankgeheimnis im Park Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h4 className="font-extrabold text-white text-sm">
              Bankgeheimnis im Park
            </h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Offizielles Emblem & Portal für Parkbank-Comedy
            </p>
          </div>

          {/* Hauptaktionen: Logo herunterladen & Teilen */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadLogo}
              className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-neutral-700 hover:border-[#c89346] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
              title="Logo als Bilddatei speichern"
            >
              <Download className="w-3.5 h-3.5 text-[#e8b568]" />
              <span>Logo sichern</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-black text-xs uppercase tracking-wider border border-[#c89346] shadow transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Jetzt teilen</span>
            </button>
          </div>

          {/* Link kopieren */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                copied
                  ? 'bg-[#6d3c17] text-[#e8b568] border-[#c89346]'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:border-[#c89346]'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-[#e8b568]" /> : <Copy className="w-4 h-4 text-[#e8b568]" />}
              <span>{copied ? 'Link kopiert!' : 'Homepage-Link kopieren'}</span>
            </button>
          </div>

          {/* Schnellauswahl Direkt-Apps */}
          <div className="pt-2 border-t border-neutral-900">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              Direkt versenden über
            </span>
            <div className="flex items-center justify-center gap-2">
              
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-neutral-900 hover:bg-[#25D366]/20 text-neutral-300 hover:text-[#25D366] border border-neutral-800 hover:border-[#25D366]/60 transition-all text-xs font-bold flex items-center gap-1.5"
                title="Per WhatsApp teilen"
              >
                <span>WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-neutral-900 hover:bg-[#0088cc]/20 text-neutral-300 hover:text-[#0088cc] border border-neutral-800 hover:border-[#0088cc]/60 transition-all text-xs font-bold flex items-center gap-1.5"
                title="Per Telegram teilen"
              >
                <span>Telegram</span>
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-600 transition-all text-xs font-bold flex items-center gap-1.5"
                title="Auf X teilen"
              >
                <span>X</span>
              </a>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
