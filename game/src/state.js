// The rules of Lantern Duel, with no DOM in them.
//
// Two keepers duel with cards. Each has 20 lanterns (life) and ember
// (mana): max ember grows by 1 every one of your turns, to 10, and
// refills at the start of your turn. You draw a card at the start of
// each of your turns. Play cards while you have the ember, then end
// your turn and the rival plays. Shield soaks damage first. When a
// deck runs out, its discard pile is shuffled back in. The first
// keeper to 0 lanterns loses.

import { buildDeck, cardById, effectivePower, pierceAmount } from './cards.js';
import { shuffle } from './random.js';

export const MAX_LANTERNS = 20;
export const MAX_EMBER = 10;
export const MAX_HAND = 7;
export const START_HAND = 4;

export function makeSide(name, title) {
  return {
    name,
    title,
    lanterns: MAX_LANTERNS,
    shield: 0,
    ember: 0,
    maxEmber: 0,
    deck: [],
    discard: [],
    hand: [],
  };
}

export function newGame(rng) {
  const game = {
    player: makeSide('player', 'Lantern Keeper'),
    rival: makeSide('rival', 'Shade Warden'),
    turn: 0,
    phase: 'title', // title | play | won | lost
    active: 'player',
    log: [],
    rng,
  };
  for (const side of [game.player, game.rival]) {
    side.deck = shuffle(buildDeck(), rng);
    drawCards(game, side, START_HAND);
  }
  game.player.maxEmber = 1;
  game.player.ember = 1;
  return game;
}

export function drawCards(game, side, count) {
  for (let i = 0; i < count; i += 1) {
    if (side.deck.length === 0) {
      if (side.discard.length === 0) return;
      side.deck = shuffle(side.discard, game.rng);
      side.discard = [];
    }
    if (side.hand.length >= MAX_HAND) return;
    side.hand.push(side.deck.pop());
  }
}

export function say(game, text) {
  game.log.unshift(text);
  if (game.log.length > 4) game.log.length = 4;
}

// Play the card at handIndex for side. Returns false when it cannot be
// played (wrong phase, not that side's turn, or not enough ember).
export function playCard(game, side, handIndex) {
  if (game.phase !== 'play' || game.active !== side.name) return false;
  const id = side.hand[handIndex];
  if (id === undefined) return false;
  const card = cardById(id);
  if (card === null || side.ember < card.cost) return false;
  const foe = side === game.player ? game.rival : game.player;
  side.ember -= card.cost;
  side.hand.splice(handIndex, 1);
  side.discard.push(id);
  if (card.kind === 'strike') {
    const power = effectivePower(card, foe.shield);
    const pierce = pierceAmount(card);
    const throughShield = Math.max(0, power - pierce);
    const soaked = Math.min(foe.shield, throughShield);
    foe.shield -= soaked;
    foe.lanterns -= power - soaked;
    say(game, `${side.title} played ${card.name}: ${power} damage.`);
  } else if (card.kind === 'guard') {
    const power = effectivePower(card, 0);
    side.shield += power;
    say(game, `${side.title} played ${card.name}: +${power} shield.`);
  } else {
    const power = effectivePower(card, 0);
    side.lanterns = Math.min(MAX_LANTERNS, side.lanterns + power);
    say(game, `${side.title} played ${card.name}: +${power} lanterns.`);
  }
  checkEnd(game);
  return true;
}

export function checkEnd(game) {
  if (game.phase !== 'play') return;
  if (game.rival.lanterns <= 0) {
    game.rival.lanterns = 0;
    game.phase = 'won';
    say(game, 'The Shade Warden is out of lanterns — you win!');
  } else if (game.player.lanterns <= 0) {
    game.player.lanterns = 0;
    game.phase = 'lost';
    say(game, 'Your lanterns are out — the Shade Warden wins.');
  }
}

// End side's turn and start the other side's. Whoever starts gains
// max ember (to 10), refills, and draws one card; the turn count
// ticks up on the player's turns.
export function endTurn(game) {
  if (game.phase !== 'play') return false;
  const next = game.active === 'player' ? game.rival : game.player;
  game.active = next.name;
  if (next === game.player) game.turn += 1;
  next.maxEmber = Math.min(MAX_EMBER, next.maxEmber + 1);
  next.ember = next.maxEmber;
  drawCards(game, next, 1);
  return true;
}

export function startGame(game) {
  game.phase = 'play';
  game.active = 'player';
  game.turn = 1;
  say(game, 'Your turn — play a card, then end your turn.');
}
