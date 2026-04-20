import { Platform } from 'react-native';
import { isSoundEnabled } from '@platform/settingsStore';

export type SfxId = 'card_flip' | 'salud_chime' | 'ace_sting' | 'vote_countdown';

type LoadedSound = {
  replayAsync: () => Promise<unknown>;
  setPositionAsync: (ms: number) => Promise<unknown>;
  playAsync: () => Promise<unknown>;
  unloadAsync: () => Promise<unknown>;
};

type SoundModule = typeof import('expo-av');

const SFX_SOURCES: Record<SfxId, number> = {
  card_flip: require('../../assets/audio/card_flip.m4a'),
  salud_chime: require('../../assets/audio/salud_chime.m4a'),
  ace_sting: require('../../assets/audio/ace_sting.m4a'),
  vote_countdown: require('../../assets/audio/vote_countdown.m4a'),
};

const cache = new Map<SfxId, LoadedSound>();
const loading = new Map<SfxId, Promise<LoadedSound | null>>();
let expoAvPromise: Promise<SoundModule | null> | null = null;

async function loadExpoAv(): Promise<SoundModule | null> {
  if (Platform.OS === 'web') return null;
  if (!expoAvPromise) {
    expoAvPromise = import('expo-av')
      .then((mod) => mod as unknown as SoundModule)
      .catch(() => null);
  }
  return expoAvPromise;
}

async function loadSound(id: SfxId): Promise<LoadedSound | null> {
  const cached = cache.get(id);
  if (cached) return cached;
  const pending = loading.get(id);
  if (pending) return pending;

  const task = (async () => {
    const av = await loadExpoAv();
    if (!av) return null;
    try {
      const { sound } = await av.Audio.Sound.createAsync(SFX_SOURCES[id] as never, {
        shouldPlay: false,
        volume: 1,
      });
      cache.set(id, sound as unknown as LoadedSound);
      return sound as unknown as LoadedSound;
    } catch {
      return null;
    } finally {
      loading.delete(id);
    }
  })();

  loading.set(id, task);
  return task;
}

export async function play(id: SfxId): Promise<void> {
  if (!isSoundEnabled()) return;
  if (Platform.OS === 'web') return;
  try {
    const sound = await loadSound(id);
    if (!sound) return;
    await sound.setPositionAsync(0).catch(() => undefined);
    await sound.playAsync();
  } catch {
    // best-effort — never crash gameplay for a failed SFX
  }
}

export async function unloadAll(): Promise<void> {
  const entries = Array.from(cache.entries());
  cache.clear();
  loading.clear();
  await Promise.all(
    entries.map(async ([, sound]) => {
      try {
        await sound.unloadAsync();
      } catch {
        // ignore
      }
    }),
  );
}

export const sfx = { play, unloadAll };
