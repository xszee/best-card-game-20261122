// The cards of Lantern Duel.
//
// Four elements, each with its own suit glyph and colour. A card is one
// of three kinds: strike (hurt the rival), guard (raise your shield) or
// mend (heal your lanterns). Flame strikes burn harder when the rival
// has no shield; Tide strikes pierce two shield; Leaf mends and guards
// a little extra; Stone guards a little extra.

export const ELEMENTS = {
  flame: { name: 'Flame', glyph: '▲', color: '#ff7a3c' },
  tide: { name: 'Tide', glyph: '≈', color: '#3fb6ff' },
  leaf: { name: 'Leaf', glyph: '❦', color: '#7ed957' },
  stone: { name: 'Stone', glyph: '◆', color: '#c9a15a' },
};

// kind: 'strike' | 'guard' | 'mend'
// power: damage, shield or healing, before the element bonus.
// cost: ember to play.
const CARD_DEFS = [
  { id: 'spark', name: 'Spark', element: 'flame', kind: 'strike', cost: 1, power: 2 },
  { id: 'ember-bite', name: 'Ember Bite', element: 'flame', kind: 'strike', cost: 2, power: 4 },
  { id: 'flame-lash', name: 'Flame Lash', element: 'flame', kind: 'strike', cost: 3, power: 5 },
  { id: 'wildfire', name: 'Wildfire', element: 'flame', kind: 'strike', cost: 5, power: 8 },
  { id: 'drip', name: 'Drip', element: 'tide', kind: 'strike', cost: 1, power: 2 },
  { id: 'tide-crash', name: 'Tide Crash', element: 'tide', kind: 'strike', cost: 3, power: 5 },
  { id: 'undertow', name: 'Undertow', element: 'tide', kind: 'strike', cost: 4, power: 6 },
  { id: 'thorn', name: 'Thorn', element: 'leaf', kind: 'strike', cost: 1, power: 2 },
  { id: 'vine-whip', name: 'Vine Whip', element: 'leaf', kind: 'strike', cost: 2, power: 3 },
  { id: 'pebble', name: 'Pebble', element: 'stone', kind: 'strike', cost: 1, power: 2 },
  { id: 'stonefall', name: 'Stonefall', element: 'stone', kind: 'strike', cost: 4, power: 6 },
  { id: 'boulder', name: 'Boulder', element: 'stone', kind: 'strike', cost: 5, power: 7 },
  { id: 'kindling', name: 'Kindling', element: 'flame', kind: 'guard', cost: 1, power: 3 },
  { id: 'breakwater', name: 'Breakwater', element: 'tide', kind: 'guard', cost: 2, power: 5 },
  { id: 'barkskin', name: 'Barkskin', element: 'leaf', kind: 'guard', cost: 2, power: 5 },
  { id: 'granite-wall', name: 'Granite Wall', element: 'stone', kind: 'guard', cost: 3, power: 7 },
  { id: 'spring-water', name: 'Spring Water', element: 'tide', kind: 'mend', cost: 2, power: 4 },
  { id: 'sunpetal', name: 'Sunpetal', element: 'leaf', kind: 'mend', cost: 3, power: 6 },
];

export function cardById(id) {
  return CARD_DEFS.find((c) => c.id === id) ?? null;
}

// The element bonus folded into a card's numbers, given the state of
// the table when it is played. Flame strikes gain +1 when the target
// has no shield; Tide strikes pierce 2 shield; Leaf mends and guards
// gain +1; Stone guards gain +1.
export function effectivePower(card, targetShield) {
  let power = card.power;
  if (card.element === 'leaf' && card.kind !== 'strike') power += 1;
  if (card.element === 'stone' && card.kind === 'guard') power += 1;
  if (card.element === 'flame' && card.kind === 'strike' && targetShield <= 0) power += 1;
  return power;
}

export function pierceAmount(card) {
  return card.element === 'tide' && card.kind === 'strike' ? 2 : 0;
}

// A fresh 28-card deck: two copies of the ten cheapest defs plus one
// copy of the eight dearest, so early turns have answers and late
// turns have finishers.
export function buildDeck() {
  const cheap = CARD_DEFS.filter((c) => c.cost <= 2);
  const dear = CARD_DEFS.filter((c) => c.cost >= 3);
  const deck = [];
  for (const card of cheap) deck.push(card.id, card.id);
  for (const card of dear) deck.push(card.id);
  return deck;
}

export function describeCard(card) {
  const el = ELEMENTS[card.element];
  if (card.kind === 'strike') return `${el.glyph} Deal ${card.power} damage`;
  if (card.kind === 'guard') return `${el.glyph} Gain ${card.power} shield`;
  return `${el.glyph} Heal ${card.power} lanterns`;
}
