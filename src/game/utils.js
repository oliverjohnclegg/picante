export function randomInt(max) {
  return Math.floor(Math.random() * max);
}

export function pickRandom(items) {
  if (!items.length) {
    return null;
  }
  return items[randomInt(items.length)];
}

export function pickRandomMany(items, count) {
  const pool = [...items];
  const picks = [];
  const targetCount = Math.min(count, pool.length);
  while (picks.length < targetCount) {
    const index = randomInt(pool.length);
    picks.push(pool[index]);
    pool.splice(index, 1);
  }
  return picks;
}

export function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const temp = next[i];
    next[i] = next[j];
    next[j] = temp;
  }
  return next;
}

export function distributeRandomly(playerIds, total) {
  const result = Object.fromEntries(playerIds.map((id) => [id, 0]));
  if (!playerIds.length || total <= 0) {
    return result;
  }
  for (let i = 0; i < total; i += 1) {
    const targetId = playerIds[randomInt(playerIds.length)];
    result[targetId] += 1;
  }
  return result;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
