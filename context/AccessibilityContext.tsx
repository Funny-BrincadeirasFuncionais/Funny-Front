import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AccessibilityState {
  uppercase: boolean;
  lowSaturation: boolean;
  reduceMotion: boolean;
}

interface AccessibilityContextValue extends AccessibilityState {
  setUppercase: (v: boolean) => void;
  setLowSaturation: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  transformText: (s: string) => string;
  applyColor: (hex: string) => string;
  motionDuration: (ms: number) => number;
}

const defaultState: AccessibilityState = {
  uppercase: false,
  lowSaturation: false,
  reduceMotion: false,
};

const Ctx = createContext<AccessibilityContextValue | undefined>(undefined);

const STORAGE_KEY = 'accessibility_settings_v1';

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(defaultState);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AccessibilityState;
          setState({ ...defaultState, ...parsed });
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const transformText = (s: string) => (state.uppercase ? s.toUpperCase() : s);

  // Naive low-saturation: mix with gray (#888) by ~40%
  const applyColor = (hex: string) => {
    if (!state.lowSaturation) return hex;
    const toRgb = (h: string) => {
      const c = h.replace('#', '');
      const v = c.length === 3
        ? c.split('').map(ch => parseInt(ch + ch, 16))
        : [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
      return { r: v[0], g: v[1], b: v[2] };
    };
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    const base = toRgb(hex);
    const gray = { r: 136, g: 136, b: 136 };
    const mix = (a: number, b: number) => Math.round(a * 0.6 + b * 0.4);
    return `#${toHex(mix(base.r, gray.r))}${toHex(mix(base.g, gray.g))}${toHex(mix(base.b, gray.b))}`;
  };

  const motionDuration = (ms: number) => (state.reduceMotion ? 0 : ms);

  const value = useMemo<AccessibilityContextValue>(() => ({
    ...state,
    setUppercase: (v) => setState(s => ({ ...s, uppercase: v })),
    setLowSaturation: (v) => setState(s => ({ ...s, lowSaturation: v })),
    setReduceMotion: (v) => setState(s => ({ ...s, reduceMotion: v })),
    transformText,
    applyColor,
    motionDuration,
  }), [state.uppercase, state.lowSaturation, state.reduceMotion]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccessibility() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}
