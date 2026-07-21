import React from 'react';
import { motion } from 'motion/react';
import { OrbState } from '../context/AIContext';

interface DynamicOrbProps {
  state: OrbState;
  volume?: number; // 0 to 100
  size?: number; // px
  onClick?: () => void;
}

export default function DynamicOrb({ state, volume = 0, size = 200, onClick }: DynamicOrbProps) {
  // Scale pulse based on state and microphone volume
  const scaleVolume = 1 + Math.min(volume, 100) / 150;

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      style={{ width: size, height: size }}
    >
      {/* Outer Glowing Aura */}
      <motion.div
        animate={{
          scale: state === 'listening' ? [scaleVolume, scaleVolume * 1.15, scaleVolume] : [1, 1.08, 1],
          opacity: state === 'speaking' ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: state === 'thinking' ? 1.2 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute inset-0 rounded-full blur-2xl transition-colors duration-700 ${
          state === 'listening'
            ? 'bg-amber-500/40'
            : state === 'thinking'
            ? 'bg-indigo-500/50'
            : state === 'speaking'
            ? 'bg-emerald-500/50'
            : state === 'interrupted'
            ? 'bg-rose-500/50'
            : state === 'reconnecting'
            ? 'bg-amber-600/30'
            : 'bg-amber-500/20 group-hover:bg-amber-500/30'
        }`}
      />

      {/* Reactive Concentric Wave Rings for Listening / Speaking */}
      {(state === 'listening' || state === 'speaking') && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.6],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className={`absolute inset-0 rounded-full border-2 ${
              state === 'listening' ? 'border-amber-400/60' : 'border-emerald-400/60'
            }`}
          />
          <motion.div
            animate={{
              scale: [1, 1.9],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className={`absolute inset-0 rounded-full border ${
              state === 'listening' ? 'border-amber-300/40' : 'border-emerald-300/40'
            }`}
          />
        </>
      )}

      {/* Swirling Ring for Thinking State */}
      {(state === 'thinking' || state === 'reconnecting') && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-4 rounded-full border-2 border-dashed border-indigo-400/60"
        />
      )}

      {/* Core Fluid Sphere */}
      <motion.div
        animate={{
          scale: state === 'listening' ? scaleVolume : 1,
          rotate: state === 'thinking' ? [0, 180, 360] : [0, 90, 0],
        }}
        transition={{
          duration: state === 'thinking' ? 4 : 8,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={`relative w-full h-full rounded-full shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700 ${
          state === 'listening'
            ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 shadow-amber-500/50'
            : state === 'thinking'
            ? 'bg-gradient-to-tr from-indigo-700 via-purple-600 to-pink-500 shadow-purple-500/50'
            : state === 'speaking'
            ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-300 shadow-teal-500/50'
            : state === 'interrupted'
            ? 'bg-gradient-to-tr from-rose-700 via-red-600 to-orange-500 shadow-rose-500/50'
            : state === 'reconnecting'
            ? 'bg-gradient-to-tr from-slate-700 via-slate-800 to-amber-800 shadow-amber-600/30'
            : 'bg-gradient-to-tr from-slate-800 via-amber-700/80 to-amber-500/90 shadow-amber-600/30'
        }`}
      >
        {/* Inner Liquid Highlight */}
        <div className="absolute top-2 left-4 w-1/2 h-1/2 rounded-full bg-white/25 blur-md transform -rotate-45" />

        {/* Center Visual State Icon or Status Text */}
        <div className="relative z-10 text-center font-medium text-white drop-shadow-md">
          {state === 'idle' && (
            <span className="text-xs tracking-widest uppercase opacity-80 font-mono">HistoLab AI</span>
          )}
          {state === 'listening' && (
            <span className="text-xs tracking-wider uppercase font-bold animate-pulse">Mendengarkan</span>
          )}
          {state === 'thinking' && (
            <span className="text-xs tracking-wider uppercase font-bold animate-pulse">Berpikir</span>
          )}
          {state === 'speaking' && (
            <span className="text-xs tracking-wider uppercase font-bold">Membaca</span>
          )}
          {state === 'interrupted' && (
            <span className="text-xs tracking-wider uppercase font-bold text-rose-200">Disela</span>
          )}
          {state === 'reconnecting' && (
            <span className="text-xs tracking-wider uppercase font-bold animate-pulse text-amber-200">Menghubungkan</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
