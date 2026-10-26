/**
 * Admin Console Asset Manifest & Visual Helpers
 * Centralized, type-safe references to local brand assets, icons, and illustrations.
 */

export const ADMIN_BRAND_ASSETS = {
  logo: {
    full: '/brand/logo-full.png',
    horizontal: '/brand/logo-horizontal.png',
    wordmark: '/brand/logo-wordmark.png',
    favicon: '/favicon.svg',
  },
  nori: {
    mascot: '/brand/nori-mascot.png',
    mascotSm: '/brand/nori-mascot-sm.png',
    study: '/brand/nori-study.png',
    celebrate: '/brand/nori-celebrate.png',
    empty: '/brand/nori-empty.png',
  },
  thumbnails: {
    listening: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
    reading: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    writing: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
    speaking: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
    general: 'linear-gradient(135deg, #EAF3F1 0%, #CDE3DE 100%)',
  },
}

export type SkillThemeKey = 'listening' | 'reading' | 'writing' | 'speaking' | 'general'

export const SKILL_BADGE_THEMES: Record<
  SkillThemeKey,
  { label: string; text: string; bg: string; border: string; accent: string }
> = {
  listening: {
    label: 'Listening',
    text: 'text-sky-800',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    accent: '#0284C7',
  },
  reading: {
    label: 'Reading',
    text: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    accent: '#D97706',
  },
  writing: {
    label: 'Writing',
    text: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    accent: '#059669',
  },
  speaking: {
    label: 'Speaking',
    text: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    accent: '#7C3AED',
  },
  general: {
    label: 'Tổng hợp',
    text: 'text-[#28665F]',
    bg: 'bg-[#EAF3F1]',
    border: 'border-[#28665F]/30',
    accent: '#28665F',
  },
}
