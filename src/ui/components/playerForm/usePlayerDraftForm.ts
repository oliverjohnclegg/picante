import { useEffect, useState } from 'react';
import type { PlayerDraft } from '@game/playerFactory';
import type { Difficulty, Gender } from '@game/types';
import { buildPlayerDraft, DEFAULT_ABV_STR } from '@ui/components/playerForm/playerDraftInput';

export type PlayerDraftFormState = {
  name: string;
  abvStr: string;
  difficulty: Difficulty;
  gender: Gender;
  attractedTo: Gender[];
  setName: (v: string) => void;
  setAbvStr: (v: string) => void;
  setDifficulty: (v: Difficulty) => void;
  setGender: (v: Gender) => void;
  toggleAttractedTo: (g: Gender) => void;
  toDraft: () => PlayerDraft | null;
};

export function usePlayerDraftForm({
  active,
  initial,
}: {
  active: boolean;
  initial: PlayerDraft | null;
}): PlayerDraftFormState {
  const [name, setName] = useState('');
  const [abvStr, setAbvStr] = useState(DEFAULT_ABV_STR);
  const [difficulty, setDifficulty] = useState<Difficulty>('tradicional');
  const [gender, setGender] = useState<Gender>('man');
  const [attractedTo, setAttractedTo] = useState<Gender[]>([]);

  useEffect(() => {
    if (!active) return;
    if (initial) {
      setName(initial.name);
      setAbvStr(String(Math.round(initial.abv * 100)));
      setDifficulty(initial.difficulty);
      setGender(initial.gender);
      setAttractedTo([...initial.attractedTo]);
      return;
    }
    setName('');
    setAbvStr(DEFAULT_ABV_STR);
    setDifficulty('tradicional');
    setGender('man');
    setAttractedTo([]);
  }, [active, initial]);

  function toggleAttractedTo(g: Gender) {
    setAttractedTo((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function toDraft(): PlayerDraft | null {
    return buildPlayerDraft({ name, abvStr, difficulty, gender, attractedTo });
  }

  return {
    name,
    abvStr,
    difficulty,
    gender,
    attractedTo,
    setName,
    setAbvStr,
    setDifficulty,
    setGender,
    toggleAttractedTo,
    toDraft,
  };
}
