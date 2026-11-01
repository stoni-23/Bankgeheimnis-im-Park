/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Shield, Key, Lock, Eye, EyeOff } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminPin: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminPin
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === adminPin.trim()) {
      setHasError(false);
      setPinInput('');
      onSuccess();
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-sm my-auto bg-neutral-950 rounded-2xl sm:rounded-3xl border-2 border-[#c89346] shadow-[0_0_40px_rgba(200,147,70,0.35)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6d3c17] text-[#e8b568] flex items-center justify-center border border-[#c89346]/50">
              <Shield className="w-4 h-4 text-[#e8b568]" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wide">
              Admin-Zugang
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setPinInput('');
              setHasError(false);
              onClose();
            }}
            className="text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#6d3c17]/30 border border-[#c89346]/40 flex items-center justify-center mx-auto mb-3 text-[#e8b568]">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">
              Administrator-Bereich freischalten
            </h4>
            <p className="text-xs text-neutral-400 mt-1">
              Bitte gib den Admin-PIN oder das Master-Passwort ein.
            </p>
          </div>

          <div>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                autoFocus
                required
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (hasError) setHasError(false);
                }}
                placeholder="Admin-PIN eingeben"
                className={`w-full px-4 py-2.5 pr-10 rounded-xl bg-neutral-900 border text-white text-center text-base tracking-widest font-mono focus:outline-none transition-colors ${
                  hasError
                    ? 'border-red-500 focus:border-red-500 animate-shake'
                    : 'border-neutral-800 focus:border-[#c89346]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {hasError && (
              <p className="text-red-400 text-xs font-bold text-center mt-2 animate-fadeIn">
                Falscher PIN! Bitte erneut versuchen.
              </p>
            )}
            
            <p className="text-[11px] text-neutral-500 text-center mt-2">
              (Standard-PIN: <span className="text-[#e8b568] font-mono font-bold">1870</span>)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setPinInput('');
                setHasError(false);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase transition-colors cursor-pointer border border-neutral-800"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] text-white font-black text-xs uppercase tracking-wider border border-[#c89346] shadow transition-transform active:scale-95 cursor-pointer"
            >
              Entsperren
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
