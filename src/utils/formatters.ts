export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatTimeHoursMins(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} phút`
  if (mins === 0) return `${hours} giờ`
  return `${hours} giờ ${mins} phút`
}

export function countWords(text: string): number {
  if (!text) return 0
  const words = text.trim().match(/\b[A-Za-z0-9'-]+\b/g)
  return words ? words.length : 0
}

export function calculateBand(correctCount: number, totalQuestions: number = 40): number {
  const percentage = (correctCount / totalQuestions) * 100
  if (percentage >= 88) return 9.0
  if (percentage >= 80) return 8.5
  if (percentage >= 75) return 8.0
  if (percentage >= 68) return 7.5
  if (percentage >= 60) return 7.0
  if (percentage >= 53) return 6.5
  if (percentage >= 45) return 6.0
  if (percentage >= 38) return 5.5
  if (percentage >= 30) return 5.0
  if (percentage >= 23) return 4.5
  return 4.0
}
