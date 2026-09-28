import { NotificationPriority } from '../types/notifications';

const SOUND_PREF_KEY = 'gb_notification_sound_enabled';
let audioCtx: AudioContext | null = null;
let lastSoundTime = 0;

/**
 * Check if notification audio is enabled in user preferences
 */
export function isNotificationSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const pref = localStorage.getItem(SOUND_PREF_KEY);
  return pref === null ? true : pref === 'true';
}

/**
 * Update user notification audio preference
 */
export function setNotificationSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_PREF_KEY, enabled ? 'true' : 'false');
}

/**
 * Plays a subtle, elegant synthesized notification chime using the Web Audio API.
 * High priority: pleasant dual-tone chime (587Hz D5 -> 880Hz A5)
 * Critical priority: attention-getting triple-tone chime
 */
export function playNotificationSound(
  priority: NotificationPriority = NotificationPriority.NORMAL
): void {
  if (typeof window === 'undefined') return;

  // Sound only allowed for HIGH and CRITICAL events
  if (priority !== NotificationPriority.HIGH && priority !== NotificationPriority.CRITICAL) {
    return;
  }

  if (!isNotificationSoundEnabled()) {
    return;
  }

  // Deduplication: prevent multiple sounds within 4 seconds
  const now = Date.now();
  if (now - lastSoundTime < 4000) {
    return;
  }
  lastSoundTime = now;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const ctx = audioCtx;
    const startTime = ctx.currentTime + 0.05;

    // Frequencies: High = pleasant upward chime; Critical = slightly more prominent triad
    const notes =
      priority === NotificationPriority.CRITICAL
        ? [523.25, 659.25, 783.99] // C5, E5, G5
        : [587.33, 880.0]; // D5, A5

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + index * 0.09);

      // Volume envelope (gentle attack, soft decay)
      gain.gain.setValueAtTime(0.0001, startTime + index * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + index * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + index * 0.09 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + index * 0.09);
      osc.stop(startTime + index * 0.09 + 0.25);
    });
  } catch {
    // Autoplay restrictions or unsupported browser: fail silently
  }
}
