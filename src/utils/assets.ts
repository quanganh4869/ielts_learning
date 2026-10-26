/**
 * IELTS Platform Global Visual Asset Manifest
 * Centralized, typed references for all logos, brand illustrations,
 * skill visuals, curriculum milestones, exam covers, and empty states.
 */

export const PLATFORM_ASSETS = {
  brand: {
    logoFull: '/brand/logo-full.png',
    logoHorizontal: '/brand/logo-horizontal.png',
    logoWordmark: '/brand/logo-wordmark.png',
    favicon: '/favicon.svg',
    nori: {
      mascot: '/brand/nori-mascot.png',
      mascotSm: '/brand/nori-mascot-sm.png',
      study: '/brand/nori-study.png',
      celebrate: '/brand/nori-celebrate.png',
      empty: '/brand/nori-empty.png',
    },
  },
  skills: {
    listening: '/visuals/skill-listening.svg',
    reading: '/visuals/skill-reading.svg',
    writing: '/visuals/skill-writing.svg',
    speaking: '/visuals/skill-speaking.svg',
  },
  phases: {
    foundation: '/visuals/phase-foundation.svg',
    intensive: '/visuals/phase-intensive.svg',
    mastery: '/visuals/phase-mastery.svg',
  },
  practice: {
    vocabulary: '/visuals/practice-vocab.svg',
    grammar: '/visuals/practice-grammar.svg',
    listening: '/visuals/skill-listening.svg',
    reading: '/visuals/skill-reading.svg',
    writing: '/visuals/skill-writing.svg',
    speaking: '/visuals/skill-speaking.svg',
  },
  exams: {
    cdiSimulation: '/visuals/mock-cdi-exam.svg',
    sampleTasks: '/visuals/skill-reading.svg',
    academicFull: '/visuals/mock-cdi-exam.svg',
  },
  empty: {
    default: '/brand/nori-empty.png',
  },
  stickers: {
    metrics: {
      lessons: '/stickers/metric-lessons.webp',
      time: '/stickers/metric-time.webp',
      week: '/stickers/metric-week.webp',
      streak: '/stickers/metric-streak.webp',
    },
    activities: {
      upnext: '/stickers/activity-upnext.webp',
      write: '/stickers/activity-write.webp',
      game: '/stickers/activity-game.webp',
    },
    nav: {
      dashboard: '/stickers/nav-dashboard.webp',
      roadmap: '/stickers/nav-roadmap.webp',
      practice: '/stickers/nav-practice.webp',
      mock: '/stickers/nav-games.webp',
      tutor: '/stickers/nav-tutor.webp',
      stats: '/stickers/nav-stats.webp',
      account: '/stickers/nav-account.webp',
    },
  },
} as const

export type SkillName = 'listening' | 'reading' | 'writing' | 'speaking'

export const SKILL_COLORS: Record<
  SkillName,
  {
    themeColor: string
    accentColor: string
    bgLight: string
    badgeBg: string
    border: string
    iconColor: string
    label: string
  }
> = {
  listening: {
    themeColor: '#0284C7',
    accentColor: '#0369A1',
    bgLight: '#E0F2FE',
    badgeBg: 'bg-sky-50',
    border: 'border-sky-200',
    iconColor: 'text-sky-700',
    label: 'Listening',
  },
  reading: {
    themeColor: '#D97706',
    accentColor: '#B45309',
    bgLight: '#FEF3C7',
    badgeBg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-700',
    label: 'Reading',
  },
  writing: {
    themeColor: '#059669',
    accentColor: '#047857',
    bgLight: '#DCFCE7',
    badgeBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-700',
    label: 'Writing',
  },
  speaking: {
    themeColor: '#7C3AED',
    accentColor: '#6D28D9',
    bgLight: '#F3E8FF',
    badgeBg: 'bg-purple-50',
    border: 'border-purple-200',
    iconColor: 'text-purple-700',
    label: 'Speaking',
  },
}
