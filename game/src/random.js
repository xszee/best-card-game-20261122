// Seeded random numbers for Lantern Duel.
//
// The whole game runs on one small generator so a screenshot scene can
// replay the exact same shuffle and the exact same AI choices from a
// seed in the URL. mulberry32 is short, fast and good enough for cards.

export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle that draws only from the seeded generator, so
// the same seed always deals the same deck.
export function shuffle(deck, rng) {
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

// Pick one element of an array with the seeded generator.
export function pickOne(list, rng) {
  return list[Math.floor(rng() * list.length)];
}
