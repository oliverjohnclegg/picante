# Audio attributions

All four samples shipped in this directory are **original works** synthesized
at build time by the Picante team using ffmpeg's `sine` oscillators. They are
licensed alongside the rest of the Picante codebase (see repository `LICENSE`)
and carry no third-party attribution requirements.

If you want to swap in licensed samples (e.g. from freesound.org, soundsnap,
or an agency library), replace the files in place and keep the same filenames.
The loader is purely filename-driven.

| File                | Role                                | Description                                            |
| ------------------- | ----------------------------------- | ------------------------------------------------------ |
| `card_flip.m4a`     | Every card draw                     | 80ms 800 Hz sine pluck                                 |
| `salud_chime.m4a`   | Shot takeover ("Salud!") prompt     | Rising C5 / E5 / G5 arpeggio                           |
| `ace_sting.m4a`     | Ace card reveal                     | Sub-bass 110 Hz + 55 Hz drone, 800 ms                  |
| `vote_countdown.m4a`| 3-2-1 voting tick                   | 50ms 1 kHz sine tick                                   |

Per PRD §7.5, every sample is under 50KB and lazy-loaded via `expo-av`.
